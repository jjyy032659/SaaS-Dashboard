// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe, updateUserSubscription, cancelUserSubscription } from '@/lib/stripe';
import { db } from '@/lib/db/db';
import { usersProfile } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not set');
        }

        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Webhook signature verification failed:', message);
        return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                // Subscription successfully created
                const subscription = await stripe.subscriptions.retrieve(
                    session.subscription as string
                ) as Stripe.Subscription;

                const userId = session.metadata?.userId;
                if (!userId) {
                    throw new Error('No userId in metadata');
                }

                const periodEnd = subscription.current_period_end;
                await updateUserSubscription(userId, {
                    stripeSubscriptionId: subscription.id,
                    stripePriceId: subscription.items.data[0].price.id,
                    stripeCurrentPeriodEnd: new Date(periodEnd * 1000),
                    subscriptionStatus: 'active',
                });

                console.log(`✅ Subscription created for user ${userId}`);
                break;
            }

            case 'invoice.payment_succeeded': {
                // Payment successful - renew subscription
                const subscription = await stripe.subscriptions.retrieve(
                    session.subscription as string
                ) as Stripe.Subscription;

                // Find user by subscription ID
                const userProfile = await db.select()
                    .from(usersProfile)
                    .where(eq(usersProfile.stripeSubscriptionId, subscription.id))
                    .limit(1);

                if (userProfile[0]) {
                    const periodEnd = subscription.current_period_end;
                    await updateUserSubscription(userProfile[0].userId, {
                        stripeSubscriptionId: subscription.id,
                        stripePriceId: subscription.items.data[0].price.id,
                        stripeCurrentPeriodEnd: new Date(periodEnd * 1000),
                        subscriptionStatus: 'active',
                    });

                    console.log(`✅ Subscription renewed for user ${userProfile[0].userId}`);
                }
                break;
            }

            case 'invoice.payment_failed': {
                // Payment failed
                const subscription = await stripe.subscriptions.retrieve(
                    session.subscription as string
                ) as Stripe.Subscription;

                const userProfile = await db.select()
                    .from(usersProfile)
                    .where(eq(usersProfile.stripeSubscriptionId, subscription.id))
                    .limit(1);

                if (userProfile[0]) {
                    await db.update(usersProfile)
                        .set({ subscriptionStatus: 'past_due' })
                        .where(eq(usersProfile.userId, userProfile[0].userId));

                    console.log(`⚠️ Payment failed for user ${userProfile[0].userId}`);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                // Subscription canceled
                const subscription = event.data.object as Stripe.Subscription;

                const userProfile = await db.select()
                    .from(usersProfile)
                    .where(eq(usersProfile.stripeSubscriptionId, subscription.id))
                    .limit(1);

                if (userProfile[0]) {
                    await cancelUserSubscription(userProfile[0].userId);
                    console.log(`❌ Subscription canceled for user ${userProfile[0].userId}`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                // Subscription updated (plan change, renewal, etc.)
                const subscription = event.data.object as Stripe.Subscription;

                const userProfile = await db.select()
                    .from(usersProfile)
                    .where(eq(usersProfile.stripeSubscriptionId, subscription.id))
                    .limit(1);

                if (userProfile[0]) {
                    const periodEnd = subscription.current_period_end;
                    await updateUserSubscription(userProfile[0].userId, {
                        stripeSubscriptionId: subscription.id,
                        stripePriceId: subscription.items.data[0].price.id,
                        stripeCurrentPeriodEnd: new Date(periodEnd * 1000),
                        subscriptionStatus: subscription.status,
                    });

                    console.log(`🔄 Subscription updated for user ${userProfile[0].userId}`);
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return new NextResponse('Webhook handler failed', { status: 500 });
    }
}
