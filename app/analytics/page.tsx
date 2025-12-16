// app/analytics/page.tsx

import { db } from "@/lib/db/db";
import { foodLog } from "@/lib/db/schema";
import { auth } from '@clerk/nextjs/server';
import { sql, eq, and, gte } from 'drizzle-orm';
import { LineChart, TrendingUp, CalendarDays, LogIn } from 'lucide-react';
import { MacroTrendChart } from '../components/MacroTrendChart';


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
    
    const monthlyData = await fetchMonthlyMacroTrend(userId);
    const totalDays = monthlyData.length;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <TrendingUp size={30} /> Long-Term Nutrition Analysis
            </h1>
            <p className="text-gray-600 mb-8">
                View your macro and calorie trends over the last 30 days.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl border shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Total Tracking Days</p>
                        <p className="text-3xl font-bold">{totalDays}</p>
                    </div>
                    <CalendarDays className="text-blue-500" size={32} />
                </div>
                {/* ... other KPIs can be added here ... */}
            </div>

            {/* Macro Trend Chart Area */}
            <div className="bg-white p-6 rounded-xl border shadow-lg h-[500px]">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <LineChart size={20} /> Daily Macro Trend (Last 30 Days)
                </h2>
                {monthlyData.length > 0 ? (
                    // NEW: Render the chart component
                    <MacroTrendChart data={monthlyData} />
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        No food log data available in the last 30 days to generate charts.
                    </div>
                )}
            </div>
        </div>
    );
}