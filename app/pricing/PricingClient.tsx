// app/pricing/PricingClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface PricingClientProps {
    isAuthenticated: boolean;
    createCheckoutSession: () => Promise<{ url?: string; error?: string }>;
}

export default function PricingClient({
    isAuthenticated,
    createCheckoutSession,
}: PricingClientProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleUpgrade = async () => {
        if (!isAuthenticated) {
            // Redirect to sign in page
            router.push('/sign-in?redirect_url=/pricing');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const result = await createCheckoutSession();

            if (result.error) {
                setError(result.error);
                setLoading(false);
                return;
            }

            if (result.url) {
                // Redirect to Stripe checkout
                window.location.href = result.url;
            } else {
                setError('Failed to create checkout session');
                setLoading(false);
            }
        } catch (err) {
            console.error('Error creating checkout session:', err);
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Redirecting...
                    </>
                ) : (
                    'Upgrade to Premium'
                )}
            </button>

            {error && (
                <p className="mt-2 text-sm text-red-200 text-center">
                    {error}
                </p>
            )}
        </div>
    );
}
