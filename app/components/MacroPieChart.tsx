// app/components/MacroPieChart.tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface MacroPieChartProps {
    protein: number; // percentage
    carbs: number;   // percentage
    fat: number;     // percentage
}

const COLORS = {
    protein: '#10B981', // green
    carbs: '#3B82F6',   // blue
    fat: '#F59E0B',     // amber
};

export function MacroPieChart({ protein, carbs, fat }: MacroPieChartProps) {
    const data = [
        { name: 'Protein', value: protein, color: COLORS.protein },
        { name: 'Carbs', value: carbs, color: COLORS.carbs },
        { name: 'Fat', value: fat, color: COLORS.fat },
    ].filter(item => item.value > 0); // Only show non-zero values

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
                <div className="text-center">
                    <div className="text-5xl mb-2">📊</div>
                    <p>No data for the last 7 days</p>
                </div>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}
