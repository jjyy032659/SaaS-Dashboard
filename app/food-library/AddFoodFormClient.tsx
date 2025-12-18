// app/food-library/AddFoodFormClient.tsx
'use client';

import { useState, useMemo, useCallback } from 'react';
import { useActionState, useFormStatus } from 'react-dom';
import { PlusCircle, Search, XCircle } from 'lucide-react';

// Import the global food search utility
import { GlobalFoodItem, searchGlobalFoods } from '@/lib/globalFoods'; 

interface FormState {
    message: string;
    success: boolean;
}

interface AddFoodFormClientProps {
    addFoodAction: (prevState: FormState, formData: FormData) => Promise<FormState>;
}

// Separate component for the submit button
function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors font-semibold mt-4 disabled:bg-gray-400"
        >
            {pending ? 'Adding...' : 'Add to Library'}
        </button>
    );
}

export default function AddFoodFormClient({ addFoodAction }: AddFoodFormClientProps) {
    const [state, formAction] = useActionState(addFoodAction, { success: false, message: '' });

    // --- State Variables ---
    const [searchTerm, setSearchTerm] = useState('');
    const [autoFilledFood, setAutoFilledFood] = useState<GlobalFoodItem | null>(null);

    // --- Autocomplete Logic ---
    const globalSuggestions = useMemo(() => {
        if (autoFilledFood) return [];
        return searchGlobalFoods(searchTerm);
    }, [searchTerm, autoFilledFood]);
    
    const handleSuggestionClick = useCallback((food: GlobalFoodItem) => {
        setAutoFilledFood(food);
        setSearchTerm(food.name); // Lock the search box value
    }, []);

    const clearAutofill = useCallback(() => {
        setAutoFilledFood(null);
        setSearchTerm('');
    }, []);

    // Helper to determine if we are using autofilled data
    const isAutofilled = !!autoFilledFood;

    // Helper function to handle form submission with the correct data
    const handleSubmit = (formData: FormData) => {
        if (isAutofilled) {
            // Overwrite form data with validated, autofilled values
            formData.set('name', autoFilledFood!.name);
            formData.set('calories', autoFilledFood!.calories.toString());
            formData.set('protein_g', autoFilledFood!.proteinG.toString());
            formData.set('carbs_g', autoFilledFood!.carbsG.toString());
            formData.set('fat_g', autoFilledFood!.fatG.toString());
        } else {
             // For manual entry, ensure name is used for search term
             formData.set('name', searchTerm);
        }

        // Trigger the server action
        formAction(formData);

        // Reset state after action is dispatched (will reset on success)
        if (state.success) {
            clearAutofill();
        }
    };
    
    // --- Render Logic Helpers ---
    const currentCalories = isAutofilled ? autoFilledFood!.calories : 0;
    const currentProteinG = isAutofilled ? autoFilledFood!.proteinG : 0;
    const currentCarbsG = isAutofilled ? autoFilledFood!.carbsG : 0;
    const currentFatG = isAutofilled ? autoFilledFood!.fatG : 0;

    return (
        <form action={handleSubmit} className="space-y-4"> 
            
            {/* Status Message */}
            {state.message && (
                <div className={`p-3 rounded-md mb-4 text-sm font-medium ${state.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {state.message}
                </div>
            )}
            
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                <PlusCircle size={20} /> Add New Food
            </h2>

            {/* NEW: Autocomplete Search Input */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Search size={16} /> Search & Autofill (or Enter Manually)
                </label>
                <div className="relative">
                    <input 
                        name="name" // This input will submit the name, but we override if autofilled
                        type="text" 
                        placeholder="e.g., egg, apple, oats" 
                        value={searchTerm}
                        readOnly={isAutofilled}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            // Clear autofill if user starts typing again
                            if (isAutofilled && e.target.value !== autoFilledFood!.name) {
                                clearAutofill();
                            }
                        }}
                        className={`border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isAutofilled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                    />
                    {isAutofilled && (
                        <button type="button" onClick={clearAutofill} className="absolute right-2 top-2 text-gray-500 hover:text-red-500">
                            <XCircle size={18} />
                        </button>
                    )}
                    
                    {/* Suggestions Dropdown */}
                    {!isAutofilled && globalSuggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                            {globalSuggestions.map((food, index) => (
                                <li 
                                    key={index}
                                    onClick={() => handleSuggestionClick(food)}
                                    className="p-2 cursor-pointer hover:bg-gray-100 text-sm border-b last:border-b-0"
                                >
                                    {food.name} ({food.calories} kcal/100g)
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Macro Inputs */}
            <div className="grid grid-cols-4 gap-3">
                
                {/* Calories */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Calories</span>
                    <input 
                        name="calories" 
                        type="number" 
                        value={isAutofilled ? currentCalories : undefined} 
                        onChange={(e) => {
                            if (!isAutofilled) setSearchTerm(e.target.value); // Use searchTerm as a proxy for manual value here if needed
                        }}
                        readOnly={isAutofilled}
                        required 
                        min="1" 
                        placeholder={isAutofilled ? currentCalories.toString() : 'kcal'}
                        className={`border p-2 rounded-md w-full mt-1 ${isAutofilled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                    />
                </label>
                
                {/* Protein */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Protein (g)</span>
                    <input 
                        name="protein_g" 
                        type="number" 
                        step="0.1" 
                        value={isAutofilled ? currentProteinG : undefined} 
                        readOnly={isAutofilled}
                        required 
                        min="0" 
                        placeholder={isAutofilled ? currentProteinG.toString() : 'g'}
                        className={`border p-2 rounded-md w-full mt-1 ${isAutofilled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                    />
                </label>

                {/* Carbs */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Carbs (g)</span>
                    <input 
                        name="carbs_g" 
                        type="number" 
                        step="0.1" 
                        value={isAutofilled ? currentCarbsG : undefined} 
                        readOnly={isAutofilled}
                        required 
                        min="0" 
                        placeholder={isAutofilled ? currentCarbsG.toString() : 'g'}
                        className={`border p-2 rounded-md w-full mt-1 ${isAutofilled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                    />
                </label>

                {/* Fat */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Fat (g)</span>
                    <input 
                        name="fat_g" 
                        type="number" 
                        step="0.1" 
                        value={isAutofilled ? currentFatG : undefined} 
                        readOnly={isAutofilled}
                        required 
                        min="0" 
                        placeholder={isAutofilled ? currentFatG.toString() : 'g'}
                        className={`border p-2 rounded-md w-full mt-1 ${isAutofilled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                    />
                </label>
            </div>
            
            <SubmitButton />
        </form>
    );
}