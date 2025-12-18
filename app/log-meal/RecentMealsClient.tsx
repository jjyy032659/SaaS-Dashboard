// app/log-meal/RecentMealsClient.tsx
'use client';

import { Utensils, Trash2 } from 'lucide-react';

interface LogEntry {
    id: string;
    description: string;
    mealType: string; // BREAKFAST, LUNCH, DINNER, SNACK
    calories: number;
    proteinG: number;
    fatG: number;
    carbsG: number;
}

interface RecentMealsClientProps {
    recentLog: LogEntry[];
    deleteMealAction: (logId: string) => Promise<void>;
}

export default function RecentMealsClient({ recentLog, deleteMealAction }: RecentMealsClientProps) {
    // Helper function to get meal type badge styling
    const getMealTypeBadge = (mealType: string) => {
        const badges: Record<string, { bg: string; text: string; label: string }> = {
            BREAKFAST: { bg: 'bg-orange-100', text: 'text-orange-700', label: '🌅 Breakfast' },
            LUNCH: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '☀️ Lunch' },
            DINNER: { bg: 'bg-purple-100', text: 'text-purple-700', label: '🌙 Dinner' },
            SNACK: { bg: 'bg-pink-100', text: 'text-pink-700', label: '🍿 Snack' },
        };
        return badges[mealType] || { bg: 'bg-gray-100', text: 'text-gray-700', label: mealType };
    };

    // Handler to delete a meal - binds the logId to the server action
    const handleDelete = (logId: string) => {
        return deleteMealAction.bind(null, logId);
    };

    return (
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-100">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Utensils size={22} className="text-gray-600" />
                    <span>Recent Meals</span>
                </h2>
                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                    {recentLog.length} {recentLog.length === 1 ? 'entry' : 'entries'}
                </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">Your last 10 logged meals</p>

            {recentLog.length === 0 ? (
                <div className="text-center py-12">
                    <Utensils size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No meals logged yet</p>
                    <p className="text-gray-400 text-sm">
                        Start tracking your nutrition by logging your first meal above
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recentLog.map((item: LogEntry) => {
                        const badge = getMealTypeBadge(item.mealType);
                        return (
                            <div
                                key={item.id}
                                className="relative bg-gradient-to-br from-white via-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-xl hover:scale-105 hover:border-gray-300 transition-all duration-200"
                            >
                                {/* Meal Type Badge */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`${badge.bg} ${badge.text} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                                        {badge.label}
                                    </span>
                                    {/* Delete button */}
                                    <form action={handleDelete(item.id)}>
                                        <button
                                            type="submit"
                                            className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                                            title="Delete meal entry"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </form>
                                </div>

                                {/* Meal description */}
                                <h3 className="font-semibold text-gray-900 text-sm mb-3 leading-tight">
                                    {item.description}
                                </h3>

                                {/* Nutritional info */}
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center bg-red-50 px-3 py-2 rounded-lg">
                                        <span className="text-xs font-medium text-gray-700">Calories</span>
                                        <span className="font-bold text-red-600">{item.calories} kcal</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-green-50 rounded-lg p-2 text-center">
                                            <p className="text-xs text-gray-600 mb-0.5">Protein</p>
                                            <p className="font-bold text-green-600">{item.proteinG}g</p>
                                        </div>
                                        <div className="bg-blue-50 rounded-lg p-2 text-center">
                                            <p className="text-xs text-gray-600 mb-0.5">Carbs</p>
                                            <p className="font-bold text-blue-600">{item.carbsG}g</p>
                                        </div>
                                        <div className="bg-amber-50 rounded-lg p-2 text-center">
                                            <p className="text-xs text-gray-600 mb-0.5">Fat</p>
                                            <p className="font-bold text-amber-600">{item.fatG}g</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
