// app/settings/SettingsFormClient.tsx
'use client';
// app/settings/SettingsFormClient.tsx (CORRECT)
import { useActionState } from 'react'; // <-- useActionState from 'react'
import { useFormStatus } from 'react-dom'; // <-- useFormStatus from 'react-dom' (Keep this one)
import { User, BarChart3 } from "lucide-react";

// Define the state type for the form feedback
interface FormState {
  message: string;
  success: boolean;
}

// Define the props structure
interface SettingsFormClientProps {
    updateProfileAndGoalsAction: (prevState: FormState, formData: FormData) => Promise<FormState>;
    defaults: {
        age: number;
        heightCm: number;
        currentWeightKg: number;
        activityLevel: string;
        calorieGoal: number;
        macroProteinG: number;
        macroFatG: number;
        macroCarbsG: number;
    };
}

// Separate component for the submit button to show pending state
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors font-semibold mt-6 disabled:bg-gray-400"
      disabled={pending}
    >
      {pending ? 'Saving...' : 'Save Biometrics & Goals'}
    </button>
  );
}


export default function SettingsFormClient({ updateProfileAndGoalsAction, defaults }: SettingsFormClientProps) {
    
    // Use useActionState to manage form submission and feedback
    const [state, formAction] = useActionState(updateProfileAndGoalsAction, { message: '', success: false });

    return (
        // ONE SINGLE FORM WRAPPER handles ALL inputs below
        <form action={formAction} className="space-y-4"> 
            
            {/* Display Feedback Message */}
            {state.message && (
                <div className={`p-3 rounded-md mb-4 text-center text-sm font-medium ${state.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {state.message}
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. Biometrics Section */}
                <div className="bg-white p-6 rounded-xl border shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                        <User size={20} /> Personal Biometrics
                    </h2>
                    
                    {/* Age / Height / Weight */}
                    <div className="grid grid-cols-3 gap-3">
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Age</span>
                            <input name="age" type="number" defaultValue={defaults.age} required min="1" className="border p-2 rounded-md w-full mt-1" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Height (cm)</span>
                            <input name="heightCm" type="number" defaultValue={defaults.heightCm} required min="50" className="border p-2 rounded-md w-full mt-1" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Weight (kg)</span>
                            <input name="currentWeightKg" type="number" step="0.1" defaultValue={defaults.currentWeightKg} required min="10" className="border p-2 rounded-md w-full mt-1" />
                        </label>
                    </div>
                    
                    {/* Activity Level */}
                    <div className="mt-4">
                         <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700">Activity Level</label>
                        <select 
                            name="activityLevel" 
                            defaultValue={defaults.activityLevel}
                            className="border p-2 rounded-md w-full bg-gray-50 mt-1"
                        >
                            <option value="sedentary">Sedentary (Little or no exercise)</option>
                            <option value="light">Lightly Active (1-3 days/week)</option>
                            <option value="moderate">Moderately Active (3-5 days/week)</option>
                            <option value="very">Very Active (6-7 days/week)</option>
                            <option value="super">Super Active (Twice a day/Heavy labor)</option>
                        </select>
                    </div>
                </div>

                {/* 2. Goal Setting Section */}
                <div className="bg-white p-6 rounded-xl border shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                        <BarChart3 size={20} /> Daily Macro Goals
                    </h2>
                    
                    {/* Calorie Goal */}
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Calorie Goal (kcal/day)</span>
                        <input name="calorieGoal" type="number" defaultValue={defaults.calorieGoal} required min="500" className="border p-2 rounded-md w-full mt-1" />
                    </label>

                    {/* Macro Goals (Protein, Fat, Carbs) */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Protein (g)</span>
                            <input name="macroProteinG" type="number" defaultValue={defaults.macroProteinG} required min="0" className="border p-2 rounded-md w-full mt-1" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Fat (g)</span>
                            <input name="macroFatG" type="number" defaultValue={defaults.macroFatG} required min="0" className="border p-2 rounded-md w-full mt-1" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Carbs (g)</span>
                            <input name="macroCarbsG" type="number" defaultValue={defaults.macroCarbsG} required min="0" className="border p-2 rounded-md w-full mt-1" />
                        </label>
                    </div>
                </div>
            </div>
            
            {/* The single submit button for the entire form */}
            <SubmitButton />
        </form>
    );
}