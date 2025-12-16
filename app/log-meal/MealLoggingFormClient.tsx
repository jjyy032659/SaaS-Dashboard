// app/log-meal/MealLoggingFormClient.tsx (Updated)
'use client';

import { useState, useMemo } from 'react';
import { ListOrdered, Trash2 } from 'lucide-react';
import { useFormStatus } from 'react-dom'; // Needed for the delete button's pending state

// Define the type for the food data passed from the server
interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
}

interface LogEntry {
    id: string; // Now included from Step 1
    description: string;
    calories: number;
    proteinG: number;
    fatG: number;
    carbsG: number;
}

interface FormState {
  message: string;
  success: boolean;
}

interface MealLoggingFormClientProps {
    logMealAction: (prevState: FormState, formData: FormData) => Promise<FormState>;
    deleteMealAction: (logId: string) => Promise<void>; // <-- NEW PROP
    foodLibrary: FoodItem[];
    recentLog: LogEntry[]; // <-- Updated type for ID
}

// Button component for pending state on deletion
function DeleteButton() {
    const { pending } = useFormStatus();
    return (
        <button 
            type="submit" 
            disabled={pending} 
            className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
        >
            {pending ? '...' : <Trash2 size={16} />}
        </button>
    );
}


export default function MealLoggingFormClient({ foodLibrary, logMealAction, recentLog, deleteMealAction }: MealLoggingFormClientProps) {
    const [selectedFoodId, setSelectedFoodId] = useState('');
    const [servingSizeGrams, setServingSizeGrams] = useState(100); 
    const [statusMessage, setStatusMessage] = useState<FormState>({ success: false, message: '' });

    // State for manual macro entry
    const [manualCalories, setManualCalories] = useState(0);
    const [manualProteinG, setManualProteinG] = useState(0);
    const [manualFatG, setManualFatG] = useState(0);
    const [manualCarbsG, setManualCarbsG] = useState(0);

    // Find the currently selected food item from the library
    const selectedFood = useMemo(() => {
        return foodLibrary.find(food => food.id === selectedFoodId);
    }, [foodLibrary, selectedFoodId]);

    // Calculate the total macros based on serving size
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
    
    
    // Form submission handler to catch the result
    const handleSubmit = async (formData: FormData) => {
        // ... (Logic remains the same as previous step) ...
        if (selectedFood) {
            formData.set('calories', calculatedMacros.calories.toString());
            formData.set('proteinG', calculatedMacros.proteinG.toString());
            formData.set('fatG', calculatedMacros.fatG.toString());
            formData.set('carbsG', calculatedMacros.carbsG.toString());
            formData.set('description', `${servingSizeGrams}g of ${selectedFood.name}`);
        } else {
             if (!formData.get('description')) {
                 setStatusMessage({ success: false, message: "Please provide a description for your manual entry." });
                 return;
             }
        }

        const result = await logMealAction(statusMessage, formData);
        
        setStatusMessage(result);
        
        // Reset state after successful submission
        if (result.success) {
            setSelectedFoodId('');
            setServingSizeGrams(100);
            setManualCalories(0);
            setManualProteinG(0);
            setManualFatG(0);
            setManualCarbsG(0);
        }

        setTimeout(() => setStatusMessage({ success: false, message: '' }), 5000);
    };

    // Handler to delete a meal - binds the logId to the server action
    const handleDelete = (logId: string) => {
        return deleteMealAction.bind(null, logId);
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 1. Meal Logging Form */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Log Food Entry</h2>
                
                {/* Status Message */}
                {statusMessage.message && (
                    <p className={`mb-4 p-3 rounded-md text-sm font-medium ${statusMessage.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {statusMessage.message}
                    </p>
                )}

                {/* The form uses the Client Component form submission method */}
                <form action={handleSubmit} className="space-y-4">
                    
                    {/* INPUT: Meal Type (Standard Select) */}
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Meal Type:</label>
                        <select 
                            name="mealType" 
                            className="border p-2 rounded-md bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 flex-1"
                            defaultValue="LUNCH"
                        >
                            <option value="BREAKFAST">Breakfast</option>
                            <option value="LUNCH">Lunch</option>
                            <option value="DINNER">Dinner</option>
                            <option value="SNACK">Snack</option>
                        </select>
                    </div>

                    {/* NEW: Select from Food Library */}
                    <div className="space-y-2 border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                            <ListOrdered size={16} /> Quick Add from Library
                        </label>
                        <select 
                            name="libraryFoodId" 
                            className="border p-2 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={selectedFoodId}
                            onChange={(e) => setSelectedFoodId(e.target.value)} 
                        >
                            <option value="" disabled>-- Select a Custom Food Item --</option>
                            {foodLibrary.map((food) => (
                                <option 
                                    key={food.id} 
                                    value={food.id}
                                >
                                    {food.name} ({food.calories} kcal/100g)
                                </option>
                            ))}
                        </select>
                         {foodLibrary.length === 0 && (
                            <p className="text-sm text-gray-400">Your library is empty. Add foods on the Food Library page!</p>
                        )}
                    </div>
                    
                    {/* NEW: Serving Size Input (Only shown if a food is selected) */}
                    {selectedFood && (
                        <div className="grid grid-cols-2 gap-4 items-end bg-gray-50 p-3 rounded-md">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Serving Size</label>
                                <input 
                                    name="servingSizeGrams" 
                                    type="number" 
                                    placeholder="Grams (g)" 
                                    min="1"
                                    required 
                                    value={servingSizeGrams}
                                    onChange={(e) => setServingSizeGrams(parseInt(e.target.value) || 0)}
                                    className="border p-2 rounded-md w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                            <div className='text-right'>
                                <p className="text-sm font-medium text-gray-700">Selected Food:</p>
                                <p className="text-lg font-bold text-green-600">{selectedFood.name}</p>
                            </div>
                        </div>
                    )}

                    {/* Final Calculated/Manual Entry Inputs (Used for submission) */}
                    <div className="space-y-4 border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700">
                             {selectedFood ? 'Calculated Macros (Read-Only)' : 'Manual Macro Entry'}
                        </label>
                        
                        {/* INPUT: Description */}
                        <input 
                            name="description" 
                            placeholder={selectedFood ? `Auto-Generated: ${servingSizeGrams}g of ${selectedFood.name}` : "Manual description / Food name"}
                            required 
                            readOnly={!!selectedFood} 
                            className={`border p-2 rounded-md w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 ${selectedFood ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                        />
                        
                        <div className="grid grid-cols-4 gap-4">
                            {/* Calories */}
                            <div className='col-span-1'>
                                <label className="block text-xs text-gray-500">Calories (kcal)</label>
                                <input 
                                    name="calories" 
                                    type="number" 
                                    placeholder="kcal" 
                                    required 
                                    readOnly={!!selectedFood} 
                                    value={selectedFood ? calculatedMacros.calories : manualCalories}
                                    onChange={(e) => setManualCalories(parseInt(e.target.value) || 0)}
                                    className={`border p-2 rounded-md w-full ${selectedFood ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                />
                            </div>
                            
                            {/* Protein */}
                            <div className='col-span-1'>
                                <label className="block text-xs text-gray-500">Protein (g)</label>
                                <input 
                                    name="proteinG" 
                                    type="number" 
                                    placeholder="P (g)" 
                                    required 
                                    readOnly={!!selectedFood} 
                                    value={selectedFood ? calculatedMacros.proteinG : manualProteinG}
                                    onChange={(e) => setManualProteinG(parseInt(e.target.value) || 0)}
                                    className={`border p-2 rounded-md w-full ${selectedFood ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                />
                            </div>
                            
                            {/* Fat */}
                            <div className='col-span-1'>
                                <label className="block text-xs text-gray-500">Fat (g)</label>
                                <input 
                                    name="fatG" 
                                    type="number" 
                                    placeholder="F (g)" 
                                    required 
                                    readOnly={!!selectedFood} 
                                    value={selectedFood ? calculatedMacros.fatG : manualFatG}
                                    onChange={(e) => setManualFatG(parseInt(e.target.value) || 0)}
                                    className={`border p-2 rounded-md w-full ${selectedFood ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                />
                            </div>
                            
                            {/* Carbs */}
                            <div className='col-span-1'>
                                <label className="block text-xs text-gray-500">Carbs (g)</label>
                                <input 
                                    name="carbsG" 
                                    type="number" 
                                    placeholder="C (g)" 
                                    required 
                                    readOnly={!!selectedFood} 
                                    value={selectedFood ? calculatedMacros.carbsG : manualCarbsG}
                                    onChange={(e) => setManualCarbsG(parseInt(e.target.value) || 0)}
                                    className={`border p-2 rounded-md w-full ${selectedFood ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* BUTTON: Submit */}
                    <button type="submit" className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors font-semibold">
                        Log Meal
                    </button>
                </form>
            </div>

            {/* 2. Recent Log List */}
            <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold mb-3">Recently Logged Items</h2>
                <ul className="bg-white p-4 rounded-xl border max-h-96 overflow-y-auto shadow-md">
                    {recentLog.map((item: LogEntry, index: number) => (
                        <li key={item.id} className="border-b last:border-b-0 py-2 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-800">{item.description}</p>
                                <p className="text-sm text-gray-500">
                                    {item.calories} kcal · {item.proteinG}g P · {item.carbsG}g C · {item.fatG}g F
                                </p>
                            </div>
                            
                            {/* NEW: Delete Form for individual item */}
                            <form action={handleDelete(item.id)}>
                                <DeleteButton />
                            </form>
                        </li>
                    ))}
                     {recentLog.length === 0 && (
                        <p className="text-center text-gray-400 py-4">No recent logs. Start tracking!</p>
                    )}
                </ul>
            </div>
        </div>
    );
}