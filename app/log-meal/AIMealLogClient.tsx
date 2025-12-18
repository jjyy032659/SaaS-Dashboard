// app/log-meal/AIMealLogClient.tsx (COMPLETE CODE)
'use client';

import { useState, useMemo, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { Camera, Zap, AlertTriangle, PlusCircle, XCircle } from 'lucide-react';

// Assuming these types are available from your existing setup/lib/validation.ts
interface FormState {
    message: string;
    success: boolean;
    aiSuggestion?: {
        description: string;
        calories: number;
        proteinG: number;
        fatG: number;
        carbsG: number;
    }
}

interface AIMealLogClientProps {
    logMealAction: (prevState: FormState, formData: FormData) => Promise<FormState>;
    analyzeImageAction: (prevState: FormState, formData: FormData) => Promise<FormState>;
}


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
            {pending ? 'Analyzing...' : <>
                <Zap size={18} /> Analyze Picture
            </>}
        </button>
    );
}

function AcceptButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            name="actionType" 
            value="ACCEPT"
            disabled={pending}
            className="w-full bg-green-600 text-white py-2 px-4 rounded text-sm font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
            {pending ? 'Logging...' : <>
                <PlusCircle size={18} /> Log Meal
            </>}
        </button>
    );
}


export default function AIMealLogClient({ logMealAction, analyzeImageAction }: AIMealLogClientProps) {
    const [aiState, aiFormAction] = useActionState(analyzeImageAction, { success: false, message: '' });
    const [logState, setLogState] = useState<FormState>({ success: false, message: '' });

    // --- State for Multiple Image Handling ---
    const [base64Images, setBase64Images] = useState<string[]>([]); // Array of base64 images
    const [selectedMealType, setSelectedMealType] = useState<string>('LUNCH');
    const [analyzing, setAnalyzing] = useState(false); // Loading state for analysis
    const [individualResults, setIndividualResults] = useState<any[]>([]); // Individual analysis results
    const [totalMacros, setTotalMacros] = useState<any>(null); // Combined totals

    // Clears log status after a delay
    useMemo(() => {
        if (logState.message) {
            const timer = setTimeout(() => setLogState({ success: false, message: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [logState.message]);


    // Handler to read multiple files and convert to Base64
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) {
            setBase64Images([]);
            setIndividualResults([]);
            setTotalMacros(null);
            return;
        }

        // Convert all files to base64
        const base64Array: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Optional file size check (5MB limit suggested for API costs)
            if (file.size > 5 * 1024 * 1024) {
                alert(`Image "${file.name}" is too large. Please use images under 5MB.`);
                continue;
            }

            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });

            base64Array.push(base64);
        }

        setBase64Images(base64Array);
        setIndividualResults([]); // Clear previous results
        setTotalMacros(null);
    };
    
    // Handler for accepting the AI suggestion and logging the meal
    const handleAcceptAndLog = async (formData: FormData) => {
        if (!totalMacros) return;

        // 1. Inject AI data into the form
        formData.set('mealType', formData.get('mealType') as string || 'LUNCH');
        formData.set('description', totalMacros.description);
        formData.set('calories', totalMacros.calories.toString());
        formData.set('proteinG', totalMacros.proteinG.toString());
        formData.set('fatG', totalMacros.fatG.toString());
        formData.set('carbsG', totalMacros.carbsG.toString());

        // 2. Call the real logMealAction
        const result = await logMealAction(logState, formData);

        setLogState(result);

        // Clear AI suggestion on successful log
        if (result.success) {
            setBase64Images([]);
            setIndividualResults([]);
            setTotalMacros(null);
        }
    }

    // Custom form submission to analyze all images
    const handleAIFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (base64Images.length === 0) {
            setLogState({ success: false, message: "Please select at least one image before analyzing." });
            return;
        }

        setAnalyzing(true);
        setIndividualResults([]);
        setTotalMacros(null);

        try {
            const results = [];

            // Analyze each image separately
            for (let i = 0; i < base64Images.length; i++) {
                const formData = new FormData();
                formData.set('base64Image', base64Images[i]);
                formData.set('mealType', selectedMealType);

                const result = await analyzeImageAction({ success: false, message: '' }, formData);

                if (result.success && result.aiSuggestion) {
                    results.push({
                        imageIndex: i,
                        ...result.aiSuggestion
                    });
                } else {
                    // If any image fails, show error but continue
                    console.error(`Image ${i + 1} analysis failed:`, result.message);
                }
            }

            if (results.length === 0) {
                setLogState({ success: false, message: "Failed to analyze any images. Please try again." });
                setAnalyzing(false);
                return;
            }

            // Calculate totals
            const totals = {
                description: results.map(r => r.description).join(', '),
                calories: results.reduce((sum, r) => sum + r.calories, 0),
                proteinG: results.reduce((sum, r) => sum + r.proteinG, 0),
                fatG: results.reduce((sum, r) => sum + r.fatG, 0),
                carbsG: results.reduce((sum, r) => sum + r.carbsG, 0),
            };

            setIndividualResults(results);
            setTotalMacros(totals);
            setLogState({
                success: true,
                message: `Successfully analyzed ${results.length} image${results.length > 1 ? 's' : ''}!`
            });

        } catch (error: any) {
            setLogState({ success: false, message: `Analysis failed: ${error.message}` });
        } finally {
            setAnalyzing(false);
        }
    }


    return (
        <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-blue-100">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Camera size={24} className="text-blue-600" />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        AI Photo Analysis
                    </span>
                </h2>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">NEW</span>
            </div>
            <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                💡 <strong>New Feature:</strong> Upload multiple photos of your meal components and get combined nutrition totals!
            </p>

            {/* Status Messages */}
            {logState.message && (
                <div className={`mb-4 p-3 rounded-md text-sm font-medium ${logState.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {logState.message}
                </div>
            )}

            {/* 1. AI Input Form */}
            <form onSubmit={handleAIFormSubmit} className="space-y-4 mb-6">

                <div className="flex items-center gap-4">
                    <label className="block text-sm font-medium text-gray-700 min-w-24">Meal Type:</label>
                    <select
                        name="mealType"
                        value={selectedMealType}
                        onChange={(e) => setSelectedMealType(e.target.value)}
                        className="border p-2 rounded-md bg-gray-50 flex-1"
                    >
                        <option value="BREAKFAST">Breakfast</option>
                        <option value="LUNCH">Lunch</option>
                        <option value="DINNER">Dinner</option>
                        <option value="SNACK">Snack</option>
                    </select>
                </div>
                
                {/* File Input for Multiple Images */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Food Picture Upload</span>
                    <input
                        name="mealImages"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="border p-2 rounded-md w-full mt-1 focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        💡 <strong>Tip:</strong> Hold Ctrl (or Cmd on Mac) to select multiple images for combined analysis!
                    </p>
                </label>

                {/* Image Previews */}
                {base64Images.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                                {base64Images.length} image{base64Images.length > 1 ? 's' : ''} selected
                            </span>
                            <button
                                type="button"
                                onClick={() => { setBase64Images([]); setIndividualResults([]); setTotalMacros(null); }}
                                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                            >
                                <XCircle size={16} /> Clear All
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {base64Images.map((img, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={img}
                                        alt={`Meal ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border"
                                    />
                                    <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                        {index + 1}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={analyzing}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {analyzing ? (
                        <>Analyzing {base64Images.length} image{base64Images.length > 1 ? 's' : ''}...</>
                    ) : (
                        <>
                            <Zap size={18} /> Analyze Picture{base64Images.length > 1 ? 's' : ''}
                        </>
                    )}
                </button>
            </form>

            {/* 2. Analysis Results Display */}
            {totalMacros && (
                <div className="space-y-4">
                    {/* Individual Results (if multiple images) */}
                    {individualResults.length > 1 && (
                        <div className="p-4 border border-blue-300 rounded-lg bg-blue-50">
                            <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                                <Zap size={18} /> Individual Analysis Results
                            </h3>
                            <div className="space-y-2">
                                {individualResults.map((result, index) => (
                                    <div key={index} className="bg-white p-3 rounded-md border border-blue-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                #{index + 1}
                                            </span>
                                            <p className="text-sm font-medium text-gray-800">{result.description}</p>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                            <div>
                                                <p className="text-gray-600">Calories</p>
                                                <p className="font-bold text-red-600">{result.calories}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Protein</p>
                                                <p className="font-bold text-green-600">{result.proteinG}g</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Carbs</p>
                                                <p className="font-bold text-blue-600">{result.carbsG}g</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Fat</p>
                                                <p className="font-bold text-amber-600">{result.fatG}g</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Total Macros Summary */}
                    <div className="p-4 border-2 border-dashed border-green-400 rounded-lg space-y-3 bg-green-50">
                        <h3 className="font-semibold text-green-700 flex items-center gap-2">
                            <Zap size={18} /> {individualResults.length > 1 ? 'Combined Total Nutrition' : 'Gemini Analysis Result'}
                        </h3>
                        <p className="text-sm text-gray-800 font-medium">{totalMacros.description}</p>

                        <div className="grid grid-cols-4 gap-3 text-center bg-white p-4 rounded-md border-2 border-green-300">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Total Calories</p>
                                <p className="font-bold text-lg text-red-600">{totalMacros.calories} kcal</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Protein</p>
                                <p className="font-bold text-lg text-green-600">{totalMacros.proteinG}g</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Carbs</p>
                                <p className="font-bold text-lg text-blue-600">{totalMacros.carbsG}g</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Fat</p>
                                <p className="font-bold text-lg text-amber-600">{totalMacros.fatG}g</p>
                            </div>
                        </div>

                        {/* Accept/Log Button Form */}
                        <form action={handleAcceptAndLog} className="mt-4">
                            <input type="hidden" name="mealType" value={selectedMealType} />
                            <AcceptButton />
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}