// app/ai-insights/page.tsx

import { db } from "@/lib/db/db";
import { foodLog, usersProfile } from "@/lib/db/schema";
import { auth } from '@clerk/nextjs/server';
import { sql, eq, and, gte } from 'drizzle-orm';
import { Sparkles, TrendingUp, Brain, LogIn } from 'lucide-react';
import { calculateWeeklySummary, calculateStreak } from '@/lib/analytics';
import InsightsClient from './InsightsClient';
import { generateNutritionInsightsAction } from '@/lib/actions';

// Define the type for monthly trend data
interface DailyMacroTrend {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

/**
 * Fetches daily macro totals for the last 30 days for a single user.
 */
async function fetchMonthlyMacroTrend(userId: string): Promise<DailyMacroTrend[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    try {
        const result = await db.select({
            date: sql<string>`TO_CHAR(${foodLog.loggedAt}, 'YYYY-MM-DD')`,
            calories: sql<number>`COALESCE(SUM(${foodLog.calories}), 0)`,
            protein: sql<number>`COALESCE(SUM(${foodLog.proteinG}), 0)`,
            carbs: sql<number>`COALESCE(SUM(${foodLog.carbsG}), 0)`,
            fat: sql<number>`COALESCE(SUM(${foodLog.fatG}), 0)`,
        })
        .from(foodLog)
        .where(
            and(
                eq(foodLog.userId, userId),
                gte(foodLog.loggedAt, thirtyDaysAgo)
            )
        )
        .groupBy(sql`TO_CHAR(${foodLog.loggedAt}, 'YYYY-MM-DD')`)
        .orderBy(sql`TO_CHAR(${foodLog.loggedAt}, 'YYYY-MM-DD')`);

        return result.map(item => ({
            date: item.date,
            calories: Math.round(Number(item.calories)),
            protein: Math.round(Number(item.protein)),
            carbs: Math.round(Number(item.carbs)),
            fat: Math.round(Number(item.fat)),
        }));

    } catch (e) {
        console.error("Failed to fetch monthly macro trend:", e);
        return [];
    }
}

export default async function AIInsightsPage() {
    const { userId } = await auth();

    if (!userId) {
        return (
            <div className="p-8 text-center text-red-600">
                Please <LogIn className="inline h-4 w-4 mr-1" /> sign in to view AI insights.
            </div>
        );
    }

    // Fetch monthly trend data and user goals
    const [monthlyData, userGoals] = await Promise.all([
        fetchMonthlyMacroTrend(userId),
        db.select().from(usersProfile).where(eq(usersProfile.userId, userId)).limit(1),
    ]);

    const goals = userGoals[0];

    // Check if user has set goals
    if (!goals) {
        return (
            <div className="p-6 md:p-10 max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-2xl border-2 border-purple-200 text-center">
                    <Brain size={64} className="mx-auto mb-4 text-purple-600" />
                    <h1 className="text-3xl font-bold mb-3 text-gray-800">AI Nutrition Insights</h1>
                    <p className="text-lg text-gray-600 mb-6">
                        Please set your nutrition goals first to receive personalized AI insights.
                    </p>
                    <a
                        href="/settings"
                        className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                        Set Goals in Settings
                    </a>
                </div>
            </div>
        );
    }

    // Check if user has enough data
    if (monthlyData.length === 0) {
        return (
            <div className="p-6 md:p-10 max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-2xl border-2 border-purple-200 text-center">
                    <Sparkles size={64} className="mx-auto mb-4 text-purple-600" />
                    <h1 className="text-3xl font-bold mb-3 text-gray-800">AI Nutrition Insights</h1>
                    <p className="text-lg text-gray-600 mb-6">
                        You need to log at least a few days of meals to generate AI insights.
                    </p>
                    <a
                        href="/log-meal"
                        className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                        Start Logging Meals
                    </a>
                </div>
            </div>
        );
    }

    // Calculate metrics
    const weeklySummary = calculateWeeklySummary(monthlyData);
    const streak = calculateStreak(monthlyData);
    const totalDays = monthlyData.length;
    const missingDays = 30 - totalDays;

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 p-6 md:p-8 rounded-2xl border-2 border-purple-200 shadow-lg">
                <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3 text-gray-800">
                    <Brain size={36} className="text-purple-600" />
                    AI Nutrition Coach
                </h1>
                <p className="text-gray-600 text-lg">
                    Get personalized insights and recommendations based on your 30-day nutrition trends
                </p>
            </div>

            {/* Key Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-md">
                    <p className="text-sm text-gray-600 mb-1">Days Tracked</p>
                    <p className="text-3xl font-bold text-blue-900">{totalDays}/30</p>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-md">
                    <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                    <p className="text-3xl font-bold text-orange-900">{streak.currentStreak}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-md">
                    <p className="text-sm text-gray-600 mb-1">Avg Calories</p>
                    <p className="text-3xl font-bold text-green-900">{weeklySummary.avgCalories}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-md">
                    <p className="text-sm text-gray-600 mb-1">Avg Protein</p>
                    <p className="text-3xl font-bold text-purple-900">{weeklySummary.avgProtein}g</p>
                </div>
            </div>

            {/* AI Insights Section */}
            <InsightsClient
                monthlyData={monthlyData}
                goals={goals}
                weeklySummary={weeklySummary}
                streak={streak}
                totalDays={totalDays}
                missingDays={missingDays}
                generateNutritionInsightsAction={generateNutritionInsightsAction}
            />
        </div>
    );
}
