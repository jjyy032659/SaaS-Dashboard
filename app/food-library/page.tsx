// app/food-library/page.tsx
import { db } from "@/lib/db/db";
import { foods } from "@/lib/db/schema";
import { addFoodAction, deleteFoodAction } from "@/lib/actions";
import { Trash2, PlusCircle } from "lucide-react";
import { eq, count, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

// Note: We are keeping the searchParams structure for future filtering/pagination
export default async function FoodLibraryPage({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    // If the user is not logged in, they cannot access their food library
    return <div className="p-6">Please log in to manage your food library.</div>;
  }

  // Fetch all food items created by the current user
  const allFoods = await db.select()
    .from(foods)
    .where(eq(foods.userId, userId))
    .orderBy(desc(foods.createdAt));

  console.log('User ID:', userId);
  console.log('Number of foods fetched:', allFoods.length);
  console.log('Foods:', allFoods);

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold">Food Library Management</h1>
          <p className="text-gray-500">Add, view, and manage your custom food items and their nutritional details.</p>
        </div>
      </div>

      {/* --- ADD NEW FOOD FORM (Adapted from Add Customer) --- */}
      <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
        <h3 className="text-xl font-semibold mb-4">Add New Food Item (per 100g)</h3>
        <form action={addFoodAction} className="grid grid-cols-6 gap-3">
          
          <input name="name" placeholder="Food Name (e.g., Apple)" className="border p-2 rounded-md col-span-2" required />
          <input name="calories" type="number" placeholder="Calories (kcal)" className="border p-2 rounded-md" required min="0" />
          
          {/* Macro Inputs */}
          <input name="protein_g" type="number" step="0.1" placeholder="Protein (g)" className="border p-2 rounded-md" min="0" />
          <input name="carbs_g" type="number" step="0.1" placeholder="Carbs (g)" className="border p-2 rounded-md" min="0" />
          <input name="fat_g" type="number" step="0.1" placeholder="Fat (g)" className="border p-2 rounded-md" min="0" />
          
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center justify-center gap-1 col-span-6 mt-2">
            <PlusCircle size={18} /> Add Food
          </button>
        </form>
      </div>

      {/* --- FOOD ITEMS TABLE --- */}
      <div className="bg-white shadow-sm rounded-xl border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calories (kcal)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protein (g)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carbs (g)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fat (g)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {allFoods.map((food) => (
              <tr key={food.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium">{food.name}</td>
                <td className="px-6 py-4">{food.calories}</td>
                <td className="px-6 py-4">{food.protein_g.toFixed(1)}</td>
                <td className="px-6 py-4">{food.carbs_g.toFixed(1)}</td>
                <td className="px-6 py-4">{food.fat_g.toFixed(1)}</td>
                <td className="px-6 py-4 text-right">
                  <form action={async () => { 'use server'; await deleteFoodAction(food.id); }}>
                    <button className="text-red-400 hover:text-red-600"><Trash2 size={20} /></button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}