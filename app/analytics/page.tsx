// app/analytics/page.tsx

import { db } from "@/lib/db/db";
import { foodLog, usersProfile } from "@/lib/db/schema";
import { auth } from '@clerk/nextjs/server';
import { sql, eq, and, gte } from 'drizzle-orm';
import { LineChart, TrendingUp, CalendarDays, LogIn, Target, Award, PieChartIcon, BarChart3, Sparkles, Brain } from 'lucide-react';
import { MacroTrendChart } from '../components/MacroTrendChart';
import { MacroPieChart } from '../components/MacroPieChart';
import { GoalProgressBars } from '../components/GoalProgressBars';
import { ActualVsGoalChart } from '../components/ActualVsGoalChart';
import AnalyticsClient from './AnalyticsClient';
import { detectMissingDays, calculateWeeklySummary, calculateStreak, calculateMacroRatios } from '@/lib/analytics';
import { logHistoricalMealAction, analyzeImageAction } from '@/lib/actions';


// Define the type for the aggregated data the component expects
interface DailyMacroTrend {
  date: string; // YYYY-MM-DD
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// =========================================================================
// DATA FETCHING FUNCTIONS (Server-side)
// =========================================================================

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

// =========================================================================
// MAIN SERVER COMPONENT
// =========================================================================

export default async function AnalyticsPage() {
    const { userId } = await auth();

    if (!userId) {
        return (
            <div className="p-8 text-center text-red-600">
                Please <LogIn className="inline h-4 w-4 mr-1" /> sign in to view analytics.
            </div>
        );
    }

    // Fetch monthly trend data and user goals
    const [monthlyData, userGoals] = await Promise.all([
        fetchMonthlyMacroTrend(userId),
        db.select().from(usersProfile).where(eq(usersProfile.userId, userId)).limit(1),
    ]);

    const goals = userGoals[0];
    const missingDays = detectMissingDays(monthlyData, 30);
    const totalDays = monthlyData.length;

    // Calculate enhanced metrics
    const weeklySummary = calculateWeeklySummary(monthlyData);
    const streak = calculateStreak(monthlyData);
    const macroRatios = calculateMacroRatios(monthlyData);

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 md:p-8 rounded-2xl border border-blue-200">
                <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3 text-gray-800">
                    <TrendingUp size={36} className="text-blue-600" />
                    Long-Term Nutrition Analysis
                </h1>
                <p className="text-gray-600 text-lg">
                    Track your macro and calorie trends over the last 30 days
                </p>
            </div>

            {/* AI Insights Promotion Banner */}
            {goals && monthlyData.length > 0 && (
                <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6 md:p-8 rounded-2xl border-2 border-purple-300 shadow-2xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-white/20 p-3 rounded-xl">
                                <Brain size={32} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                    <Sparkles size={24} />
                                    Get AI-Powered Nutrition Insights
                                </h3>
                                <p className="text-purple-100 text-lg">
                                    Let our AI coach analyze your 30-day trends and provide personalized recommendations
                                </p>
                            </div>
                        </div>
                        <a
                            href="/ai-insights"
                            className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
                        >
                            <Sparkles size={20} />
                            View AI Insights
                        </a>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-700 mb-2">Total Tracking Days</p>
                            <p className="text-4xl font-bold text-blue-900">{totalDays}</p>
                            <p className="text-xs text-blue-600 mt-1">in the last 30 days</p>
                        </div>
                        <CalendarDays className="text-blue-500" size={40} />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border-2 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-orange-700 mb-2">Current Streak</p>
                            <p className="text-4xl font-bold text-orange-900">{streak.currentStreak} 🔥</p>
                            <p className="text-xs text-orange-600 mt-1">Best: {streak.longestStreak} days</p>
                        </div>
                        <Award className="text-orange-500" size={40} />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-700 mb-2">Missing Days</p>
                            <p className="text-4xl font-bold text-green-900">{missingDays.length}</p>
                            <p className="text-xs text-green-600 mt-1">need backfill</p>
                        </div>
                        <div className="text-green-500 text-4xl">📊</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-700 mb-2">Completion Rate</p>
                            <p className="text-4xl font-bold text-purple-900">
                                {Math.round((totalDays / 30) * 100)}%
                            </p>
                            <p className="text-xs text-purple-600 mt-1">of 30 days logged</p>
                        </div>
                        <div className="text-purple-500 text-4xl">✓</div>
                    </div>
                </div>
            </div>

            {/* Weekly Summary & Goal Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Summary */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-gray-200 shadow-xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-gray-800 pb-4 border-b-2 border-gray-200">
                        <CalendarDays size={24} className="text-blue-600" />
                        Weekly Summary (Last 7 Days)
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <p className="text-sm text-blue-700 font-medium mb-1">Avg Calories</p>
                            <p className="text-3xl font-bold text-blue-900">{weeklySummary.avgCalories}</p>
                            <p className="text-xs text-blue-600 mt-1">per day</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                            <p className="text-sm text-green-700 font-medium mb-1">Avg Protein</p>
                            <p className="text-3xl font-bold text-green-900">{weeklySummary.avgProtein}g</p>
                            <p className="text-xs text-green-600 mt-1">per day</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                            <p className="text-sm text-purple-700 font-medium mb-1">Avg Carbs</p>
                            <p className="text-3xl font-bold text-purple-900">{weeklySummary.avgCarbs}g</p>
                            <p className="text-xs text-purple-600 mt-1">per day</p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                            <p className="text-sm text-amber-700 font-medium mb-1">Avg Fat</p>
                            <p className="text-3xl font-bold text-amber-900">{weeklySummary.avgFat}g</p>
                            <p className="text-xs text-amber-600 mt-1">per day</p>
                        </div>
                    </div>
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                        <p className="text-sm text-gray-700">
                            <span className="font-bold">Total:</span> {weeklySummary.totalCalories.toLocaleString()} calories over {weeklySummary.daysLogged} days
                        </p>
                    </div>
                </div>

                {/* Goal Progress */}
                {goals && (
                    <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-gray-200 shadow-xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-800 pb-4 border-b-2 border-gray-200">
                            <Target size={24} className="text-green-600" />
                            Weekly Avg vs Daily Goals
                        </h2>
                        <GoalProgressBars
                            calories={{
                                actual: weeklySummary.avgCalories,
                                goal: goals.calorieGoal,
                                label: 'Calories',
                                color: 'text-red-600',
                                unit: ' kcal',
                            }}
                            protein={{
                                actual: weeklySummary.avgProtein,
                                goal: goals.macroProteinG,
                                label: 'Protein',
                                color: 'text-green-600',
                                unit: 'g',
                            }}
                            carbs={{
                                actual: weeklySummary.avgCarbs,
                                goal: goals.macroCarbsG,
                                label: 'Carbs',
                                color: 'text-blue-600',
                                unit: 'g',
                            }}
                            fat={{
                                actual: weeklySummary.avgFat,
                                goal: goals.macroFatG,
                                label: 'Fat',
                                color: 'text-amber-600',
                                unit: 'g',
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Macro Distribution & Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Macro Ratio Pie Chart */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-gray-200 shadow-xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-gray-800 pb-4 border-b-2 border-gray-200">
                        <PieChartIcon size={24} className="text-purple-600" />
                        Macro Distribution (Last 7 Days)
                    </h2>
                    <MacroPieChart
                        protein={macroRatios.protein}
                        carbs={macroRatios.carbs}
                        fat={macroRatios.fat}
                    />
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                            <p className="text-xs text-green-700">Protein</p>
                            <p className="text-lg font-bold text-green-900">{macroRatios.protein}%</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-700">Carbs</p>
                            <p className="text-lg font-bold text-blue-900">{macroRatios.carbs}%</p>
                        </div>
                        <div className="text-center p-2 bg-amber-50 rounded-lg">
                            <p className="text-xs text-amber-700">Fat</p>
                            <p className="text-lg font-bold text-amber-900">{macroRatios.fat}%</p>
                        </div>
                    </div>
                </div>

                {/* Actual vs Goal Comparison */}
                {goals && (
                    <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-gray-200 shadow-xl">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-gray-800 pb-4 border-b-2 border-gray-200">
                            <BarChart3 size={24} className="text-blue-600" />
                            Weekly Average vs Goals
                        </h2>
                        <ActualVsGoalChart
                            avgCalories={weeklySummary.avgCalories}
                            avgProtein={weeklySummary.avgProtein}
                            avgCarbs={weeklySummary.avgCarbs}
                            avgFat={weeklySummary.avgFat}
                            goalCalories={goals.calorieGoal}
                            goalProtein={goals.macroProteinG}
                            goalCarbs={goals.macroCarbsG}
                            goalFat={goals.macroFatG}
                        />
                    </div>
                )}
            </div>

            {/* Macro Trend Chart Area */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 pb-4 border-b-2 border-gray-200">
                    <LineChart size={28} className="text-blue-600" />
                    Daily Macro Trend (Last 30 Days)
                </h2>
                {monthlyData.length > 0 ? (
                    <div className="min-h-[600px]">
                        <AnalyticsClient
                            monthlyData={monthlyData}
                            missingDays={missingDays}
                            logHistoricalMealAction={logHistoricalMealAction}
                            analyzeImageAction={analyzeImageAction}
                        />
                    </div>
                ) : (
                    <div className="text-center py-32 text-gray-500">
                        <div className="text-6xl mb-4">📊</div>
                        <p className="text-xl font-semibold mb-2">No Data Available</p>
                        <p className="text-gray-400">No food log data available in the last 30 days to generate charts.</p>
                    </div>
                )}
            </div>
        </div>
    );
}