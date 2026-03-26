import { db } from "@/lib/db/db";
import { foodLog } from "@/lib/db/schema";
import { sql, eq, and, gte, lt } from 'drizzle-orm';

export interface DailyMacroData {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

// Fetches today's macro totals for the dashboard KPI cards
export async function fetchDailyMacroSummary(userId: string): Promise<DailyMacroData> {
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

// Returns dates (YYYY-MM-DD) within the last N days that have no log entries
export function detectMissingDays(
  data: { date: string }[],
  daysBack: number = 30
): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingDates = new Set(data.map(d => d.date));
  const missingDays: string[] = [];

  for (let i = 1; i <= daysBack; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    if (!existingDates.has(dateStr)) {
      missingDays.push(dateStr);
    }
  }

  return missingDays.sort();
}

// Averages macros over the last 7 days
export function calculateWeeklySummary(data: { date: string; calories: number; protein: number; carbs: number; fat: number }[]) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const weekData = data.filter(d => d.date >= sevenDaysAgoStr);

  if (weekData.length === 0) {
    return { avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0, totalCalories: 0, daysLogged: 0 };
  }

  const totals = weekData.reduce((acc, day) => ({
    calories: acc.calories + day.calories,
    protein: acc.protein + day.protein,
    carbs: acc.carbs + day.carbs,
    fat: acc.fat + day.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return {
    avgCalories: Math.round(totals.calories / weekData.length),
    avgProtein: Math.round(totals.protein / weekData.length),
    avgCarbs: Math.round(totals.carbs / weekData.length),
    avgFat: Math.round(totals.fat / weekData.length),
    totalCalories: totals.calories,
    daysLogged: weekData.length,
  };
}

// Calculates current and longest streak.
// Counts from yesterday if the user hasn't logged yet today — otherwise a
// streak built up over weeks would reset to 0 every morning until first log.
export function calculateStreak(data: { date: string }[]): { currentStreak: number; longestStreak: number } {
  if (data.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const sortedDates = data.map(d => d.date).sort().reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const startFromYesterday = !sortedDates.includes(todayStr) && sortedDates.includes(yesterdayStr);
  if (sortedDates.includes(todayStr) || startFromYesterday) {
    const checkDate = startFromYesterday
      ? new Date(today.getTime() - 24 * 60 * 60 * 1000)
      : new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sortedDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // calculate longest streak from full history
  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const nextDate = sortedDates[i + 1] ? new Date(sortedDates[i + 1]) : null;

    tempStreak++;

    if (nextDate) {
      const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
}

// Macro ratio breakdown using caloric weight (protein/carbs = 4 kcal/g, fat = 9 kcal/g)
export function calculateMacroRatios(data: { date: string; protein: number; carbs: number; fat: number }[]) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const weekData = data.filter(d => d.date >= sevenDaysAgoStr);

  if (weekData.length === 0) return { protein: 0, carbs: 0, fat: 0 };

  const totals = weekData.reduce((acc, day) => ({
    protein: acc.protein + (day.protein * 4),
    carbs: acc.carbs + (day.carbs * 4),
    fat: acc.fat + (day.fat * 9),
  }), { protein: 0, carbs: 0, fat: 0 });

  const totalCals = totals.protein + totals.carbs + totals.fat;

  if (totalCals === 0) return { protein: 0, carbs: 0, fat: 0 };

  return {
    protein: Math.round((totals.protein / totalCals) * 100),
    carbs: Math.round((totals.carbs / totalCals) * 100),
    fat: Math.round((totals.fat / totalCals) * 100),
  };
}

export interface CustomerGrowthData { month: string; count: number; }
export async function fetchCustomerGrowth(userId: string): Promise<CustomerGrowthData[]> { return []; }
