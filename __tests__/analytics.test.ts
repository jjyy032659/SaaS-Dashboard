import { describe, it, expect } from 'vitest';
import {
  detectMissingDays,
  calculateWeeklySummary,
  calculateStreak,
  calculateMacroRatios,
} from '@/lib/analytics';

// Helper: generate a YYYY-MM-DD date string N days ago
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// detectMissingDays
// ─────────────────────────────────────────────────────────────────────────────

describe('detectMissingDays', () => {
  it('returns 30 missing days when no data is provided', () => {
    const result = detectMissingDays([]);
    expect(result).toHaveLength(30);
  });

  it('returns 0 missing days when all days are present', () => {
    const allDays = Array.from({ length: 30 }, (_, i) => ({ date: daysAgo(i + 1) }));
    const result = detectMissingDays(allDays);
    expect(result).toHaveLength(0);
  });

  it('returns correct missing days when some days have data', () => {
    // Provide data for days 1, 3, 5 ago — missing 2, 4, and days 6–30
    const data = [
      { date: daysAgo(1) },
      { date: daysAgo(3) },
      { date: daysAgo(5) },
    ];
    const result = detectMissingDays(data, 5);
    expect(result).toHaveLength(2);
    expect(result).toContain(daysAgo(2));
    expect(result).toContain(daysAgo(4));
  });

  it('returns results in chronological (ascending) order', () => {
    const result = detectMissingDays([]);
    expect(result).toEqual([...result].sort());
  });

  it('respects the daysBack parameter', () => {
    const result = detectMissingDays([], 7);
    expect(result).toHaveLength(7);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateWeeklySummary
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateWeeklySummary', () => {
  it('returns all zeros when data is empty', () => {
    const result = calculateWeeklySummary([]);
    expect(result).toEqual({
      avgCalories: 0,
      avgProtein: 0,
      avgCarbs: 0,
      avgFat: 0,
      totalCalories: 0,
      daysLogged: 0,
    });
  });

  it('calculates correct averages from last 7 days', () => {
    const data = [
      { date: daysAgo(1), calories: 2000, protein: 150, carbs: 200, fat: 70 },
      { date: daysAgo(2), calories: 1800, protein: 130, carbs: 180, fat: 60 },
      { date: daysAgo(3), calories: 2200, protein: 170, carbs: 220, fat: 80 },
    ];
    const result = calculateWeeklySummary(data);
    expect(result.daysLogged).toBe(3);
    expect(result.avgCalories).toBe(Math.round((2000 + 1800 + 2200) / 3));
    expect(result.avgProtein).toBe(Math.round((150 + 130 + 170) / 3));
    expect(result.totalCalories).toBe(6000);
  });

  it('ignores data older than 7 days', () => {
    const data = [
      { date: daysAgo(10), calories: 9999, protein: 999, carbs: 999, fat: 999 },
    ];
    const result = calculateWeeklySummary(data);
    expect(result.daysLogged).toBe(0);
    expect(result.avgCalories).toBe(0);
  });

  it('handles a single day correctly', () => {
    const data = [{ date: daysAgo(1), calories: 2000, protein: 150, carbs: 200, fat: 70 }];
    const result = calculateWeeklySummary(data);
    expect(result.avgCalories).toBe(2000);
    expect(result.daysLogged).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateStreak
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateStreak', () => {
  it('returns zeros when data is empty', () => {
    expect(calculateStreak([])).toEqual({ currentStreak: 0, longestStreak: 0 });
  });

  it('counts a current streak starting from today', () => {
    const data = [
      { date: daysAgo(0) }, // today
      { date: daysAgo(1) },
      { date: daysAgo(2) },
    ];
    const result = calculateStreak(data);
    expect(result.currentStreak).toBe(3);
  });

  it('counts a current streak starting from yesterday', () => {
    const data = [
      { date: daysAgo(1) }, // yesterday
      { date: daysAgo(2) },
      { date: daysAgo(3) },
    ];
    const result = calculateStreak(data);
    expect(result.currentStreak).toBe(3);
  });

  it('returns 0 current streak if last entry is 2+ days ago', () => {
    const data = [{ date: daysAgo(3) }, { date: daysAgo(4) }];
    const result = calculateStreak(data);
    expect(result.currentStreak).toBe(0);
  });

  it('calculates the longest streak correctly', () => {
    const data = [
      { date: daysAgo(10) },
      { date: daysAgo(11) },
      { date: daysAgo(12) }, // 3-day streak
      { date: daysAgo(20) },
      { date: daysAgo(21) }, // 2-day streak
    ];
    const result = calculateStreak(data);
    expect(result.longestStreak).toBeGreaterThanOrEqual(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateMacroRatios
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateMacroRatios', () => {
  it('returns all zeros when data is empty', () => {
    expect(calculateMacroRatios([])).toEqual({ protein: 0, carbs: 0, fat: 0 });
  });

  it('returns all zeros when data is older than 7 days', () => {
    const data = [{ date: daysAgo(10), protein: 100, carbs: 200, fat: 50 }];
    expect(calculateMacroRatios(data)).toEqual({ protein: 0, carbs: 0, fat: 0 });
  });

  it('calculates correct percentages using caloric values (4/4/9 kcal per gram)', () => {
    // 100g protein = 400 kcal, 100g carbs = 400 kcal, 0g fat = 0 kcal → 50/50/0
    const data = [{ date: daysAgo(1), protein: 100, carbs: 100, fat: 0 }];
    const result = calculateMacroRatios(data);
    expect(result.protein).toBe(50);
    expect(result.carbs).toBe(50);
    expect(result.fat).toBe(0);
  });

  it('ratios sum to approximately 100%', () => {
    const data = [{ date: daysAgo(1), protein: 150, carbs: 200, fat: 70 }];
    const result = calculateMacroRatios(data);
    const sum = result.protein + result.carbs + result.fat;
    // Allow ±2 for rounding
    expect(sum).toBeGreaterThanOrEqual(98);
    expect(sum).toBeLessThanOrEqual(102);
  });

  it('gives fat a higher caloric weight (9 kcal/g vs 4 kcal/g for protein/carbs)', () => {
    // Equal grams of fat vs protein — fat should have a higher % because 9 kcal/g
    const data = [{ date: daysAgo(1), protein: 100, carbs: 0, fat: 100 }];
    const result = calculateMacroRatios(data);
    expect(result.fat).toBeGreaterThan(result.protein);
  });
});
