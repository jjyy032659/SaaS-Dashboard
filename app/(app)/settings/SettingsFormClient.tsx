// app/settings/SettingsFormClient.tsx (Updated)
'use client';
// app/settings/SettingsFormClient.tsx (CORRECT)
import { useActionState, useState, useRef } from 'react'; // <-- FIX: useActionState from 'react'
import { useFormStatus } from 'react-dom'; // <-- useFormStatus from 'react-dom'
import { User, Target, BarChart3, AlertTriangle, Sparkles, Brain } from "lucide-react";
import GoalAdvisorModal from './GoalAdvisorModal';

// Define the state type for the form feedback (matching lib/actions.tsx)
interface FormState {
  message: string;
  success: boolean;
  fieldErrors?: Record<string, string[]>;
}

// Define the props structure
interface SettingsFormClientProps {
    updateProfileAndGoalsAction: (prevState: FormState, formData: FormData) => Promise<FormState>;
    generateGoalRecommendationsAction: (prevState: FormState, formData: FormData) => Promise<FormState>;
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
    isPremium: boolean;
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


export default function SettingsFormClient({ updateProfileAndGoalsAction, generateGoalRecommendationsAction, defaults, isPremium }: SettingsFormClientProps) {

    const [state, formAction] = useActionState(updateProfileAndGoalsAction, { message: '', success: false });
    const [modalOpen, setModalOpen] = useState(false);

    // Refs for form inputs to update them programmatically
    const calorieGoalRef = useRef<HTMLInputElement>(null);
    const macroProteinRef = useRef<HTMLInputElement>(null);
    const macroFatRef = useRef<HTMLInputElement>(null);
    const macroCarbsRef = useRef<HTMLInputElement>(null);

    // Helper to extract Zod error for a specific field
    const getError = (fieldName: keyof typeof defaults) => {
        if (state.fieldErrors && state.fieldErrors[fieldName]) {
            return state.fieldErrors[fieldName]?.[0];
        }
        return null;
    };

    // Callback to apply AI recommendations to the form
    const handleApplyRecommendations = (recommendations: {
        calorieGoal: number;
        macroProteinG: number;
        macroFatG: number;
        macroCarbsG: number;
    }) => {
        if (calorieGoalRef.current) calorieGoalRef.current.value = String(recommendations.calorieGoal);
        if (macroProteinRef.current) macroProteinRef.current.value = String(recommendations.macroProteinG);
        if (macroFatRef.current) macroFatRef.current.value = String(recommendations.macroFatG);
        if (macroCarbsRef.current) macroCarbsRef.current.value = String(recommendations.macroCarbsG);
    };

    return (
        <>
            <form action={formAction} className="space-y-4"> 
            
            {/* Display Feedback Message */}
            {state.message && (
                <div className={`p-3 rounded-md mb-4 text-center text-sm font-medium ${state.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {state.message}
                </div>
            )}
            
            {/* Display General Validation Error (if validation failed but no field-specific errors were found) */}
            {!state.success && state.message && !state.fieldErrors && (
                <div className="p-3 rounded-md mb-4 bg-red-100 text-red-700 text-sm font-medium flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {state.message}
                </div>
            )}

            {/* AI Goal Advisor Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6 rounded-2xl border-2 border-purple-300 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-white/20 p-3 rounded-xl">
                            <Brain size={28} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                <Sparkles size={20} />
                                Need Help Setting Goals?
                            </h3>
                            <p className="text-purple-100">
                                Let our AI calculate personalized targets based on your biometrics and goals
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
                    >
                        <Sparkles size={18} />
                        Get AI Recommendations
                    </button>
                </div>
            </div>

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
                            <input name="age" type="number" defaultValue={defaults.age} required min="1" className={`border p-2 rounded-md w-full mt-1 ${getError('age') ? 'border-red-500' : ''}`} />
                            {getError('age') && <p className="text-xs text-red-500 mt-1">{getError('age')}</p>}
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Height (cm)</span>
                            <input name="heightCm" type="number" defaultValue={defaults.heightCm} required min="50" className={`border p-2 rounded-md w-full mt-1 ${getError('heightCm') ? 'border-red-500' : ''}`} />
                            {getError('heightCm') && <p className="text-xs text-red-500 mt-1">{getError('heightCm')}</p>}
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Weight (kg)</span>
                            <input name="currentWeightKg" type="number" step="0.1" defaultValue={defaults.currentWeightKg} required min="10" className={`border p-2 rounded-md w-full mt-1 ${getError('currentWeightKg') ? 'border-red-500' : ''}`} />
                            {getError('currentWeightKg') && <p className="text-xs text-red-500 mt-1">{getError('currentWeightKg')}</p>}
                        </label>
                    </div>
                    
                    {/* Activity Level */}
                    <div className="mt-4">
                         <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700">Activity Level</label>
                        <select 
                            name="activityLevel" 
                            defaultValue={defaults.activityLevel}
                            className={`border p-2 rounded-md w-full bg-gray-50 mt-1 ${getError('activityLevel') ? 'border-red-500' : ''}`}
                        >
                            <option value="" disabled>-- Select Activity Level --</option>
                            <option value="sedentary">Sedentary (Little or no exercise)</option>
                            <option value="light">Lightly Active (1-3 days/week)</option>
                            <option value="moderate">Moderately Active (3-5 days/week)</option>
                            <option value="very">Very Active (6-7 days/week)</option>
                            <option value="super">Super Active (Twice a day/Heavy labor)</option>
                        </select>
                        {getError('activityLevel') && <p className="text-xs text-red-500 mt-1">{getError('activityLevel')}</p>}
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
                        <input ref={calorieGoalRef} name="calorieGoal" type="number" defaultValue={defaults.calorieGoal} required min="500" className={`border p-2 rounded-md w-full mt-1 ${getError('calorieGoal') ? 'border-red-500' : ''}`} />
                        {getError('calorieGoal') && <p className="text-xs text-red-500 mt-1">{getError('calorieGoal')}</p>}
                    </label>

                    {/* Macro Goals (Protein, Fat, Carbs) */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Protein (g)</span>
                            <input ref={macroProteinRef} name="macroProteinG" type="number" defaultValue={defaults.macroProteinG} required min="0" className={`border p-2 rounded-md w-full mt-1 ${getError('macroProteinG') ? 'border-red-500' : ''}`} />
                            {getError('macroProteinG') && <p className="text-xs text-red-500 mt-1">{getError('macroProteinG')}</p>}
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Fat (g)</span>
                            <input ref={macroFatRef} name="macroFatG" type="number" defaultValue={defaults.macroFatG} required min="0" className={`border p-2 rounded-md w-full mt-1 ${getError('macroFatG') ? 'border-red-500' : ''}`} />
                            {getError('macroFatG') && <p className="text-xs text-red-500 mt-1">{getError('macroFatG')}</p>}
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Carbs (g)</span>
                            <input ref={macroCarbsRef} name="macroCarbsG" type="number" defaultValue={defaults.macroCarbsG} required min="0" className={`border p-2 rounded-md w-full mt-1 ${getError('macroCarbsG') ? 'border-red-500' : ''}`} />
                            {getError('macroCarbsG') && <p className="text-xs text-red-500 mt-1">{getError('macroCarbsG')}</p>}
                        </label>
                    </div>
                </div>
            </div>
            
            {/* The single submit button for the entire form */}
            <SubmitButton />
        </form>

        {/* Goal Advisor Modal */}
        <GoalAdvisorModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onApplyRecommendations={handleApplyRecommendations}
            generateGoalRecommendationsAction={generateGoalRecommendationsAction}
        />
        </>
    );
}