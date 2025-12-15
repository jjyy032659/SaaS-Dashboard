// app/page.tsx
import { db } from '@/lib/db/db';
import { foodLog, foods, usersProfile } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, count, sql, and, gte, lt } from 'drizzle-orm';
import { Activity, Leaf, CookingPot, Target, AlertTriangle } from 'lucide-react';

// New: Import the Macro Aggregation Function
import { fetchDailyMacroSummary } from '@/lib/analytics'; 

// New: Import the Visualization Component
import { MacroGauge } from '@/app/components/MacroGauge'; 

// --- SERVER-SIDE DATA FETCHING FUNCTIONS ---

// Function to get the user's current goals (TDEE, Macros)
async function getUserGoals(userId: string) {
    const goals = await db.select()
        .from(usersProfile)
        .where(eq(usersProfile.userId, userId));
    return goals[0];
}

// Function to get the count of food items in the user's library
async function getTotalFoodItems(userId: string) {
    const totalFoodsResult = await db.select({ count: count() })
        .from(foods)
        .where(eq(foods.userId, userId));
    return totalFoodsResult[0]?.count || 0;
}

// --- DASHBOARD COMPONENT ---

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Please log in to view your Nutrition Dashboard</h1>
      </div>
    );
  }

  // Fetch all required data concurrently
  const [userGoals, totalFoodItems, dailySummary] = await Promise.all([
    getUserGoals(userId),
    getTotalFoodItems(userId),
    fetchDailyMacroSummary(userId) // Now fetches all macros
  ]);
  
  if (!userGoals) {
    return (
        <div className="p-8 text-center bg-white rounded-xl shadow-lg mt-10">
            <Target size={48} className="mx-auto mb-4 text-orange-500" />
            <h2 className="text-2xl font-semibold">Goal Setting Required</h2>
            <p className="text-gray-600 mt-2">Before tracking, please complete your profile and set your daily calorie and macro goals.</p>
            {/* Future: Add a link or button to the settings page here */}
        </div>
    );
  }

  const CALORIE_BUDGET = userGoals.calorieGoal;
  const remainingCalories = CALORIE_BUDGET - dailySummary.total_calories;

  return (
    <div className="space-y-10 p-6">
      <h1 className="text-4xl font-bold">Daily Nutrition Tracker</h1>
      
      {/* --- Section 1: Key Performance Indicators (KPIs) --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* KPI 1: Calories Consumed Today */}
        <div className="p-6 border rounded-xl shadow-lg bg-white border-red-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-red-700">Consumed Today</h2>
            <Activity className="text-red-500" size={24} />
          </div>
          <p className="text-4xl font-extrabold text-red-600">
            {dailySummary.total_calories} <span className="text-xl font-normal text-red-500">kcal</span>
          </p>
        </div>

        {/* KPI 2: Remaining Calorie Budget */}
        <div className={`p-6 rounded-xl shadow-lg bg-white ${remainingCalories >= 0 ? 'border border-green-100' : 'border border-yellow-100'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-green-700">Remaining Budget</h2>
            <Leaf className="text-green-500" size={24} />
          </div>
          <p className={`text-4xl font-extrabold ${remainingCalories >= 0 ? 'text-green-600' : 'text-yellow-600'}`}>
            {remainingCalories} <span className="text-xl font-normal text-gray-500">kcal</span>
          </p>
        </div>
        
        {/* KPI 3: Food Library Size */}
        <div className="p-6 border rounded-xl shadow-lg bg-white border-blue-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-blue-700">Food Items</h2>
            <CookingPot className="text-blue-500" size={24} />
          </div>
          <p className="text-4xl font-extrabold text-blue-600">
            {totalFoodItems} <span className="text-xl font-normal text-gray-500">custom foods</span>
          </p>
        </div>

        {/* KPI 4: Alert for Macro Goal */}
        <div className="p-6 border rounded-xl shadow-lg bg-white border-orange-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-orange-700">Protein Goal</h2>
            <AlertTriangle className="text-orange-500" size={24} />
          </div>
          <p className="text-4xl font-extrabold text-orange-600">
            {userGoals.macroProteinG - dailySummary.total_protein} <span className="text-xl font-normal text-gray-500">g left</span>
          </p>
        </div>
      </div>
      
      {/* --- Section 2: Macro Progress Gauges --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <MacroGauge 
            label="Calories" 
            total={dailySummary.total_calories} 
            goal={userGoals.calorieGoal} 
            color="#EF4444" // Red
            unit=" kcal" 
        />
        <MacroGauge 
            label="Protein" 
            total={dailySummary.total_protein} 
            goal={userGoals.macroProteinG} 
            color="#10B981" // Green
            unit=" g" 
        />
        <MacroGauge 
            label="Carbohydrates" 
            total={dailySummary.total_carbs} 
            goal={userGoals.macroCarbsG} 
            color="#3B82F6" // Blue
            unit=" g" 
        />
        <MacroGauge 
            label="Fats" 
            total={dailySummary.total_fat} 
            goal={userGoals.macroFatG} 
            color="#F59E0B" // Amber
            unit=" g" 
        />
        
      </div>

    </div>
  );
}