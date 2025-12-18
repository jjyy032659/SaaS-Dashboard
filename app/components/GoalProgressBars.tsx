// app/components/GoalProgressBars.tsx
'use client';

interface MacroGoal {
    actual: number;
    goal: number;
    label: string;
    color: string;
    unit: string;
}

interface GoalProgressBarsProps {
    calories: MacroGoal;
    protein: MacroGoal;
    carbs: MacroGoal;
    fat: MacroGoal;
}

export function GoalProgressBars({ calories, protein, carbs, fat }: GoalProgressBarsProps) {
    const goals = [calories, protein, carbs, fat];

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90 && percentage <= 110) return 'bg-green-500';
        if (percentage >= 80 && percentage < 90) return 'bg-yellow-500';
        if (percentage > 110 && percentage <= 120) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getProgressWidth = (actual: number, goal: number) => {
        if (goal === 0) return 0;
        const percentage = (actual / goal) * 100;
        return Math.min(percentage, 100); // Cap at 100% for display
    };

    return (
        <div className="space-y-6">
            {goals.map((goal, index) => {
                const percentage = goal.goal > 0 ? Math.round((goal.actual / goal.goal) * 100) : 0;
                const progressWidth = getProgressWidth(goal.actual, goal.goal);
                const progressColor = getProgressColor(percentage);
                const isOver = goal.actual > goal.goal;

                return (
                    <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-700">{goal.label}</span>
                            <div className="flex items-center gap-2">
                                <span className={`font-bold ${goal.color}`}>
                                    {goal.actual}{goal.unit}
                                </span>
                                <span className="text-gray-400">/</span>
                                <span className="text-gray-600">
                                    {goal.goal}{goal.unit}
                                </span>
                                <span className={`text-sm font-bold ml-2 ${
                                    percentage >= 90 && percentage <= 110 ? 'text-green-600' :
                                    percentage < 90 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                    {percentage}%
                                </span>
                            </div>
                        </div>
                        <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${progressColor} transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                                style={{ width: `${progressWidth}%` }}
                            >
                                {progressWidth > 15 && (
                                    <span className="text-xs font-bold text-white">
                                        {goal.actual}{goal.unit}
                                    </span>
                                )}
                            </div>
                            {isOver && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <span className="text-xs font-bold text-red-600">
                                        +{goal.actual - goal.goal}{goal.unit}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>
                                {percentage < 90 ? `${Math.abs(90 - percentage)}% under target` :
                                 percentage > 110 ? `${percentage - 110}% over target` :
                                 'On track! 🎯'}
                            </span>
                            <span>Goal: {goal.goal}{goal.unit}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
