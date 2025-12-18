// app/settings/GoalAdvisorModal.tsx
'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { X, Sparkles, Brain, CheckCircle2, AlertCircle, Target } from 'lucide-react';

interface GoalAdvisorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyRecommendations: (recommendations: {
        calorieGoal: number;
        macroProteinG: number;
        macroFatG: number;
        macroCarbsG: number;
    }) => void;
    generateGoalRecommendationsAction: (prevState: any, formData: FormData) => Promise<any>;
}

export default function GoalAdvisorModal({
    isOpen,
    onClose,
    onApplyRecommendations,
    generateGoalRecommendationsAction,
}: GoalAdvisorModalProps) {
    const [state, formAction, isPending] = useActionState(generateGoalRecommendationsAction, {
        success: false,
        message: '',
    });

    if (!isOpen) return null;

    const handleApply = () => {
        if (state.success && state.goalRecommendation) {
            onApplyRecommendations({
                calorieGoal: state.goalRecommendation.calorieGoal,
                macroProteinG: state.goalRecommendation.macroProteinG,
                macroFatG: state.goalRecommendation.macroFatG,
                macroCarbsG: state.goalRecommendation.macroCarbsG,
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Brain size={32} className="text-white" />
                            <div>
                                <h2 className="text-2xl font-bold text-white">AI Goal Advisor</h2>
                                <p className="text-purple-100">Get personalized nutrition recommendations</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form action={formAction} className="p-6 space-y-6">
                    {!state.success && (
                        <>
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-blue-800">
                                    <span className="font-bold">How it works:</span> Our AI uses the Mifflin-St Jeor equation
                                    to calculate your BMR and TDEE, then provides personalized macro targets based on your goals.
                                </p>
                            </div>

                            {/* Biometrics Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-200 pb-2">
                                    Your Biometrics
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Age
                                        </label>
                                        <input
                                            type="number"
                                            name="age"
                                            required
                                            min="18"
                                            max="100"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                            placeholder="e.g., 25"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Gender
                                        </label>
                                        <select
                                            name="gender"
                                            required
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                        >
                                            <option value="">Select...</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Height (cm)
                                        </label>
                                        <input
                                            type="number"
                                            name="heightCm"
                                            required
                                            min="100"
                                            max="250"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                            placeholder="e.g., 175"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Weight (kg)
                                        </label>
                                        <input
                                            type="number"
                                            name="currentWeightKg"
                                            required
                                            min="30"
                                            max="300"
                                            step="0.1"
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                            placeholder="e.g., 70"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Activity & Goal Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-200 pb-2">
                                    Your Lifestyle
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Activity Level
                                    </label>
                                    <select
                                        name="activityLevel"
                                        required
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="">Select...</option>
                                        <option value="sedentary">Sedentary (little to no exercise)</option>
                                        <option value="light">Lightly Active (1-3 days/week)</option>
                                        <option value="moderate">Moderately Active (3-5 days/week)</option>
                                        <option value="very">Very Active (6-7 days/week)</option>
                                        <option value="super">Super Active (athlete, 2x/day)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Goal
                                    </label>
                                    <select
                                        name="goal"
                                        required
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="">Select...</option>
                                        <option value="lose">Lose Weight (20% calorie deficit)</option>
                                        <option value="maintain">Maintain Weight</option>
                                        <option value="gain">Gain Muscle (10% calorie surplus)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Error Display */}
                            {!state.success && state.message && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800">{state.message}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Calculating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        Generate AI Recommendations
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    {/* Results Display */}
                    {state.success && state.goalRecommendation && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
                                <CheckCircle2 size={24} className="text-green-600 flex-shrink-0" />
                                <p className="text-green-800 font-medium">
                                    AI recommendations generated successfully!
                                </p>
                            </div>

                            {/* Recommended Targets */}
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Target size={24} className="text-purple-600" />
                                    Your Personalized Targets
                                </h3>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                                        <p className="text-sm text-red-700 mb-1">Calories</p>
                                        <p className="text-3xl font-bold text-red-900">
                                            {state.goalRecommendation.calorieGoal}
                                        </p>
                                        <p className="text-xs text-red-600 mt-1">kcal/day</p>
                                    </div>

                                    <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                                        <p className="text-sm text-green-700 mb-1">Protein</p>
                                        <p className="text-3xl font-bold text-green-900">
                                            {state.goalRecommendation.macroProteinG}
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">grams/day</p>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                                        <p className="text-sm text-blue-700 mb-1">Carbs</p>
                                        <p className="text-3xl font-bold text-blue-900">
                                            {state.goalRecommendation.macroCarbsG}
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">grams/day</p>
                                    </div>

                                    <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
                                        <p className="text-sm text-amber-700 mb-1">Fat</p>
                                        <p className="text-3xl font-bold text-amber-900">
                                            {state.goalRecommendation.macroFatG}
                                        </p>
                                        <p className="text-xs text-amber-600 mt-1">grams/day</p>
                                    </div>
                                </div>

                                {/* Explanation */}
                                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                                    <p className="text-sm font-medium text-purple-700 mb-2">Why These Targets?</p>
                                    <p className="text-sm text-purple-900 leading-relaxed">
                                        {state.goalRecommendation.explanation}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleApply}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                                >
                                    Apply These Goals
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
