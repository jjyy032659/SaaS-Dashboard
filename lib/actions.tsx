// lib/actions.tsx

'use server';

import { db } from './db/db';
import { foodLog, usersProfile, foods, documents as documentsTable, Document } from './db/schema';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { InsertFoodLog, InsertUserProfile, InsertFood } from './db/schema';


// lib/actions.tsx (Add this function)

// ... other imports ...

/**
 * Checks if the current authenticated user has an existing profile/goals in the database.
 * Used for onboarding/redirection logic.
 */
export async function getGoalStatus(): Promise<{ hasProfile: boolean }> {
    const { userId } = await auth();

    if (!userId) {
        return { hasProfile: true }; // Assume true if signed out; redirection is handled by Clerk/Next.js
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
// Define the expected return type for form actions (Used by useActionState)
interface FormState {
  message: string;
  success: boolean;
}

// FIX: Define the MealType union type based on the schema's pgEnum
type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'SUPPLEMENT';

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

// =========================================================================
// 2. USER PROFILE ACTIONS (Goal Setting)
// =========================================================================

export async function updateProfileAndGoalsAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const userId = await getCurrentUserId();
    
    const heightCm = parseInt(formData.get('heightCm') as string);
    const currentWeightKg = parseInt(formData.get('currentWeightKg') as string);
    const age = parseInt(formData.get('age') as string);
    const activityLevel = formData.get('activityLevel') as string;
    const calorieGoal = parseInt(formData.get('calorieGoal') as string);
    const macroProteinG = parseInt(formData.get('macroProteinG') as string);
    const macroFatG = parseInt(formData.get('macroFatG') as string);
    const macroCarbsG = parseInt(formData.get('macroCarbsG') as string);

    if (isNaN(calorieGoal) || isNaN(macroProteinG) || isNaN(heightCm)) {
        return { success: false, message: "Invalid numeric input." };
    }
    
    const profileData: InsertUserProfile = {
        userId,
        age,
        heightCm,
        currentWeightKg,
        activityLevel,
        calorieGoal,
        macroProteinG,
        macroFatG,
        macroCarbsG,
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
// 3. FOOD LOG ACTIONS (Meal Logging)
// =========================================================================

/**
 * Logs a new food item into the user's daily record.
 * CORRECTED SIGNATURE: Accepts prevState and formData
 */
export async function logMealAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const userId = await getCurrentUserId();
    
    // FIX APPLIED: Asserting the type to the MealType union
    const mealType = formData.get('mealType') as MealType; 
    const description = formData.get('description') as string;
    const calories = parseInt(formData.get('calories') as string);
    const proteinG = parseInt(formData.get('proteinG') as string);
    const fatG = parseInt(formData.get('fatG') as string);
    const carbsG = parseInt(formData.get('carbsG') as string);
    
    if (isNaN(calories) || !description) {
        return { success: false, message: "Invalid meal details (Calories or Description missing)." };
    }

    const newLogEntry: InsertFoodLog = {
        userId,
        mealType, // This is now correctly typed
        description,
        calories,
        proteinG,
        fatG,
        carbsG,
    };

    try {
        await db.transaction(async (tx) => {
            await tx.insert(foodLog).values(newLogEntry);
        }); 

        revalidatePath('/dashboard');
        revalidatePath('/log-meal');
        return { success: true, message: `${description} logged successfully!` };
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

// =========================================================================
// 4. FOOD LIBRARY ACTIONS (Custom Food Items)
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
// 5. DOCUMENT ANALYSIS ACTIONS (Kept for AI feature)
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