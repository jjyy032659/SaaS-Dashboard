// lib/actions.tsx

'use server';

import { db } from './db/db';
import { foodLog, usersProfile, foods, Document } from './db/schema'; // Ensure all tables are imported
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { InsertFoodLog, InsertUserProfile, InsertFood } from './db/schema'; // Ensure all types are imported

// =========================================================================
// 1. HELPER FUNCTION: Get Current User ID
// =========================================================================

async function getCurrentUserId(): Promise<string> {
    const { userId } = await auth();
    if (!userId) {
        // In a real app, you would redirect the user to sign-in
        throw new Error("Authorization error: User ID not found.");
    }
    return userId;
}

// =========================================================================
// 2. USER PROFILE ACTIONS (Goal Setting)
// =========================================================================

/**
 * Creates or Updates the user's profile with their biometrics and goals.
 */
export async function updateProfileAndGoalsAction(formData: FormData) {
    const userId = await getCurrentUserId();
    
    // Parse form data into numbers
    const heightCm = parseInt(formData.get('heightCm') as string);
    const currentWeightKg = parseInt(formData.get('currentWeightKg') as string);
    const age = parseInt(formData.get('age') as string);
    const activityLevel = formData.get('activityLevel') as string;
    const calorieGoal = parseInt(formData.get('calorieGoal') as string);
    const macroProteinG = parseInt(formData.get('macroProteinG') as string);
    const macroFatG = parseInt(formData.get('macroFatG') as string);
    const macroCarbsG = parseInt(formData.get('macroCarbsG') as string);

    // Basic validation (Zod is recommended for production)
    if (isNaN(calorieGoal) || isNaN(macroProteinG) || isNaN(heightCm)) {
        return { success: false, message: "Invalid numeric input." };
    }
    
    // Data structure for insertion/update
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
                target: usersProfile.userId, // Update if userId exists
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
 */
export async function logMealAction(formData: FormData) {
    const userId = await getCurrentUserId();
    
    // Parse and validate form data (Note: Zod validation is ideal here)
    const mealType = formData.get('mealType') as string; 
    const description = formData.get('description') as string;
    // Values are now sent as strings from the client component (calculated or manual)
    const calories = parseInt(formData.get('calories') as string);
    const proteinG = parseInt(formData.get('proteinG') as string);
    const fatG = parseInt(formData.get('fatG') as string);
    const carbsG = parseInt(formData.get('carbsG') as string);
    
    // If the description or calories are missing, reject the submission
    if (isNaN(calories) || !description) {
        return { success: false, message: "Invalid meal details (Calories or Description missing)." };
    }

    const newLogEntry: InsertFoodLog = {
        userId,
        mealType,
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

/**
 * Adds a new custom food item to the user's food library.
 */
export async function addFoodAction(formData: FormData) {
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

/**
 * Simulates uploading a file (metadata only) and triggering analysis.
 */
export async function uploadDocumentAction(formData: FormData) {
    const userId = await getCurrentUserId();
    
    // Get the file stream from FormData
    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
        return { success: false, message: "No file selected." };
    }
    
    // --- (Simulation) ---
    const s3Key = `${userId}/${Date.now()}-${file.name}`;
    
    try {
        // Save metadata to PostgreSQL
        await db.insert(documents).values({
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