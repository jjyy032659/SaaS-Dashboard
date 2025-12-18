// app/ui/SubscriptionBadge.tsx

import { auth } from '@clerk/nextjs/server';
import { getUserSubscriptionStatus } from '@/lib/stripe';
import { Crown, Zap } from 'lucide-react';
import Link from 'next/link';

export default async function SubscriptionBadge() {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    const subscriptionStatus = await getUserSubscriptionStatus(userId);

    if (subscriptionStatus.isPremium) {
        return (
            <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
                <Crown size={16} className="text-amber-300" />
                Premium
            </Link>
        );
    }

    return (
        <Link
            href="/pricing"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-all border border-gray-300"
        >
            <Zap size={16} className="text-blue-600" />
            Free
        </Link>
    );
}
