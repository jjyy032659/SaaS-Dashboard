// app/food-library/page.tsx

import { db } from "@/lib/db/db";
import { foods } from "@/lib/db/schema";
import { deleteFoodAction } from "@/lib/actions";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Utensils, XCircle, LogIn } from "lucide-react";

// Import Client Component
import FoodLibraryFormClient from "./FoodLibraryFormClient"; 


// Define the type for the Food data that will be returned
interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
}

/**
 * Gets the user's custom food library, selecting all necessary macro fields.
 */
async function getFoodLibrary(userId: string): Promise<FoodItem[]> {
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

export default async function FoodLibraryPage() {
    const { userId } = await auth();

    if (!userId) {
        return (
            <div className="p-8 text-center text-red-600">
                Please <LogIn className="inline h-4 w-4 mr-1" /> sign in to manage your food library.
            </div>
        );
    }

    const foodLibrary: FoodItem[] = await getFoodLibrary(userId);

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <Utensils size={36} className="text-green-600" /> Food Library
                </h1>
                <p className="text-gray-600 text-lg">
                    Build your personal food database. Search from our global database or add custom foods (values per 100g).
                </p>
            </div>

            {/* Add Food Form */}
            <div className="mb-8">
                <FoodLibraryFormClient />
            </div>

            {/* Food Library List */}
            <div className="bg-white p-6 rounded-xl border shadow-lg">
                <div className="flex items-center justify-between mb-6 border-b pb-3">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        Your Custom Foods
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {foodLibrary.length} {foodLibrary.length === 1 ? 'item' : 'items'}
                        </span>
                    </h2>
                </div>

                {foodLibrary.length === 0 ? (
                    <div className="text-center py-12">
                        <Utensils size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg mb-2">Your food library is empty</p>
                        <p className="text-gray-400 text-sm">
                            Start by searching for a food above or enter a custom food item
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {foodLibrary.map((food) => (
                            <div
                                key={food.id}
                                className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                {/* Delete button */}
                                <form
                                    action={async () => {
                                        "use server";
                                        await deleteFoodAction(food.id);
                                    }}
                                    className="absolute top-2 right-2"
                                >
                                    <button
                                        type="submit"
                                        className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                                        title="Delete food item"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </form>

                                {/* Food name */}
                                <h3 className="font-semibold text-gray-900 text-lg mb-3 pr-8">
                                    {food.name}
                                </h3>

                                {/* Nutritional info */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Calories</span>
                                        <span className="font-semibold text-red-600">{food.calories} kcal</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Protein</p>
                                            <p className="font-semibold text-green-600">{food.protein_g}g</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Carbs</p>
                                            <p className="font-semibold text-blue-600">{food.carbs_g}g</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Fat</p>
                                            <p className="font-semibold text-amber-600">{food.fat_g}g</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Per 100g label */}
                                <div className="mt-3 pt-2 border-t border-gray-200">
                                    <p className="text-xs text-gray-400 text-center">Per 100g</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}