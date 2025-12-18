// app/log-meal/page.tsx (COMPLETE CODE)

import { db } from "@/lib/db/db";
import { foodLog, usersProfile, foods, Food } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { User, LogIn, Utensils } from "lucide-react";

// UPDATED IMPORTS:
import MealLoggingFormClient from './MealLoggingFormClient';
import AIMealLogClient from './AIMealLogClient';
import RecentMealsClient from './RecentMealsClient'; // <-- NEW IMPORT

// UPDATED ACTION IMPORTS:
import { logMealAction, deleteMealAction, analyzeImageAction } from "@/lib/actions"; 

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
            id: foodLog.id,
            description: foodLog.description,
            mealType: foodLog.mealType, // Include meal type for display
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
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
                    <Utensils size={32} className="text-green-600" /> Log Your Meal
                </h1>
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                        <span className="text-gray-600">Daily Goal:</span>
                        <strong className="text-green-600 ml-2">{userGoals.calorieGoal} kcal</strong>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                        <span className="text-gray-600">Protein:</span>
                        <strong className="text-green-600 ml-2">{userGoals.macroProteinG}g</strong>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                        <span className="text-gray-600">Carbs:</span>
                        <strong className="text-blue-600 ml-2">{userGoals.macroCarbsG}g</strong>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                        <span className="text-gray-600">Fat:</span>
                        <strong className="text-amber-600 ml-2">{userGoals.macroFatG}g</strong>
                    </div>
                </div>
            </div>

            {/* Logging Methods - Side by Side on Desktop, Stacked on Mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Image Logging */}
                <AIMealLogClient
                    logMealAction={logMealAction}
                    analyzeImageAction={analyzeImageAction}
                />

                {/* Manual/Library Logging */}
                <MealLoggingFormClient
                    foodLibrary={foodLibrary}
                    logMealAction={logMealAction}
                />
            </div>

            {/* Recent Meals - Full Width Below */}
            <RecentMealsClient
                recentLog={recentLog}
                deleteMealAction={deleteMealAction}
            />
        </div>
    );
}