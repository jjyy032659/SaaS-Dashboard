'use client';

import { useState, useMemo } from 'react';
import { useActionState } from 'react';
import { addFoodAction } from '@/lib/actions';
import { PlusCircle, Search, XCircle } from 'lucide-react';
import { GlobalFoodItem, searchGlobalFoods } from '@/lib/globalFoods';

const initialState = {
  message: '',
  success: false,
};

export default function FoodLibraryFormClient() {
  const [state, formAction, isPending] = useActionState(addFoodAction, initialState);

  // Autocomplete state
  const [searchTerm, setSearchTerm] = useState('');
  const [autoFilledFood, setAutoFilledFood] = useState<GlobalFoodItem | null>(null);

  // Manual input state (used when not autofilled)
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');

  // Search for global food suggestions
  const globalSuggestions = useMemo(() => {
    if (autoFilledFood) return [];
    return searchGlobalFoods(searchTerm);
  }, [searchTerm, autoFilledFood]);

  // Handle clicking a suggestion
  const handleSuggestionClick = (food: GlobalFoodItem) => {
    setAutoFilledFood(food);
    setSearchTerm(food.name);
  };

  // Clear autofill
  const clearAutofill = () => {
    setAutoFilledFood(null);
    setSearchTerm('');
  };

  // Determine if fields are readonly
  const isAutofilled = !!autoFilledFood;

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <PlusCircle size={20} /> Add New Food Item (per 100g)
      </h3>

      {state.message && (
        <div className={`mb-4 p-3 rounded-md ${state.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Autocomplete Search */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
            <Search size={16} /> Search Food Database or Enter Custom Name
          </label>
          <div className="relative">
            <input
              name="name"
              type="text"
              placeholder="e.g., Chicken, Egg, Apple (or enter custom name)"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (isAutofilled && e.target.value !== autoFilledFood!.name) {
                  clearAutofill();
                }
              }}
              className="border p-2 rounded-md w-full focus:ring-2 focus:ring-green-500"
              required
              disabled={isPending}
            />
            {isAutofilled && (
              <button
                type="button"
                onClick={clearAutofill}
                className="absolute right-2 top-2 text-gray-500 hover:text-red-500"
              >
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
                    {food.name} ({food.calories} kcal • P: {food.proteinG}g • C: {food.carbsG}g • F: {food.fatG}g)
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Macro Inputs */}
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Calories (kcal)</label>
            <input
              name="calories"
              type="number"
              placeholder="kcal"
              value={isAutofilled ? autoFilledFood!.calories : manualCalories}
              onChange={(e) => setManualCalories(e.target.value)}
              readOnly={isAutofilled}
              className={`border p-2 rounded-md w-full mt-1 ${isAutofilled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required
              min="0"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
            <input
              name="protein_g"
              type="number"
              step="0.1"
              placeholder="Protein"
              value={isAutofilled ? autoFilledFood!.proteinG : manualProtein}
              onChange={(e) => setManualProtein(e.target.value)}
              readOnly={isAutofilled}
              className={`border p-2 rounded-md w-full mt-1 ${isAutofilled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required
              min="0"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Carbs (g)</label>
            <input
              name="carbs_g"
              type="number"
              step="0.1"
              placeholder="Carbs"
              value={isAutofilled ? autoFilledFood!.carbsG : manualCarbs}
              onChange={(e) => setManualCarbs(e.target.value)}
              readOnly={isAutofilled}
              className={`border p-2 rounded-md w-full mt-1 ${isAutofilled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required
              min="0"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fat (g)</label>
            <input
              name="fat_g"
              type="number"
              step="0.1"
              placeholder="Fat"
              value={isAutofilled ? autoFilledFood!.fatG : manualFat}
              onChange={(e) => setManualFat(e.target.value)}
              readOnly={isAutofilled}
              className={`border p-2 rounded-md w-full mt-1 ${isAutofilled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required
              min="0"
              disabled={isPending}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={isPending}
        >
          <PlusCircle size={18} /> {isPending ? 'Adding to Library...' : 'Add to Library'}
        </button>
      </form>
    </div>
  );
}
