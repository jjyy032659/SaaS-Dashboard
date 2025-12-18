// app/pricing/page.tsx
import { auth } from '@clerk/nextjs/server';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { PLANS } from '@/lib/stripe';
import PricingClient from './PricingClient';
import { createCheckoutSession } from '@/lib/actions';

export default async function PricingPage() {
    const { userId } = await auth();

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Choose Your Plan
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Start free and upgrade anytime to unlock AI-powered nutrition insights
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Free Plan */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <Zap size={28} className="text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">{PLANS.FREE.name}</h2>
                    </div>

                    <div className="mb-6">
                        <p className="text-5xl font-bold text-gray-900">
                            ${PLANS.FREE.price}
                        </p>
                        <p className="text-gray-600 mt-2">Forever free</p>
                    </div>

                    <ul className="space-y-3 mb-8">
                        {PLANS.FREE.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        disabled
                        className="w-full bg-gray-200 text-gray-500 px-6 py-3 rounded-xl font-bold cursor-not-allowed"
                    >
                        Current Plan
                    </button>
                </div>

                {/* Premium Plan */}
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-shadow relative">
                    {/* Popular Badge */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-amber-400 text-amber-900 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                            <Crown size={16} />
                            MOST POPULAR
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white/20 p-3 rounded-xl">
                            <Sparkles size={28} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">{PLANS.PREMIUM.name}</h2>
                    </div>

                    <div className="mb-6">
                        <p className="text-5xl font-bold text-white">
                            ${PLANS.PREMIUM.price}
                        </p>
                        <p className="text-purple-100 mt-2">per month</p>
                    </div>

                    <ul className="space-y-3 mb-8">
                        {PLANS.PREMIUM.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <Check size={20} className="text-green-300 flex-shrink-0 mt-0.5" />
                                <span className="text-white">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <PricingClient
                        isAuthenticated={!!userId}
                        createCheckoutSession={createCheckoutSession}
                    />
                </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-16 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            Can I cancel anytime?
                        </h3>
                        <p className="text-gray-600">
                            Yes! You can cancel your subscription at any time. You'll continue to have access
                            until the end of your current billing period.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            What happens to my data if I downgrade?
                        </h3>
                        <p className="text-gray-600">
                            All your meal logs and data are saved forever. You'll just lose access to premium
                            AI features until you upgrade again.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            How does the AI work?
                        </h3>
                        <p className="text-gray-600">
                            We use Google's Gemini AI to analyze your nutrition data, recognize food from photos,
                            and provide personalized recommendations based on proven nutrition science.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
