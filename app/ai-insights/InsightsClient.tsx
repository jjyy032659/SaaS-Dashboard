// app/ai-insights/InsightsClient.tsx
'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface InsightsClientProps {
    monthlyData: Array<{
        date: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    }>;
    goals: {
        calorieGoal: number;
        macroProteinG: number;
        macroCarbsG: number;
        macroFatG: number;
    };
    weeklySummary: {
        avgCalories: number;
        avgProtein: number;
        avgCarbs: number;
        avgFat: number;
        totalCalories: number;
        daysLogged: number;
    };
    streak: {
        currentStreak: number;
        longestStreak: number;
    };
    totalDays: number;
    missingDays: number;
    generateNutritionInsightsAction: (data: any) => Promise<{ success: boolean; insights?: string; message?: string }>;
}

export default function InsightsClient({
    monthlyData,
    goals,
    weeklySummary,
    streak,
    totalDays,
    missingDays,
    generateNutritionInsightsAction,
}: InsightsClientProps) {
    const [insights, setInsights] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

    const handleGenerateInsights = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await generateNutritionInsightsAction({
                monthlyData,
                goals,
                weeklySummary,
                streak,
                totalDays,
                missingDays,
            });

            if (result.success && result.insights) {
                setInsights(result.insights);
                setGeneratedAt(new Date());
            } else {
                setError(result.message || 'Failed to generate insights');
            }
        } catch (e) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-gray-200 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
                    <Sparkles size={28} className="text-purple-600" />
                    Your Personalized Analysis
                </h2>
                {generatedAt && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={16} />
                        <span>
                            Generated {generatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                )}
            </div>

            {!insights && !loading && !error && (
                <div className="text-center py-16">
                    <div className="bg-gradient-to-br from-purple-100 to-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles size={48} className="text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        Ready for AI-Powered Insights?
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Our AI nutrition coach will analyze your 30-day eating patterns, goal adherence,
                        and consistency to provide personalized recommendations tailored just for you.
                    </p>
                    <button
                        onClick={handleGenerateInsights}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
                    >
                        <Sparkles size={24} />
                        Generate AI Insights
                    </button>
                </div>
            )}

            {loading && (
                <div className="text-center py-16">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 border-8 border-purple-200 rounded-full"></div>
                        <div className="absolute inset-0 border-8 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                        <Sparkles size={32} className="absolute inset-0 m-auto text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Analyzing Your Nutrition Data...
                    </h3>
                    <p className="text-gray-600">
                        Our AI coach is reviewing your 30-day trends and preparing personalized insights
                    </p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                    <AlertCircle size={48} className="mx-auto mb-4 text-red-600" />
                    <h3 className="text-xl font-bold text-red-800 mb-2">
                        Unable to Generate Insights
                    </h3>
                    <p className="text-red-700 mb-6">{error}</p>
                    <button
                        onClick={handleGenerateInsights}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw size={20} />
                        Try Again
                    </button>
                </div>
            )}

            {insights && !loading && (
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle2 size={24} className="text-green-600 flex-shrink-0" />
                        <p className="text-green-800 font-medium">
                            Analysis complete! Review your personalized insights below.
                        </p>
                    </div>

                    <div className="prose prose-lg max-w-none">
                        <ReactMarkdown
                            components={{
                                h2: ({ node, ...props }) => (
                                    <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800 border-b-2 border-purple-200 pb-2" {...props} />
                                ),
                                h3: ({ node, ...props }) => (
                                    <h3 className="text-xl font-bold mt-6 mb-3 text-gray-700" {...props} />
                                ),
                                p: ({ node, ...props }) => (
                                    <p className="text-gray-700 leading-relaxed mb-4" {...props} />
                                ),
                                ul: ({ node, ...props }) => (
                                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700" {...props} />
                                ),
                                ol: ({ node, ...props }) => (
                                    <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700" {...props} />
                                ),
                                li: ({ node, ...props }) => (
                                    <li className="ml-4" {...props} />
                                ),
                                strong: ({ node, ...props }) => (
                                    <strong className="font-bold text-gray-900" {...props} />
                                ),
                                em: ({ node, ...props }) => (
                                    <em className="italic text-gray-800" {...props} />
                                ),
                            }}
                        >
                            {insights}
                        </ReactMarkdown>
                    </div>

                    <div className="pt-6 border-t-2 border-gray-200 flex justify-center">
                        <button
                            onClick={handleGenerateInsights}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <RefreshCw size={20} />
                            Regenerate Insights
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
