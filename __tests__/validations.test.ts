import { describe, it, expect } from 'vitest';
import {
  GoalSchema,
  MealLogSchema,
  MacroSuggestionSchema,
  HistoricalMealLogSchema,
  GoalAdvisorSchema,
} from '@/lib/validations';

// ─────────────────────────────────────────────────────────────────────────────
// GoalSchema
// ─────────────────────────────────────────────────────────────────────────────

describe('GoalSchema', () => {
  const validGoal = {
    age: 25,
    heightCm: 175,
    currentWeightKg: 75,
    activityLevel: 'moderate' as const,
    calorieGoal: 2000,
    macroProteinG: 150,
    macroFatG: 60,
    macroCarbsG: 200,
  };

  it('passes with valid data', () => {
    expect(() => GoalSchema.parse(validGoal)).not.toThrow();
  });

  it('rejects age below 18', () => {
    const result = GoalSchema.safeParse({ ...validGoal, age: 17 });
    expect(result.success).toBe(false);
  });

  it('rejects calorie goal below 1000', () => {
    const result = GoalSchema.safeParse({ ...validGoal, calorieGoal: 500 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid activity level', () => {
    const result = GoalSchema.safeParse({ ...validGoal, activityLevel: 'extreme' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid activity levels', () => {
    const levels = ['sedentary', 'light', 'moderate', 'very', 'super'] as const;
    levels.forEach(level => {
      const result = GoalSchema.safeParse({ ...validGoal, activityLevel: level });
      expect(result.success).toBe(true);
    });
  });

  it('rejects negative macro values', () => {
    const result = GoalSchema.safeParse({ ...validGoal, macroProteinG: -10 });
    expect(result.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MealLogSchema
// ─────────────────────────────────────────────────────────────────────────────

describe('MealLogSchema', () => {
  const validMeal = {
    mealType: 'BREAKFAST' as const,
    description: 'Oatmeal with berries',
    calories: 350,
    proteinG: 12,
    fatG: 8,
    carbsG: 60,
  };

  it('passes with valid meal data', () => {
    expect(() => MealLogSchema.parse(validMeal)).not.toThrow();
  });

  it('accepts all valid meal types', () => {
    const types = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'SUPPLEMENT'] as const;
    types.forEach(mealType => {
      const result = MealLogSchema.safeParse({ ...validMeal, mealType });
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid meal type', () => {
    const result = MealLogSchema.safeParse({ ...validMeal, mealType: 'BRUNCH' });
    expect(result.success).toBe(false);
  });

  it('rejects empty description', () => {
    const result = MealLogSchema.safeParse({ ...validMeal, description: '' });
    expect(result.success).toBe(false);
  });

  it('rejects description over 200 characters', () => {
    const result = MealLogSchema.safeParse({ ...validMeal, description: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('rejects calories above 10000', () => {
    const result = MealLogSchema.safeParse({ ...validMeal, calories: 10001 });
    expect(result.success).toBe(false);
  });

  it('rejects zero or negative calories', () => {
    const result = MealLogSchema.safeParse({ ...validMeal, calories: 0 });
    expect(result.success).toBe(false);
  });

  it('accepts zero macros (valid for some foods)', () => {
    const result = MealLogSchema.safeParse({ ...validMeal, proteinG: 0, fatG: 0, carbsG: 0 });
    expect(result.success).toBe(true);
  });

  it('rejects negative macro values', () => {
    const result = MealLogSchema.safeParse({ ...validMeal, proteinG: -5 });
    expect(result.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MacroSuggestionSchema
// ─────────────────────────────────────────────────────────────────────────────

describe('MacroSuggestionSchema', () => {
  const validSuggestion = {
    description: 'Grilled chicken with rice',
    calories: 500,
    proteinG: 40,
    fatG: 10,
    carbsG: 60,
  };

  it('passes with valid AI suggestion', () => {
    expect(() => MacroSuggestionSchema.parse(validSuggestion)).not.toThrow();
  });

  it('rejects zero calories', () => {
    const result = MacroSuggestionSchema.safeParse({ ...validSuggestion, calories: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects missing description', () => {
    const { description: _, ...rest } = validSuggestion;
    const result = MacroSuggestionSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HistoricalMealLogSchema
// ─────────────────────────────────────────────────────────────────────────────

describe('HistoricalMealLogSchema', () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const validHistoricalMeal = {
    mealType: 'LUNCH' as const,
    description: 'Chicken salad',
    calories: 400,
    proteinG: 35,
    fatG: 15,
    carbsG: 20,
    targetDate: yesterdayStr,
  };

  it('passes with a valid past date', () => {
    expect(() => HistoricalMealLogSchema.parse(validHistoricalMeal)).not.toThrow();
  });

  it('rejects a future date', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = HistoricalMealLogSchema.safeParse({
      ...validHistoricalMeal,
      targetDate: tomorrow.toISOString().split('T')[0],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const result = HistoricalMealLogSchema.safeParse({
      ...validHistoricalMeal,
      targetDate: '01-01-2024',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a date more than 365 days ago', () => {
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 2);
    const result = HistoricalMealLogSchema.safeParse({
      ...validHistoricalMeal,
      targetDate: oldDate.toISOString().split('T')[0],
    });
    expect(result.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GoalAdvisorSchema
// ─────────────────────────────────────────────────────────────────────────────

describe('GoalAdvisorSchema', () => {
  const validAdvisor = {
    age: 28,
    gender: 'male' as const,
    heightCm: 180,
    currentWeightKg: 80,
    activityLevel: 'moderate' as const,
    goal: 'maintain' as const,
  };

  it('passes with valid advisor data', () => {
    expect(() => GoalAdvisorSchema.parse(validAdvisor)).not.toThrow();
  });

  it('accepts all valid goals', () => {
    const goals = ['lose', 'maintain', 'gain'] as const;
    goals.forEach(goal => {
      const result = GoalAdvisorSchema.safeParse({ ...validAdvisor, goal });
      expect(result.success).toBe(true);
    });
  });

  it('accepts both genders', () => {
    expect(GoalAdvisorSchema.safeParse({ ...validAdvisor, gender: 'male' }).success).toBe(true);
    expect(GoalAdvisorSchema.safeParse({ ...validAdvisor, gender: 'female' }).success).toBe(true);
  });

  it('rejects age below 18', () => {
    const result = GoalAdvisorSchema.safeParse({ ...validAdvisor, age: 16 });
    expect(result.success).toBe(false);
  });

  it('rejects unrealistic height below 100cm', () => {
    const result = GoalAdvisorSchema.safeParse({ ...validAdvisor, heightCm: 50 });
    expect(result.success).toBe(false);
  });

  it('rejects unrealistic weight below 30kg', () => {
    const result = GoalAdvisorSchema.safeParse({ ...validAdvisor, currentWeightKg: 20 });
    expect(result.success).toBe(false);
  });
});
