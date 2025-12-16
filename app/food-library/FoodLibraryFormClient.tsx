'use client';

import { useActionState } from 'react';
import { addFoodAction } from '@/lib/actions';
import { PlusCircle } from 'lucide-react';

const initialState = {
  message: '',
  success: false,
};

export default function FoodLibraryFormClient() {
  const [state, formAction, isPending] = useActionState(addFoodAction, initialState);

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
      <h3 className="text-xl font-semibold mb-4">Add New Food Item (per 100g)</h3>

      {state.message && (
        <div className={`mb-4 p-3 rounded-md ${state.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {state.message}
        </div>
      )}

      <form action={formAction} className="grid grid-cols-6 gap-3">
        <input
          name="name"
          placeholder="Food Name (e.g., Apple)"
          className="border p-2 rounded-md col-span-2"
          required
          disabled={isPending}
        />
        <input
          name="calories"
          type="number"
          placeholder="Calories (kcal)"
          className="border p-2 rounded-md"
          required
          min="0"
          disabled={isPending}
        />

        {/* Macro Inputs */}
        <input
          name="protein_g"
          type="number"
          step="0.1"
          placeholder="Protein (g)"
          className="border p-2 rounded-md"
          min="0"
          disabled={isPending}
        />
        <input
          name="carbs_g"
          type="number"
          step="0.1"
          placeholder="Carbs (g)"
          className="border p-2 rounded-md"
          min="0"
          disabled={isPending}
        />
        <input
          name="fat_g"
          type="number"
          step="0.1"
          placeholder="Fat (g)"
          className="border p-2 rounded-md"
          min="0"
          disabled={isPending}
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center justify-center gap-1 col-span-6 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPending}
        >
          <PlusCircle size={18} /> {isPending ? 'Adding...' : 'Add Food'}
        </button>
      </form>
    </div>
  );
}
