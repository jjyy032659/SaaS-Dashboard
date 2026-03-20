// app/log-meal/MealLoggingFormClient.tsx (Updated)
'use client';

import { useState, useMemo } from 'react';
import { ListOrdered, PlusCircle, Search, XCircle } from 'lucide-react';
import { GlobalFoodItem, searchGlobalFoods } from '@/lib/globalFoods';

// Define the type for the food data passed from the server
interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
}

interface FormState {
  message: string;
  success: boolean;
  fieldErrors?: Record<string, string[]>;
}

interface MealLoggingFormClientProps {
    logMealAction: (prevState: FormState, formData: FormData) => Promise<FormState>;
    foodLibrary: FoodItem[];
}


export default function MealLoggingFormClient({ foodLibrary, logMealAction }: MealLoggingFormClientProps) {
    const [selectedFoodId, setSelectedFoodId] = useState('');
    const [servingSizeGrams, setServingSizeGrams] = useState(100);
    const [statusMessage, setStatusMessage] = useState<FormState>({ success: false, message: '' });

    // State for manual macro entry
    const [manualServingSize, setManualServingSize] = useState(100); // NEW: serving size for manual entry
    const [manualCalories, setManualCalories] = useState(0);
    const [manualProteinG, setManualProteinG] = useState(0);
    const [manualFatG, setManualFatG] = useState(0);
    const [manualCarbsG, setManualCarbsG] = useState(0);

    // Autocomplete state for manual entry
    const [manualSearchTerm, setManualSearchTerm] = useState('');
    const [autoFilledManualFood, setAutoFilledManualFood] = useState<GlobalFoodItem | null>(null);

    // Find the currently selected food item from the library
    const selectedFood = useMemo(() => {
        return foodLibrary.find(food => food.id === selectedFoodId);
    }, [foodLibrary, selectedFoodId]);

    // Calculate the total macros based on serving size for library food
    const calculatedMacros = useMemo(() => {
        if (!selectedFood || servingSizeGrams <= 0) {
            return { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 };
        }

        const ratio = servingSizeGrams / 100;

        return {
            calories: Math.round(selectedFood.calories * ratio),
            proteinG: Math.round(selectedFood.protein_g * ratio),
            fatG: Math.round(selectedFood.fat_g * ratio),
            carbsG: Math.round(selectedFood.carbs_g * ratio),
        };
    }, [selectedFood, servingSizeGrams]);

    // Calculate macros for manual entry based on serving size
    const calculatedManualMacros = useMemo(() => {
        if (!autoFilledManualFood || manualServingSize <= 0) {
            return { calories: manualCalories, proteinG: manualProteinG, fatG: manualFatG, carbsG: manualCarbsG };
        }

        const ratio = manualServingSize / 100;

        return {
            calories: Math.round(autoFilledManualFood.calories * ratio),
            proteinG: Math.round(autoFilledManualFood.proteinG * ratio),
            fatG: Math.round(autoFilledManualFood.fatG * ratio),
            carbsG: Math.round(autoFilledManualFood.carbsG * ratio),
        };
    }, [autoFilledManualFood, manualServingSize, manualCalories, manualProteinG, manualFatG, manualCarbsG]);

    // Search for global food suggestions for manual entry
    const globalSuggestions = useMemo(() => {
        // Only show suggestions if not using library food and not already autofilled
        if (selectedFoodId || autoFilledManualFood) return [];
        return searchGlobalFoods(manualSearchTerm);
    }, [manualSearchTerm, autoFilledManualFood, selectedFoodId]);

    // Handle clicking a suggestion from global database
    const handleManualSuggestionClick = (food: GlobalFoodItem) => {
        setAutoFilledManualFood(food);
        setManualSearchTerm(food.name);
        setManualServingSize(100); // Reset to 100g when selecting new food
        // Macros will be calculated automatically based on serving size
    };

    // Clear manual entry autofill
    const clearManualAutofill = () => {
        setAutoFilledManualFood(null);
        setManualSearchTerm('');
        setManualServingSize(100);
        setManualCalories(0);
        setManualProteinG(0);
        setManualFatG(0);
        setManualCarbsG(0);
    };


    // Form submission handler to catch the result
    const handleSubmit = async (formData: FormData) => {
        if (selectedFood) {
            // Using food library
            formData.set('calories', calculatedMacros.calories.toString());
            formData.set('proteinG', calculatedMacros.proteinG.toString());
            formData.set('fatG', calculatedMacros.fatG.toString());
            formData.set('carbsG', calculatedMacros.carbsG.toString());
            formData.set('description', `${servingSizeGrams}g of ${selectedFood.name}`);
        } else {
            // Manual entry
            if (!formData.get('description')) {
                setStatusMessage({ success: false, message: "Please provide a description for your manual entry." });
                return;
            }

            // Use calculated macros (which accounts for serving size if from autocomplete)
            formData.set('calories', calculatedManualMacros.calories.toString());
            formData.set('proteinG', calculatedManualMacros.proteinG.toString());
            formData.set('fatG', calculatedManualMacros.fatG.toString());
            formData.set('carbsG', calculatedManualMacros.carbsG.toString());

            // Update description to include serving size
            const originalDesc = formData.get('description') as string;
            formData.set('description', `${manualServingSize}g of ${originalDesc}`);
        }

        const result = await logMealAction(statusMessage, formData);

        setStatusMessage(result);

        // Reset state after successful submission
        if (result.success) {
            setSelectedFoodId('');
            setServingSizeGrams(100);
            setManualServingSize(100);
            setManualCalories(0);
            setManualProteinG(0);
            setManualFatG(0);
            setManualCarbsG(0);
            setManualSearchTerm('');
            setAutoFilledManualFood(null);
        }

        setTimeout(() => setStatusMessage({ success: false, message: '' }), 5000);
    };


    return (
        <div>

            {/* 1. Meal Logging Form */}
            <div className="bg-white p-6 rounded-xl border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-green-100">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <PlusCircle size={24} className="text-green-600" />
                        <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            Manual Entry
                        </span>
                    </h2>
                </div>
                <p className="text-sm text-gray-600 mb-4 bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                    🍽️ <strong>Flexible:</strong> Search from 200+ foods or add custom items manually
                </p>

                {/* Status Message */}
                {statusMessage.message && (
                    <div className={`mb-3 p-2 rounded text-sm ${statusMessage.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <p>{statusMessage.message}</p>
                        {statusMessage.fieldErrors && (
                            <ul className="mt-1 list-disc list-inside text-xs space-y-0.5">
                                {Object.entries(statusMessage.fieldErrors).map(([field, errors]) => (
                                    <li key={field}>
                                        <strong>{field}:</strong> {errors.join(', ')}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-3">
                    {/* Meal Type & Food Library - Combined Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Meal Type */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Meal Type</label>
                            <select
                                name="mealType"
                                className="border p-2 rounded text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full"
                                defaultValue="LUNCH"
                            >
                                <option value="BREAKFAST">Breakfast</option>
                                <option value="LUNCH">Lunch</option>
                                <option value="DINNER">Dinner</option>
                                <option value="SNACK">Snack</option>
                            </select>
                        </div>

                        {/* Food Library Select */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                <ListOrdered size={14} /> Quick Add from Library
                            </label>
                            <select
                                name="libraryFoodId"
                                className="border p-2 rounded text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full"
                                value={selectedFoodId}
                                onChange={(e) => setSelectedFoodId(e.target.value)}
                            >
                                <option value="">-- Select Food --</option>
                                {foodLibrary.map((food) => (
                                    <option key={food.id} value={food.id}>
                                        {food.name} ({food.calories} kcal)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Serving Size (Only shown if a food is selected) */}
                    {selectedFood && (
                        <div className="bg-green-50 p-2 rounded border border-green-200">
                            <div className="grid grid-cols-2 gap-3 items-center">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Serving Size (g)</label>
                                    <input
                                        name="servingSizeGrams"
                                        type="number"
                                        placeholder="100"
                                        min="1"
                                        required
                                        value={servingSizeGrams}
                                        onChange={(e) => setServingSizeGrams(parseInt(e.target.value) || 0)}
                                        className="border p-2 rounded text-sm w-full focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div className='text-right'>
                                    <p className="text-xs text-gray-600">Selected:</p>
                                    <p className="text-sm font-bold text-green-700">{selectedFood.name}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description & Macros Section */}
                    <div className="space-y-2 bg-gray-50 p-3 rounded border">
                        <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1">
                            {selectedFood ? 'Calculated Macros' : (
                                <>
                                    <Search size={14} /> Manual Entry - Search or Type
                                </>
                            )}
                        </label>

                        {/* Description with Autocomplete */}
                        <div className="relative">
                            <input
                                name="description"
                                placeholder={selectedFood ? `${servingSizeGrams}g of ${selectedFood.name}` : "Search food database or enter custom name"}
                                required
                                readOnly={!!selectedFood}
                                value={selectedFood ? '' : manualSearchTerm}
                                onChange={(e) => {
                                    setManualSearchTerm(e.target.value);
                                    if (autoFilledManualFood && e.target.value !== autoFilledManualFood.name) {
                                        clearManualAutofill();
                                    }
                                }}
                                className={`border p-2 rounded text-sm w-full ${selectedFood ? 'bg-gray-200 cursor-not-allowed' : 'focus:ring-2 focus:ring-green-500'}`}
                            />

                            {/* Clear button for manual autofill */}
                            {!selectedFood && autoFilledManualFood && (
                                <button
                                    type="button"
                                    onClick={clearManualAutofill}
                                    className="absolute right-2 top-2 text-gray-500 hover:text-red-500"
                                >
                                    <XCircle size={18} />
                                </button>
                            )}

                            {/* Autocomplete Suggestions Dropdown */}
                            {!selectedFood && !autoFilledManualFood && globalSuggestions.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                                    {globalSuggestions.map((food, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleManualSuggestionClick(food)}
                                            className="p-2 cursor-pointer hover:bg-green-50 text-xs border-b last:border-b-0"
                                        >
                                            <div className="font-medium text-gray-900">{food.name}</div>
                                            <div className="text-gray-600">
                                                {food.calories} kcal • P: {food.proteinG}g • C: {food.carbsG}g • F: {food.fatG}g
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Serving Size Input for Manual Entry */}
                        {!selectedFood && (
                            <div className="bg-green-50 p-2 rounded border border-green-200">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Serving Size (grams)</label>
                                <input
                                    type="number"
                                    placeholder="100"
                                    min="1"
                                    value={manualServingSize}
                                    onChange={(e) => setManualServingSize(parseInt(e.target.value) || 0)}
                                    className="border p-2 rounded text-sm w-full focus:ring-2 focus:ring-green-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {autoFilledManualFood
                                        ? `Macros calculated for ${manualServingSize}g`
                                        : 'Enter portion size (e.g., 150g)'}
                                </p>
                            </div>
                        )}

                        {/* Macro Grid - 4 Columns */}
                        <div className="grid grid-cols-4 gap-2">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Calories</label>
                                <input
                                    name="calories"
                                    type="number"
                                    placeholder="0"
                                    required
                                    readOnly={!!selectedFood || !!autoFilledManualFood}
                                    value={selectedFood ? calculatedMacros.calories : calculatedManualMacros.calories}
                                    onChange={(e) => setManualCalories(parseInt(e.target.value) || 0)}
                                    className={`border p-1.5 rounded text-sm w-full ${(selectedFood || autoFilledManualFood) ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Protein (g)</label>
                                <input
                                    name="proteinG"
                                    type="number"
                                    placeholder="0"
                                    required
                                    readOnly={!!selectedFood || !!autoFilledManualFood}
                                    value={selectedFood ? calculatedMacros.proteinG : calculatedManualMacros.proteinG}
                                    onChange={(e) => setManualProteinG(parseInt(e.target.value) || 0)}
                                    className={`border p-1.5 rounded text-sm w-full ${(selectedFood || autoFilledManualFood) ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Fat (g)</label>
                                <input
                                    name="fatG"
                                    type="number"
                                    placeholder="0"
                                    required
                                    readOnly={!!selectedFood || !!autoFilledManualFood}
                                    value={selectedFood ? calculatedMacros.fatG : calculatedManualMacros.fatG}
                                    onChange={(e) => setManualFatG(parseInt(e.target.value) || 0)}
                                    className={`border p-1.5 rounded text-sm w-full ${(selectedFood || autoFilledManualFood) ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Carbs (g)</label>
                                <input
                                    name="carbsG"
                                    type="number"
                                    placeholder="0"
                                    required
                                    readOnly={!!selectedFood || !!autoFilledManualFood}
                                    value={selectedFood ? calculatedMacros.carbsG : calculatedManualMacros.carbsG}
                                    onChange={(e) => setManualCarbsG(parseInt(e.target.value) || 0)}
                                    className={`border p-1.5 rounded text-sm w-full ${(selectedFood || autoFilledManualFood) ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded text-sm font-semibold hover:bg-green-700 transition-colors">
                        Log Meal
                    </button>
                </form>
            </div>
        </div>
    );
}