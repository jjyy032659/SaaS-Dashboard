// app/components/ActualVsGoalChart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ActualVsGoalChartProps {
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFat: number;
    goalCalories: number;
    goalProtein: number;
    goalCarbs: number;
    goalFat: number;
}

export function ActualVsGoalChart({
    avgCalories,
    avgProtein,
    avgCarbs,
    avgFat,
    goalCalories,
    goalProtein,
    goalCarbs,
    goalFat,
}: ActualVsGoalChartProps) {
    const data = [
        {
            name: 'Calories',
            Actual: avgCalories,
            Goal: goalCalories,
        },
        {
            name: 'Protein (g)',
            Actual: avgProtein,
            Goal: goalProtein,
        },
        {
            name: 'Carbs (g)',
            Actual: avgCarbs,
            Goal: goalCarbs,
        },
        {
            name: 'Fat (g)',
            Actual: avgFat,
            Goal: goalFat,
        },
    ];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart
                data={data}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Actual" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Goal" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
