// lib/actions.tsx (COMPLETE CODE - with Gemini integration)

'use server';

// =========================================================================
// GEMINI API SETUP
// =========================================================================
import { GoogleGenAI } from '@google/genai'; 
import { z } from 'zod';

import { db } from './db/db';
import { foodLog, usersProfile, foods, documents as documentsTable, UserProfile } from './db/schema';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { InsertFoodLog, InsertUserProfile, InsertFood } from './db/schema';
import {
    GoalSchema,
    MealLogSchema,
    HistoricalMealLogSchema,
    FormState,
    MacroSuggestionSchema
} from './validations'; 
import { DailyMacroData as DailySummary } from './analytics'; 


// Initialize the Gemini client. Reads GEMINI_API_KEY from .env.local
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set in .env.local');
}
const ai = new GoogleGenAI({ apiKey }); 


// FIX: Define the MealType union type based on the schema's pgEnum
type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'SUPPLEMENT';

// Helper function to convert the Base64 Data URL into the necessary part format
function fileToGenerativePart(base64DataUrl: string) {
    const [metadata, data] = base64DataUrl.split(',');
    const mimeType = metadata.match(/:(.*?);/)?.[1]; 

    if (!mimeType || !data) {
        throw new Error("Invalid Base64 Data URL format.");
    }

    return {
        inlineData: {
            data: data,
            mimeType: mimeType,
        },
    };
}


// =========================================================================
// 1. HELPER FUNCTION: Get Current User ID
// =========================================================================

async function getCurrentUserId(): Promise<string> {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Authorization error: User ID not found.");
    }
    return userId;
}

/**
 * Checks if the current authenticated user has an existing profile/goals in the database.
 * Used for onboarding/redirection logic.
 */
export async function getGoalStatus(): Promise<{ hasProfile: boolean }> {
    const { userId } = await auth();

    if (!userId) {
        return { hasProfile: true };
    }

    try {
        const profile = await db.select({ userId: usersProfile.userId })
            .from(usersProfile)
            .where(eq(usersProfile.userId, userId))
            .limit(1);

        return { hasProfile: profile.length > 0 };

    } catch (e) {
        console.error("Database error checking profile status:", e);
        return { hasProfile: false };
    }
}


// =========================================================================
// 2. USER PROFILE ACTIONS (Goal Setting) - (EXISTING)
// =========================================================================

/**
 * Creates or Updates the user's profile with their biometrics and goals.
 */
export async function updateProfileAndGoalsAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const userId = await getCurrentUserId();
    
    // Convert FormData entries to the correct types for Zod validation
    const rawData = {
        age: parseInt(formData.get('age') as string),
        heightCm: parseInt(formData.get('heightCm') as string),
        currentWeightKg: parseFloat(formData.get('currentWeightKg') as string),
        activityLevel: formData.get('activityLevel') as string,
        calorieGoal: parseInt(formData.get('calorieGoal') as string),
        macroProteinG: parseInt(formData.get('macroProteinG') as string),
        macroFatG: parseInt(formData.get('macroFatG') as string),
        macroCarbsG: parseInt(formData.get('macroCarbsG') as string),
    };

    // -------------------------------------------------------------
    // NEW: SERVER-SIDE ZOD VALIDATION
    // -------------------------------------------------------------
    const validatedFields = GoalSchema.safeParse(rawData);

    // If validation fails, return the error details to the client
    if (!validatedFields.success) {
        return {
            success: false,
            message: "Validation failed. Check inputs.",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }
    // -------------------------------------------------------------

    // Data structure for insertion/update (use validated data)
    const profileData: InsertUserProfile = {
        userId,
        ...validatedFields.data, // Use spread operator for clean data
    };

    try {
        await db.insert(usersProfile)
            .values(profileData)
            .onConflictDoUpdate({ 
                target: usersProfile.userId,
                set: profileData
            });

        revalidatePath('/dashboard');
        return { success: true, message: "Profile and goals updated successfully." };
    } catch (e) {
        console.error("Database error updating profile:", e);
        return { success: false, message: "Failed to save profile due to a database error." };
    }
}


// =========================================================================
// 3. FOOD LOG ACTIONS (EXISTING)
// =========================================================================

export async function logMealAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const userId = await getCurrentUserId();

    // Convert FormData entries to the correct types for Zod validation
    const rawData = {
        mealType: formData.get('mealType') as string,
        description: formData.get('description') as string,
        calories: parseInt(formData.get('calories') as string),
        proteinG: parseInt(formData.get('proteinG') as string),
        fatG: parseInt(formData.get('fatG') as string),
        carbsG: parseInt(formData.get('carbsG') as string),
    };

    // Server-side Zod validation
    const validatedFields = MealLogSchema.safeParse(rawData);

    // If validation fails, return the error details to the client
    if (!validatedFields.success) {
        return {
            success: false,
            message: "Validation failed. Please check your inputs.",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const newLogEntry: InsertFoodLog = {
        userId,
        mealType: validatedFields.data.mealType as MealType,
        description: validatedFields.data.description,
        calories: validatedFields.data.calories,
        proteinG: validatedFields.data.proteinG,
        fatG: validatedFields.data.fatG,
        carbsG: validatedFields.data.carbsG,
    };

    try {
        await db.transaction(async (tx) => {
            await tx.insert(foodLog).values(newLogEntry);
        });

        revalidatePath('/dashboard');
        revalidatePath('/log-meal');
        return { success: true, message: `${validatedFields.data.description} logged successfully!` };
    } catch (e) {
        console.error("Database error logging meal:", e);
        return { success: false, message: "Failed to log meal." };
    }
}

/**
 * Deletes a specific food log entry.
 */
export async function deleteMealAction(logId: string) {
    const userId = await getCurrentUserId();

    try {
        await db.delete(foodLog)
            .where(eq(foodLog.id, logId));

        revalidatePath('/dashboard');
        revalidatePath('/log-meal');
    } catch (e) {
        console.error("Database error deleting meal:", e);
        throw new Error("Failed to delete meal entry.");
    }
}

/**
 * Logs a meal with a specific historical date (for backfilling missing days).
 */
export async function logHistoricalMealAction(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const userId = await getCurrentUserId();

    const rawData = {
        mealType: formData.get('mealType') as string,
        description: formData.get('description') as string,
        calories: parseInt(formData.get('calories') as string),
        proteinG: parseInt(formData.get('proteinG') as string),
        fatG: parseInt(formData.get('fatG') as string),
        carbsG: parseInt(formData.get('carbsG') as string),
        targetDate: formData.get('targetDate') as string,
    };

    // Server-side Zod validation
    const validatedFields = HistoricalMealLogSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Validation failed. Please check your inputs.",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    // Convert targetDate to timestamp (set to noon to avoid timezone issues)
    const targetTimestamp = new Date(validatedFields.data.targetDate);
    targetTimestamp.setHours(12, 0, 0, 0);

    const newLogEntry: InsertFoodLog = {
        userId,
        mealType: validatedFields.data.mealType as MealType,
        description: validatedFields.data.description,
        calories: validatedFields.data.calories,
        proteinG: validatedFields.data.proteinG,
        fatG: validatedFields.data.fatG,
        carbsG: validatedFields.data.carbsG,
        loggedAt: targetTimestamp, // Explicit override
    };

    try {
        await db.insert(foodLog).values(newLogEntry);
        revalidatePath('/analytics');
        revalidatePath('/dashboard');
        return {
            success: true,
            message: `${validatedFields.data.description} logged for ${validatedFields.data.targetDate}!`
        };
    } catch (e) {
        console.error("Database error logging historical meal:", e);
        return { success: false, message: "Failed to log meal." };
    }
}

// =========================================================================
// 4. FOOD LIBRARY ACTIONS (EXISTING)
// =========================================================================

export async function addFoodAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const userId = await getCurrentUserId();

    const name = formData.get('name') as string;
    const calories = parseInt(formData.get('calories') as string);
    const protein_g = parseFloat(formData.get('protein_g') as string) || 0;
    const carbs_g = parseFloat(formData.get('carbs_g') as string) || 0;
    const fat_g = parseFloat(formData.get('fat_g') as string) || 0;

    if (!name || isNaN(calories)) {
        return { success: false, message: "Invalid food item details." };
    }

    const newFood: InsertFood = {
        userId,
        name,
        calories,
        protein_g,
        carbs_g,
        fat_g,
    };

    try {
        await db.insert(foods).values(newFood);
        revalidatePath('/food-library');
        revalidatePath('/log-meal');
        return { success: true, message: `${name} added to your food library!` };
    } catch (e) {
        console.error("Database error adding food:", e);
        return { success: false, message: "Failed to add food item." };
    }
}

/**
 * Deletes a specific food item from the user's library.
 */
export async function deleteFoodAction(foodId: string) {
    const userId = await getCurrentUserId();

    try {
        await db.delete(foods)
            .where(eq(foods.id, foodId));

        revalidatePath('/food-library');
        revalidatePath('/log-meal');
    } catch (e) {
        console.error("Database error deleting food:", e);
        throw new Error("Failed to delete food item.");
    }
}

// =========================================================================
// 5. DOCUMENT ANALYSIS ACTIONS (EXISTING)
// =========================================================================

export async function uploadDocumentAction(formData: FormData) {
    const userId = await getCurrentUserId();
    
    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
        return { success: false, message: "No file selected." };
    }
    
    const s3Key = `${userId}/${Date.now()}-${file.name}`;
    
    try {
        await db.insert(documentsTable).values({
            userId: userId,
            fileName: file.name,
            s3Key: s3Key,
            status: 'UPLOADED',
        });
        
        revalidatePath('/documents'); 
        return { success: true, message: `File "${file.name}" uploaded. Processing started.` };
    } catch (e) {
        console.error(e);
        return { success: false, message: "Database error during upload." };
    }
}


// =========================================================================
// 6. AI ANALYSIS ACTIONS (GEMINI INTEGRATION) - NEW
// =========================================================================

/**
 * AI ACTION 1: IMAGE ANALYSIS (VISION)
 */
export async function analyzeImageAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const base64Image = formData.get('base64Image') as string;
    const mealType = formData.get('mealType') as string;

    if (!base64Image) {
        return { success: false, message: "Image data is required for AI analysis." };
    }

    try {
        const imagePart = fileToGenerativePart(base64Image);
        const prompt = `You are a professional nutrition expert. Analyze the meal in the image and estimate its total nutritional content accurately for the serving size shown.

Provide your response in valid JSON format with these exact fields:
{
  "description": "Brief description of the food",
  "calories": number (total calories),
  "proteinG": number (protein in grams),
  "fatG": number (fat in grams),
  "carbsG": number (carbs in grams)
}

Use whole numbers only. Be realistic about portion sizes.`;

        // Use the models.generateContent API
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',  // Using 2.0 as fallback if 2.5 is overloaded
            contents: [prompt, imagePart],
            config: {
                responseMimeType: 'application/json',
            }
        });

        // Extract text from response
        const text = response.text || JSON.stringify(response);

        // Parse and validate the JSON response
        const suggestionData = MacroSuggestionSchema.parse(JSON.parse(text));

        return {
            success: true,
            message: `Gemini identified a meal for ${mealType}! Review and log the suggestion below.`,
            aiSuggestion: suggestionData,
        };

    } catch (e: any) {
        console.error("Gemini Image Analysis Error:", e);
        const errorMessage = e?.message || e?.toString() || 'Unknown error';
        console.error("Error details:", errorMessage);

        // Check for specific error types
        if (errorMessage.includes('429') || errorMessage.includes('quota')) {
            return {
                success: false,
                message: `Quota exceeded. Enable billing at https://console.cloud.google.com/billing (free tier available)`
            };
        }

        return {
            success: false,
            message: `AI analysis failed: ${errorMessage.substring(0, 150)}`
        };
    }
}

/**
 * AI ACTION 2: GOAL COACHING (TEXT ANALYSIS FOR DASHBOARD)
 */
export async function analyzeGoalProgressAction(
    goals: UserProfile,
    summary: DailySummary
): Promise<string> {

    // NOTE: DailySummary type is imported as DailyMacroData from lib/analytics.ts
    // The property names used here must match that interface (total_calories, total_protein, etc.)
    const prompt = `
        You are an AI Nutrition Coach. Provide a concise, encouraging, and actionable analysis (max 5 sentences) of the user's daily progress against their goals.

        User Goals (Daily):
        - Calorie Goal: ${goals.calorieGoal} kcal
        - Protein Goal: ${goals.macroProteinG}g
        - Carb Goal: ${goals.macroCarbsG}g
        - Fat Goal: ${goals.macroFatG}g

        Today's Consumption:
        - Calories Consumed: ${summary.total_calories} kcal
        - Protein Consumed: ${summary.total_protein}g
        - Carbs Consumed: ${summary.total_carbs}g
        - Fat Consumed: ${summary.total_fat}g

        Provide your analysis formatted using Markdown (bold text). Focus on the biggest discrepancy.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',  // Using 2.0 as fallback if 2.5 is overloaded
            contents: prompt,
            config: {
                temperature: 0.2,
                maxOutputTokens: 300,
            }
        });

        return response.text || "No response from AI";

    } catch (e: any) {
        console.error("Gemini Goal Analysis Error:", e);
        return "Failed to load AI goal analysis due to an API error.";
    }
}

/**
 * AI ACTION 3: COMPREHENSIVE 30-DAY NUTRITION TREND ANALYSIS
 * Analyzes user's nutrition patterns over 30 days and provides personalized insights
 */
interface TrendAnalysisInput {
    monthlyData: Array<{
        date: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    }>;
    goals: UserProfile;
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
}

export async function generateNutritionInsightsAction(
    data: TrendAnalysisInput
): Promise<{ success: boolean; insights?: string; message?: string }> {

    try {
        // Calculate average adherence percentages
        const avgCalorieAdherence = data.goals.calorieGoal > 0
            ? Math.round((data.weeklySummary.avgCalories / data.goals.calorieGoal) * 100)
            : 0;
        const avgProteinAdherence = data.goals.macroProteinG > 0
            ? Math.round((data.weeklySummary.avgProtein / data.goals.macroProteinG) * 100)
            : 0;
        const avgCarbsAdherence = data.goals.macroCarbsG > 0
            ? Math.round((data.weeklySummary.avgCarbs / data.goals.macroCarbsG) * 100)
            : 0;
        const avgFatAdherence = data.goals.macroFatG > 0
            ? Math.round((data.weeklySummary.avgFat / data.goals.macroFatG) * 100)
            : 0;

        // Calculate macro ratios
        const totalCals = (data.weeklySummary.avgProtein * 4) + (data.weeklySummary.avgCarbs * 4) + (data.weeklySummary.avgFat * 9);
        const proteinRatio = totalCals > 0 ? Math.round(((data.weeklySummary.avgProtein * 4) / totalCals) * 100) : 0;
        const carbsRatio = totalCals > 0 ? Math.round(((data.weeklySummary.avgCarbs * 4) / totalCals) * 100) : 0;
        const fatRatio = totalCals > 0 ? Math.round(((data.weeklySummary.avgFat * 9) / totalCals) * 100) : 0;

        // Identify trends from monthly data
        const recentWeek = data.monthlyData.slice(-7);
        const previousWeek = data.monthlyData.slice(-14, -7);
        const recentAvgCal = recentWeek.length > 0 ? Math.round(recentWeek.reduce((sum, d) => sum + d.calories, 0) / recentWeek.length) : 0;
        const previousAvgCal = previousWeek.length > 0 ? Math.round(previousWeek.reduce((sum, d) => sum + d.calories, 0) / previousWeek.length) : 0;
        const calorieChange = previousAvgCal > 0 ? Math.round(((recentAvgCal - previousAvgCal) / previousAvgCal) * 100) : 0;

        const prompt = `You are an expert AI Nutrition Coach and Data Analyst. Analyze the user's 30-day nutrition tracking data and provide comprehensive, personalized insights.

**USER PROFILE & GOALS:**
- Daily Calorie Goal: ${data.goals.calorieGoal} kcal
- Daily Protein Goal: ${data.goals.macroProteinG}g
- Daily Carb Goal: ${data.goals.macroCarbsG}g
- Daily Fat Goal: ${data.goals.macroFatG}g

**TRACKING CONSISTENCY:**
- Days Tracked (Last 30 Days): ${data.totalDays} out of 30
- Missing Days: ${data.missingDays}
- Current Tracking Streak: ${data.streak.currentStreak} days
- Longest Streak: ${data.streak.longestStreak} days
- Completion Rate: ${Math.round((data.totalDays / 30) * 100)}%

**WEEKLY AVERAGE PERFORMANCE (Last 7 Days):**
- Average Calories: ${data.weeklySummary.avgCalories} kcal (${avgCalorieAdherence}% of goal)
- Average Protein: ${data.weeklySummary.avgProtein}g (${avgProteinAdherence}% of goal)
- Average Carbs: ${data.weeklySummary.avgCarbs}g (${avgCarbsAdherence}% of goal)
- Average Fat: ${data.weeklySummary.avgFat}g (${avgFatAdherence}% of goal)
- Days Logged This Week: ${data.weeklySummary.daysLogged}

**MACRO DISTRIBUTION (Last 7 Days):**
- Protein: ${proteinRatio}% of calories
- Carbs: ${carbsRatio}% of calories
- Fat: ${fatRatio}% of calories

**TREND ANALYSIS:**
- Recent Week Average: ${recentAvgCal} kcal
- Previous Week Average: ${previousAvgCal} kcal
- Week-over-Week Change: ${calorieChange > 0 ? '+' : ''}${calorieChange}%

**YOUR TASK:**
Provide a comprehensive nutrition analysis with the following sections. Use Markdown formatting with headers, bold text, bullet points, and emojis for visual appeal:

## 📊 Overall Assessment
- Provide a 2-3 sentence summary of their overall performance and consistency

## 🎯 Goal Adherence Analysis
- Analyze how well they're meeting each macro goal
- Identify which macros are on target (90-110%) vs. under/over
- Highlight any concerning patterns

## 📈 Trend Insights
- Discuss the week-over-week calorie trend
- Identify any positive or negative patterns
- Comment on consistency and tracking habits

## 🥗 Macro Balance Review
- Evaluate their protein/carbs/fat distribution
- Compare to typical recommendations for their goals
- Suggest if rebalancing might help

## 💪 Consistency & Habits
- Praise tracking consistency if strong
- Address missing days or broken streaks if applicable
- Provide motivation to maintain or improve habits

## ✅ Actionable Recommendations
- Provide 3-5 specific, practical recommendations
- Prioritize the most impactful changes
- Make suggestions realistic and achievable

## 🌟 Motivation & Encouragement
- End with positive reinforcement
- Acknowledge their efforts
- Set an inspiring tone for continued progress

Be specific, data-driven, encouraging, and actionable. Use the actual numbers provided. If performance is strong, celebrate it. If there are concerns, address them constructively with solutions.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                temperature: 0.3,
                maxOutputTokens: 2000,
            }
        });

        const insights = response.text || "No insights generated.";

        return {
            success: true,
            insights: insights,
        };

    } catch (e: any) {
        console.error("Gemini Nutrition Insights Error:", e);
        const errorMessage = e?.message || e?.toString() || 'Unknown error';

        if (errorMessage.includes('429') || errorMessage.includes('quota')) {
            return {
                success: false,
                message: "AI service is currently at capacity. Please try again in a few moments.",
            };
        }

        return {
            success: false,
            message: "Failed to generate nutrition insights. Please try again later.",
        };
    }
}

/**
 * AI ACTION 4: PERSONALIZED GOAL CALCULATION
 * Uses AI to calculate optimal calorie and macro targets based on user biometrics
 */
export async function generateGoalRecommendationsAction(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const rawData = {
        age: parseInt(formData.get('age') as string),
        gender: formData.get('gender') as string,
        heightCm: parseInt(formData.get('heightCm') as string),
        currentWeightKg: parseFloat(formData.get('currentWeightKg') as string),
        activityLevel: formData.get('activityLevel') as string,
        goal: formData.get('goal') as string,
    };

    // Import GoalAdvisorSchema dynamically to avoid circular dependency
    const { GoalAdvisorSchema, GoalRecommendationSchema } = await import('./validations');

    // Validate input
    const validatedFields = GoalAdvisorSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Please fill out all fields correctly.",
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const data = validatedFields.data;

    try {
        // Calculate BMR using Mifflin-St Jeor equation
        let bmr: number;
        if (data.gender === 'male') {
            bmr = (10 * data.currentWeightKg) + (6.25 * data.heightCm) - (5 * data.age) + 5;
        } else {
            bmr = (10 * data.currentWeightKg) + (6.25 * data.heightCm) - (5 * data.age) - 161;
        }

        // Calculate TDEE based on activity level
        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            very: 1.725,
            super: 1.9,
        };
        const tdee = Math.round(bmr * activityMultipliers[data.activityLevel]);

        // Adjust for goal
        let targetCalories: number;
        let goalDescription: string;

        switch (data.goal) {
            case 'lose':
                targetCalories = Math.round(tdee * 0.8); // 20% deficit
                goalDescription = "weight loss (20% calorie deficit)";
                break;
            case 'gain':
                targetCalories = Math.round(tdee * 1.1); // 10% surplus
                goalDescription = "muscle gain (10% calorie surplus)";
                break;
            default: // maintain
                targetCalories = tdee;
                goalDescription = "weight maintenance";
                break;
        }

        // Calculate macros using AI for personalized recommendations
        const prompt = `You are an expert nutritionist. Based on the following user data, provide personalized macro recommendations.

**User Profile:**
- Age: ${data.age}
- Gender: ${data.gender}
- Height: ${data.heightCm} cm
- Weight: ${data.currentWeightKg} kg
- Activity Level: ${data.activityLevel}
- Goal: ${goalDescription}
- BMR: ${Math.round(bmr)} kcal
- TDEE: ${tdee} kcal
- Target Calories: ${targetCalories} kcal

**Task:**
Calculate optimal macro targets (protein, carbs, fat in grams) for this user's ${data.goal} goal.

**Guidelines:**
- Protein: 0.8-1.0g per lb bodyweight for muscle preservation/growth
- Fat: 25-30% of calories for hormonal health
- Carbs: Fill remaining calories for energy

**Return format (JSON):**
{
  "calorieGoal": ${targetCalories},
  "macroProteinG": [calculated protein grams],
  "macroFatG": [calculated fat grams],
  "macroCarbsG": [calculated carbs grams],
  "explanation": "Brief 2-3 sentence explanation of why these targets are optimal for the user's goal and profile"
}

Ensure the macros mathematically add up to approximately the target calories (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                temperature: 0.2,
                maxOutputTokens: 500,
            }
        });

        const text = response.text || JSON.stringify(response);
        const recommendation = GoalRecommendationSchema.parse(JSON.parse(text));

        return {
            success: true,
            message: "AI recommendations generated successfully!",
            goalRecommendation: recommendation,
        };

    } catch (e: any) {
        console.error("Gemini Goal Recommendation Error:", e);
        const errorMessage = e?.message || e?.toString() || 'Unknown error';

        if (errorMessage.includes('429') || errorMessage.includes('quota')) {
            return {
                success: false,
                message: "AI service is currently at capacity. Please try again in a few moments.",
            };
        }

        return {
            success: false,
            message: "Failed to generate goal recommendations. Please try again later.",
        };
    }
}

// =========================================================================
// 7. STRIPE SUBSCRIPTION ACTIONS
// =========================================================================

/**
 * Create a Stripe checkout session for premium subscription
 */
export async function createCheckoutSession(): Promise<{ url?: string; error?: string }> {
    const userId = await getCurrentUserId();

    try {
        const { currentUser } = await import('@clerk/nextjs/server');
        const user = await currentUser();

        if (!user || !user.emailAddresses[0]?.emailAddress) {
            return { error: 'User email not found' };
        }

        const { getOrCreateStripeCustomer, stripe, PLANS } = await import('./stripe');
        const customerId = await getOrCreateStripeCustomer(userId, user.emailAddresses[0].emailAddress);

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: PLANS.PREMIUM.priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
            metadata: {
                userId,
            },
        });

        return { url: session.url || undefined };
    } catch (e: any) {
        console.error('Stripe checkout error:', e);
        return { error: 'Failed to create checkout session' };
    }
}

/**
 * Create a Stripe billing portal session for managing subscription
 */
export async function createBillingPortalSession(): Promise<{ url?: string; error?: string }> {
    const userId = await getCurrentUserId();

    try {
        const userProfile = await db.select()
            .from(usersProfile)
            .where(eq(usersProfile.userId, userId))
            .limit(1);

        if (!userProfile[0]?.stripeCustomerId) {
            return { error: 'No subscription found' };
        }

        const { stripe } = await import('./stripe');
        const session = await stripe.billingPortal.sessions.create({
            customer: userProfile[0].stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
        });

        return { url: session.url };
    } catch (e: any) {
        console.error('Stripe billing portal error:', e);
        return { error: 'Failed to create billing portal session' };
    }
}
