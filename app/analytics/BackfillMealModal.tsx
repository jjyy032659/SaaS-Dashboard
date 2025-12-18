// app/analytics/BackfillMealModal.tsx (Enhanced with AI and Multi-Entry Support)
'use client';

import { useState, useMemo } from 'react';
import { Calendar, X, Search, XCircle, Camera, Zap, Utensils, Check } from 'lucide-react';
import { GlobalFoodItem, searchGlobalFoods } from '@/lib/globalFoods';

interface FormState {
    message: string;
    success: boolean;
    fieldErrors?: Record<string, string[]>;
    aiSuggestion?: {
        description: string;
        calories: number;
        proteinG: number;
        fatG: number;
        carbsG: number;
    };
}

interface BackfillMealModalProps {
    isOpen: boolean;
    onClose: () => void;
    missingDays: string[]; // YYYY-MM-DD format
    logHistoricalMealAction: (prevState: FormState, formData: FormData) => Promise<FormState>;
    analyzeImageAction: (prevState: FormState, formData: FormData) => Promise<FormState>;
}

interface LoggedMeal {
    description: string;
    mealType: string;
    calories: number;
    proteinG: number;
    fatG: number;
    carbsG: number;
}

export default function BackfillMealModal({
    isOpen,
    onClose,
    missingDays,
    logHistoricalMealAction,
    analyzeImageAction
}: BackfillMealModalProps) {
    const [selectedDate, setSelectedDate] = useState('');
    const [entryMode, setEntryMode] = useState<'manual' | 'ai'>('manual');

    // Session tracking - meals logged during this modal session
    const [sessionMeals, setSessionMeals] = useState<LoggedMeal[]>([]);
    const [statusMessage, setStatusMessage] = useState<FormState>({ success: false, message: '' });

    // Manual Entry State
    const [mealType, setMealType] = useState<string>('LUNCH');
    const [servingSize, setServingSize] = useState(100);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFood, setSelectedFood] = useState<GlobalFoodItem | null>(null);
    const [manualCalories, setManualCalories] = useState(0);
    const [manualProteinG, setManualProteinG] = useState(0);
    const [manualFatG, setManualFatG] = useState(0);
    const [manualCarbsG, setManualCarbsG] = useState(0);

    // AI Entry State
    const [aiMealType, setAiMealType] = useState<string>('LUNCH');
    const [base64Image, setBase64Image] = useState<string>('');
    const [aiAnalyzing, setAiAnalyzing] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<FormState['aiSuggestion'] | null>(null);

    // Calculate macros for manual entry
    const calculatedMacros = useMemo(() => {
        if (!selectedFood || servingSize <= 0) {
            return { calories: manualCalories, proteinG: manualProteinG, fatG: manualFatG, carbsG: manualCarbsG };
        }
        const ratio = servingSize / 100;
        return {
            calories: Math.round(selectedFood.calories * ratio),
            proteinG: Math.round(selectedFood.proteinG * ratio),
            fatG: Math.round(selectedFood.fatG * ratio),
            carbsG: Math.round(selectedFood.carbsG * ratio),
        };
    }, [selectedFood, servingSize, manualCalories, manualProteinG, manualFatG, manualCarbsG]);

    // Search suggestions for manual entry
    const suggestions = useMemo(() => {
        if (selectedFood) return [];
        return searchGlobalFoods(searchTerm);
    }, [searchTerm, selectedFood]);

    // Session totals
    const sessionTotals = useMemo(() => {
        return sessionMeals.reduce((acc, meal) => ({
            calories: acc.calories + meal.calories,
            proteinG: acc.proteinG + meal.proteinG,
            fatG: acc.fatG + meal.fatG,
            carbsG: acc.carbsG + meal.carbsG,
        }), { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 });
    }, [sessionMeals]);

    // Handle suggestion click
    const handleSuggestionClick = (food: GlobalFoodItem) => {
        setSelectedFood(food);
        setSearchTerm(food.name);
        setServingSize(100);
    };

    // Clear manual selection
    const clearManualSelection = () => {
        setSelectedFood(null);
        setSearchTerm('');
        setServingSize(100);
        setManualCalories(0);
        setManualProteinG(0);
        setManualFatG(0);
        setManualCarbsG(0);
    };

    // Handle AI image upload
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setBase64Image('');
            setAiSuggestion(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image too large. Please use images under 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setBase64Image(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Analyze AI image
    const handleAIAnalyze = async () => {
        if (!base64Image) {
            setStatusMessage({ success: false, message: 'Please select an image first.' });
            return;
        }

        setAiAnalyzing(true);
        setAiSuggestion(null);

        const formData = new FormData();
        formData.set('base64Image', base64Image);
        formData.set('mealType', aiMealType);

        const result = await analyzeImageAction({ success: false, message: '' }, formData);
        setAiAnalyzing(false);

        if (result.success && result.aiSuggestion) {
            setAiSuggestion(result.aiSuggestion);
            setStatusMessage({ success: true, message: 'AI analysis complete! Review and log below.' });
        } else {
            setStatusMessage({ success: false, message: result.message });
        }
    };

    // Log manual entry
    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDate) {
            setStatusMessage({ success: false, message: 'Please select a date first.' });
            return;
        }

        if (!searchTerm.trim()) {
            setStatusMessage({ success: false, message: 'Please provide a food description.' });
            return;
        }

        const formData = new FormData();
        formData.set('targetDate', selectedDate);
        formData.set('mealType', mealType);
        formData.set('description', `${servingSize}g of ${searchTerm}`);
        formData.set('calories', calculatedMacros.calories.toString());
        formData.set('proteinG', calculatedMacros.proteinG.toString());
        formData.set('fatG', calculatedMacros.fatG.toString());
        formData.set('carbsG', calculatedMacros.carbsG.toString());

        const result = await logHistoricalMealAction({ success: false, message: '' }, formData);
        setStatusMessage(result);

        if (result.success) {
            // Add to session meals
            setSessionMeals(prev => [...prev, {
                description: `${servingSize}g of ${searchTerm}`,
                mealType,
                calories: calculatedMacros.calories,
                proteinG: calculatedMacros.proteinG,
                fatG: calculatedMacros.fatG,
                carbsG: calculatedMacros.carbsG,
            }]);

            // Reset form for next entry
            clearManualSelection();
            setMealType('LUNCH');
        }
    };

    // Log AI entry
    const handleAISubmit = async () => {
        if (!selectedDate || !aiSuggestion) {
            setStatusMessage({ success: false, message: 'Please analyze an image first.' });
            return;
        }

        const formData = new FormData();
        formData.set('targetDate', selectedDate);
        formData.set('mealType', aiMealType);
        formData.set('description', aiSuggestion.description);
        formData.set('calories', aiSuggestion.calories.toString());
        formData.set('proteinG', aiSuggestion.proteinG.toString());
        formData.set('fatG', aiSuggestion.fatG.toString());
        formData.set('carbsG', aiSuggestion.carbsG.toString());

        const result = await logHistoricalMealAction({ success: false, message: '' }, formData);
        setStatusMessage(result);

        if (result.success) {
            // Add to session meals
            setSessionMeals(prev => [...prev, {
                description: aiSuggestion.description,
                mealType: aiMealType,
                calories: aiSuggestion.calories,
                proteinG: aiSuggestion.proteinG,
                fatG: aiSuggestion.fatG,
                carbsG: aiSuggestion.carbsG,
            }]);

            // Reset AI form
            setBase64Image('');
            setAiSuggestion(null);
            setAiMealType('LUNCH');
        }
    };

    // Handle modal close
    const handleClose = () => {
        // Reset all state
        setSelectedDate('');
        setSessionMeals([]);
        clearManualSelection();
        setBase64Image('');
        setAiSuggestion(null);
        setStatusMessage({ success: false, message: '' });
        setEntryMode('manual');
        onClose();
    };

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${weekday}, ${monthDay} (${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago)`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={handleClose}>
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <Calendar className="text-orange-600" size={28} />
                        <div>
                            <h2 className="text-2xl font-bold">Backfill Missing Day</h2>
                            <p className="text-sm text-gray-600">Log multiple meals for a past date</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <X size={28} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Date Selector */}
                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Missing Date *
                        </label>
                        <select
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                setSessionMeals([]); // Reset session when changing date
                            }}
                            className="w-full border border-gray-300 rounded-lg p-3 text-lg font-medium focus:ring-2 focus:ring-orange-500"
                            required
                        >
                            <option value="">Choose a date to backfill...</option>
                            {missingDays.map(date => (
                                <option key={date} value={date}>{formatDate(date)}</option>
                            ))}
                        </select>
                    </div>

                    {selectedDate && (
                        <>
                            {/* Status Message */}
                            {statusMessage.message && (
                                <div className={`p-3 rounded-md text-sm font-medium ${statusMessage.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {statusMessage.message}
                                </div>
                            )}

                            {/* Session Summary */}
                            {sessionMeals.length > 0 && (
                                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Check className="text-green-600" size={20} />
                                        <h3 className="font-bold text-green-800">
                                            Logged {sessionMeals.length} meal{sessionMeals.length > 1 ? 's' : ''} for {formatDate(selectedDate)}
                                        </h3>
                                    </div>
                                    <div className="space-y-2 mb-3">
                                        {sessionMeals.map((meal, idx) => (
                                            <div key={idx} className="bg-white p-2 rounded text-sm flex justify-between items-center">
                                                <span className="font-medium">{meal.description}</span>
                                                <span className="text-xs text-gray-600">
                                                    {meal.calories} kcal | P:{meal.proteinG}g C:{meal.carbsG}g F:{meal.fatG}g
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-green-600 text-white p-3 rounded-lg">
                                        <p className="text-sm font-semibold mb-1">Daily Totals</p>
                                        <div className="grid grid-cols-4 gap-2 text-center">
                                            <div>
                                                <p className="text-xs">Calories</p>
                                                <p className="text-lg font-bold">{sessionTotals.calories}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs">Protein</p>
                                                <p className="text-lg font-bold">{sessionTotals.proteinG}g</p>
                                            </div>
                                            <div>
                                                <p className="text-xs">Carbs</p>
                                                <p className="text-lg font-bold">{sessionTotals.carbsG}g</p>
                                            </div>
                                            <div>
                                                <p className="text-xs">Fat</p>
                                                <p className="text-lg font-bold">{sessionTotals.fatG}g</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Entry Mode Toggle */}
                            <div className="flex gap-2 border-b-2 border-gray-200">
                                <button
                                    onClick={() => setEntryMode('manual')}
                                    className={`flex-1 py-3 px-4 font-semibold transition-colors ${
                                        entryMode === 'manual'
                                            ? 'bg-green-600 text-white rounded-t-lg'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <Utensils className="inline mr-2" size={20} />
                                    Manual Entry
                                </button>
                                <button
                                    onClick={() => setEntryMode('ai')}
                                    className={`flex-1 py-3 px-4 font-semibold transition-colors ${
                                        entryMode === 'ai'
                                            ? 'bg-blue-600 text-white rounded-t-lg'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <Camera className="inline mr-2" size={20} />
                                    AI Photo Analysis
                                </button>
                            </div>

                            {/* Manual Entry Form */}
                            {entryMode === 'manual' && (
                                <form onSubmit={handleManualSubmit} className="space-y-4 bg-green-50 p-5 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type *</label>
                                        <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="w-full border rounded-lg p-3">
                                            <option value="BREAKFAST">Breakfast</option>
                                            <option value="LUNCH">Lunch</option>
                                            <option value="DINNER">Dinner</option>
                                            <option value="SNACK">Snack</option>
                                        </select>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Food Description *</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search 367+ foods or type custom..."
                                                className="w-full border rounded-lg p-3 pl-10 pr-10"
                                                required
                                            />
                                            {selectedFood && (
                                                <button type="button" onClick={clearManualSelection} className="absolute right-3 top-3">
                                                    <XCircle size={20} className="text-gray-400 hover:text-red-600" />
                                                </button>
                                            )}
                                        </div>
                                        {suggestions.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {suggestions.slice(0, 10).map((food, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => handleSuggestionClick(food)}
                                                        className="w-full text-left p-3 hover:bg-green-50 border-b"
                                                    >
                                                        <p className="font-medium text-sm">{food.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {food.calories} kcal, P: {food.proteinG}g, C: {food.carbsG}g, F: {food.fatG}g (per 100g)
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Serving Size (grams) *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={servingSize}
                                            onChange={(e) => setServingSize(parseInt(e.target.value) || 0)}
                                            className="w-full border rounded-lg p-3"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Calories *</label>
                                            <input
                                                type="number"
                                                value={calculatedMacros.calories}
                                                onChange={(e) => setManualCalories(parseInt(e.target.value) || 0)}
                                                className={`w-full border rounded-lg p-3 ${selectedFood ? 'bg-gray-50' : ''}`}
                                                readOnly={!!selectedFood}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Protein (g) *</label>
                                            <input
                                                type="number"
                                                value={calculatedMacros.proteinG}
                                                onChange={(e) => setManualProteinG(parseInt(e.target.value) || 0)}
                                                className={`w-full border rounded-lg p-3 ${selectedFood ? 'bg-gray-50' : ''}`}
                                                readOnly={!!selectedFood}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Carbs (g) *</label>
                                            <input
                                                type="number"
                                                value={calculatedMacros.carbsG}
                                                onChange={(e) => setManualCarbsG(parseInt(e.target.value) || 0)}
                                                className={`w-full border rounded-lg p-3 ${selectedFood ? 'bg-gray-50' : ''}`}
                                                readOnly={!!selectedFood}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Fat (g) *</label>
                                            <input
                                                type="number"
                                                value={calculatedMacros.fatG}
                                                onChange={(e) => setManualFatG(parseInt(e.target.value) || 0)}
                                                className={`w-full border rounded-lg p-3 ${selectedFood ? 'bg-gray-50' : ''}`}
                                                readOnly={!!selectedFood}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
                                        Add to {formatDate(selectedDate)}
                                    </button>
                                </form>
                            )}

                            {/* AI Entry Form */}
                            {entryMode === 'ai' && (
                                <div className="space-y-4 bg-blue-50 p-5 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type *</label>
                                        <select value={aiMealType} onChange={(e) => setAiMealType(e.target.value)} className="w-full border rounded-lg p-3">
                                            <option value="BREAKFAST">Breakfast</option>
                                            <option value="LUNCH">Lunch</option>
                                            <option value="DINNER">Dinner</option>
                                            <option value="SNACK">Snack</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Food Picture *</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full border rounded-lg p-3"
                                        />
                                    </div>

                                    {base64Image && (
                                        <div className="border rounded-lg overflow-hidden">
                                            <img src={base64Image} alt="Food" className="w-full h-48 object-cover" />
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleAIAnalyze}
                                        disabled={aiAnalyzing || !base64Image}
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {aiAnalyzing ? 'Analyzing...' : <><Zap size={20} /> Analyze Picture</>}
                                    </button>

                                    {aiSuggestion && (
                                        <div className="bg-white p-4 rounded-lg border-2 border-blue-300 space-y-3">
                                            <h4 className="font-semibold text-blue-700">AI Analysis Result</h4>
                                            <p className="text-sm font-medium">{aiSuggestion.description}</p>
                                            <div className="grid grid-cols-4 gap-2 text-center bg-blue-50 p-3 rounded">
                                                <div>
                                                    <p className="text-xs text-gray-600">Calories</p>
                                                    <p className="font-bold text-red-600">{aiSuggestion.calories}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Protein</p>
                                                    <p className="font-bold text-green-600">{aiSuggestion.proteinG}g</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Carbs</p>
                                                    <p className="font-bold text-blue-600">{aiSuggestion.carbsG}g</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Fat</p>
                                                    <p className="font-bold text-amber-600">{aiSuggestion.fatG}g</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleAISubmit}
                                                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
                                            >
                                                Add to {formatDate(selectedDate)}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Done Button */}
                            <div className="pt-4 border-t-2 border-gray-200">
                                <button
                                    onClick={handleClose}
                                    className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-800"
                                >
                                    Done - Close & Refresh Chart
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
