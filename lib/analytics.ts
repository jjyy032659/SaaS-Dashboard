// lib/analytics.ts
import { db } from "@/lib/db/db";
import { foodLog } from "@/lib/db/schema"; // Use foodLog instead of customers
import { sql, eq, and, gte, lt } from 'drizzle-orm';

// Define the type for the aggregated data the component expects
export interface DailyMacroData {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

/**
 * Fetches and aggregates the user's total macro and calorie consumption for the current day.
 */
export async function fetchDailyMacroSummary(userId: string): Promise<DailyMacroData> {
  // Define today's boundaries for the SQL query
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const result = await db.select({
      total_calories: sql<number>`COALESCE(SUM(${foodLog.calories}), 0)`,
      total_protein: sql<number>`COALESCE(SUM(${foodLog.proteinG}), 0)`,
      total_carbs: sql<number>`COALESCE(SUM(${foodLog.carbsG}), 0)`,
      total_fat: sql<number>`COALESCE(SUM(${foodLog.fatG}), 0)`,
    })
    .from(foodLog)
    .where(
      and(
        eq(foodLog.userId, userId),
        gte(foodLog.loggedAt, today),
        lt(foodLog.loggedAt, tomorrow)
      )
    );

    // Ensure the results are numeric and return the first row (the summary)
    const summary = result[0] || {};

    return {
      total_calories: Math.round(Number(summary.total_calories) || 0),
      total_protein: Math.round(Number(summary.total_protein) || 0),
      total_carbs: Math.round(Number(summary.total_carbs) || 0),
      total_fat: Math.round(Number(summary.total_fat) || 0),
    };
  } catch (e) {
    console.error("Failed to fetch daily macro summary:", e);
    return { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 };
  }
}

// NOTE: We keep a placeholder for the old function to avoid breaking other files if they still exist.
export interface CustomerGrowthData { month: string; count: number; }
export async function fetchCustomerGrowth(userId: string): Promise<CustomerGrowthData[]> { return []; }