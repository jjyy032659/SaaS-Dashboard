// lib/stripe.ts
import Stripe from 'stripe';
import { db } from './db/db';
import { usersProfile } from './db/schema';
import { eq } from 'drizzle-orm';

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
});

// Subscription Plans Configuration
export const PLANS = {
    FREE: {
        name: 'Free',
        price: 0,
        priceId: null, // No Stripe price ID for free tier
        features: [
            'Basic meal logging',
            'Daily macro tracking',
            '30-day analytics',
            'Food library',
            'Limited AI image analysis (5/month)',
        ],
        limits: {
            aiImageAnalysis: 5, // per month
            aiInsights: 0,
            aiGoalAdvisor: 0,
        }
    },
    PREMIUM: {
        name: 'Premium',
        price: 9.99, // $9.99/month
        priceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
        features: [
            'Everything in Free',
            'Unlimited AI image analysis',
            'AI Nutrition Insights',
            'AI Goal Advisor',
            'Advanced analytics',
            'Priority support',
        ],
        limits: {
            aiImageAnalysis: -1, // unlimited
            aiInsights: -1, // unlimited
            aiGoalAdvisor: -1, // unlimited
        }
    }
} as const;

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
    userId: string,
    email: string
): Promise<string> {
    // Check if user already has a Stripe customer ID
    const userProfile = await db.select()
        .from(usersProfile)
        .where(eq(usersProfile.userId, userId))
        .limit(1);

    if (userProfile[0]?.stripeCustomerId) {
        return userProfile[0].stripeCustomerId;
    }

    // Create a new Stripe customer
    const customer = await stripe.customers.create({
        email,
        metadata: {
            userId,
        },
    });

    // Update database with customer ID
    await db.update(usersProfile)
        .set({ stripeCustomerId: customer.id })
        .where(eq(usersProfile.userId, userId));

    return customer.id;
}

/**
 * Check if user has an active premium subscription
 */
export async function getUserSubscriptionStatus(userId: string): Promise<{
    isPremium: boolean;
    status: string;
    currentPeriodEnd?: Date;
}> {
    const userProfile = await db.select()
        .from(usersProfile)
        .where(eq(usersProfile.userId, userId))
        .limit(1);

    if (!userProfile[0]) {
        return { isPremium: false, status: 'free' };
    }

    const user = userProfile[0];
    const isPremium = user.subscriptionStatus === 'active' &&
                     user.stripeCurrentPeriodEnd &&
                     user.stripeCurrentPeriodEnd.getTime() > Date.now();

    return {
        isPremium,
        status: user.subscriptionStatus || 'free',
        currentPeriodEnd: user.stripeCurrentPeriodEnd || undefined,
    };
}

/**
 * Update user subscription status in database
 */
export async function updateUserSubscription(
    userId: string,
    subscriptionData: {
        stripeSubscriptionId: string;
        stripePriceId: string;
        stripeCurrentPeriodEnd: Date;
        subscriptionStatus: string;
    }
) {
    await db.update(usersProfile)
        .set({
            stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
            stripePriceId: subscriptionData.stripePriceId,
            stripeCurrentPeriodEnd: subscriptionData.stripeCurrentPeriodEnd,
            subscriptionStatus: subscriptionData.subscriptionStatus,
        })
        .where(eq(usersProfile.userId, userId));
}

/**
 * Cancel user subscription in database
 */
export async function cancelUserSubscription(userId: string) {
    await db.update(usersProfile)
        .set({
            subscriptionStatus: 'canceled',
        })
        .where(eq(usersProfile.userId, userId));
}
