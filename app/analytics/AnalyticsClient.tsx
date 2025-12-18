// app/analytics/AnalyticsClient.tsx
'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { MacroTrendChart } from '../components/MacroTrendChart';
import BackfillMealModal from './BackfillMealModal';

interface DailyMacroTrend {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface FormState {
    message: string;
    success: boolean;
    fieldErrors?: Record<string, string[]>;
}

interface AnalyticsClientProps {
    monthlyData: DailyMacroTrend[];
    missingDays: string[];
    logHistoricalMealAction: (prevState: FormState, formData: FormData) => Promise<FormState>;
    analyzeImageAction: (prevState: FormState, formData: FormData) => Promise<FormState>;
}

export default function AnalyticsClient({
    monthlyData,
    missingDays,
    logHistoricalMealAction,
    analyzeImageAction
}: AnalyticsClientProps) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            {/* Missing Days Indicator */}
            {missingDays.length > 0 && (
                <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 p-5 rounded-xl border-2 border-orange-300 shadow-md">
                    <div className="flex items-center gap-4">
                        <AlertCircle className="text-orange-600 flex-shrink-0" size={32} />
                        <div>
                            <p className="text-base font-bold text-orange-900">
                                {missingDays.length} day{missingDays.length > 1 ? 's' : ''} missing data
                            </p>
                            <p className="text-sm text-orange-700">
                                Click below to backfill missing entries and complete your trend chart
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0"
                    >
                        Add Missing Entry
                    </button>
                </div>
            )}

            {/* Chart Container with More Height */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-[550px]">
                <MacroTrendChart data={monthlyData} />
            </div>

            {/* Modal */}
            <BackfillMealModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                missingDays={missingDays}
                logHistoricalMealAction={logHistoricalMealAction}
                analyzeImageAction={analyzeImageAction}
            />
        </div>
    );
}
