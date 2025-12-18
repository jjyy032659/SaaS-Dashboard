// lib/validations.ts
import { z } from 'zod';

// Define the shape of the data for Goal Setting (existing)
export const GoalSchema = z.object({
  // Biometrics
  age: z.number().int().positive().min(18, { message: "Must be 18 or older." }),
  heightCm: z.number().int().positive().min(50, { message: "Height is required." }),
  currentWeightKg: z.number().positive().min(10, { message: "Weight is required." }),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'very', 'super'], {
    errorMap: () => ({ message: "Please select an activity level." }),
  }),
  // Goals
  calorieGoal: z.number().int().positive().min(1000, { message: "Goal must be at least 1000 kcal." }),
  macroProteinG: z.number().int().min(0, { message: "Protein goal is required." }),
  macroFatG: z.number().int().min(0, { message: "Fat goal is required." }),
  macroCarbsG: z.number().int().min(0, { message: "Carbs goal is required." }),
});

// Define the shape of the data for Meal Logging (existing)
export const MealLogSchema = z.object({
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'SUPPLEMENT'], {
    errorMap: () => ({ message: "Please select a valid meal type." }),
  }),
  description: z.string()
    .min(1, { message: "Description is required." })
    .max(200, { message: "Description must be less than 200 characters." }),
  calories: z.number()
    .int({ message: "Calories must be a whole number." })
    .positive({ message: "Calories must be greater than 0." })
    .max(10000, { message: "Calories seem unusually high. Please verify." }),
  proteinG: z.number()
    .int({ message: "Protein must be a whole number." })
    .min(0, { message: "Protein cannot be negative." })
    .max(1000, { message: "Protein value seems unusually high." }),
  fatG: z.number()
    .int({ message: "Fat must be a whole number." })
    .min(0, { message: "Fat cannot be negative." })
    .max(1000, { message: "Fat value seems unusually high." }),
  carbsG: z.number()
    .int({ message: "Carbs must be a whole number." })
    .min(0, { message: "Carbs cannot be negative." })
    .max(1000, { message: "Carbs value seems unusually high." }),
});

// =========================================================================
// NEW: AI STRUCTURED OUTPUT SCHEMA
// =========================================================================
export const MacroSuggestionSchema = z.object({
    description: z.string().describe("A concise description of the meal."),
    calories: z.number().int().min(1).describe("Total calories (kcal)."),
    proteinG: z.number().int().min(0).describe("Total protein (g)."),
    fatG: z.number().int().min(0).describe("Total fat (g)."),
    carbsG: z.number().int().min(0).describe("Total carbohydrates (g)."),
});


// =========================================================================
// NEW: HISTORICAL MEAL LOG SCHEMA (for backfilling missing days)
// =========================================================================
export const HistoricalMealLogSchema = MealLogSchema.extend({
  targetDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in YYYY-MM-DD format" })
    .refine((date) => {
      const d = new Date(date);
      const now = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);

      return d < now && d >= oneYearAgo;
    }, { message: "Date must be within the last 365 days and not in the future" })
});


// =========================================================================
// NEW: AI GOAL ADVISOR SCHEMA (for calculating personalized goals)
// =========================================================================
export const GoalAdvisorSchema = z.object({
  age: z.number().int().positive().min(18, { message: "Must be 18 or older." }).max(100, { message: "Age must be realistic." }),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: "Please select your gender." }),
  }),
  heightCm: z.number().int().positive().min(100, { message: "Height must be at least 100 cm." }).max(250, { message: "Height must be realistic." }),
  currentWeightKg: z.number().positive().min(30, { message: "Weight must be at least 30 kg." }).max(300, { message: "Weight must be realistic." }),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'very', 'super'], {
    errorMap: () => ({ message: "Please select an activity level." }),
  }),
  goal: z.enum(['lose', 'maintain', 'gain'], {
    errorMap: () => ({ message: "Please select your goal." }),
  }),
});

export const GoalRecommendationSchema = z.object({
  calorieGoal: z.number().int().positive(),
  macroProteinG: z.number().int().min(0),
  macroFatG: z.number().int().min(0),
  macroCarbsG: z.number().int().min(0),
  explanation: z.string(),
});

// =========================================================================
// UPDATED: FORM STATE INTERFACE (Reflecting AI integration)
// =========================================================================
export interface FormState {
  message: string;
  success: boolean;
  fieldErrors?: Record<string, string[]>; // Zod errors structure
  // Include the AI suggestion payload
  aiSuggestion?: z.infer<typeof MacroSuggestionSchema>;
  // Include goal recommendations
  goalRecommendation?: z.infer<typeof GoalRecommendationSchema>;
}