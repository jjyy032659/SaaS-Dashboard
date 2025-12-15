// app/log-meal/page.tsx

import { db } from "@/lib/db/db";
import { foodLog, usersProfile, foods, Food } from "@/lib/db/schema";
import { logMealAction } from "@/lib/actions";

import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { User, LogIn, Utensils } from "lucide-react";

// Import the new Client Component
import MealLoggingFormClient from './MealLoggingFormClient';


// =========================================================================
// DATA FETCHING FUNCTIONS (Server-side)
// =========================================================================

/**
 * Gets the user's current nutritional goals.
 */
async function getUserGoals(userId: string) {
    const goals = await db.select()
        .from(usersProfile)
        .where(eq(usersProfile.userId, userId));
    return goals[0];
}

/**
 * Gets the user's recently logged food items for a quick-add list.
 */
async function getRecentFoodLog(userId: string) {
    return db.select({
            description: foodLog.description,
            calories: foodLog.calories,
            proteinG: foodLog.proteinG,
            fatG: foodLog.fatG,
            carbsG: foodLog.carbsG,
        })
        .from(foodLog)
        .where(eq(foodLog.userId, userId))
        .orderBy(desc(foodLog.loggedAt))
        .limit(10);
}

/**
 * Gets the user's custom food library, selecting all necessary macro fields.
 */
async function getFoodLibrary(userId: string): Promise<Food[]> {
    return db.select({
        id: foods.id,
        name: foods.name,
        calories: foods.calories,
        protein_g: foods.protein_g,
        carbs_g: foods.carbs_g,
        fat_g: foods.fat_g
    })
    .from(foods)
    .where(eq(foods.userId, userId))
    .orderBy(foods.name);
}


// =========================================================================
// MAIN SERVER COMPONENT
// =========================================================================

export default async function LogMealPage() {
    const { userId } = await auth();

    if (!userId) {
        return (
            <div className="p-8 text-center text-red-600">
                Please <LogIn className="inline h-4 w-4 mr-1" /> sign in to log meals.
            </div>
        );
    }

    // Fetch all three datasets concurrently
    const [userGoals, recentLog, foodLibrary] = await Promise.all([
        getUserGoals(userId),
        getRecentFoodLog(userId),
        getFoodLibrary(userId) 
    ]);

    if (!userGoals) {
        return (
            <div className="p-8 text-center">
                <User size={48} className="mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold">Set Your Goals First</h2>
                <p className="text-gray-600">Please complete your profile and set your daily calorie and macro goals on the Dashboard.</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Utensils size={30} /> Log a Meal
            </h1>
            <p className="text-gray-600 mb-8">
                Your daily goal is **{userGoals.calorieGoal} kcal** and **{userGoals.macroProteinG}g protein**.
            </p>
            
            {/* Render the Client Component with all necessary server data */}
            <MealLoggingFormClient 
                foodLibrary={foodLibrary} 
                logMealAction={logMealAction} 
                recentLog={recentLog} 
            />
        </div>
    );
}