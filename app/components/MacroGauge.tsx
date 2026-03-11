// app/components/MacroGauge.tsx
'use client'; 

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';

interface MacroGaugeProps {
    label: string;
    total: number; // Consumed amount (g or kcal)
    goal: number;  // Target amount (g or kcal)
    color: string; // Tailwind color class (e.g., #10B981 for green)
    unit: string;  // e.g., 'kcal' or 'g'
}

export const MacroGauge = ({ label, total, goal, color, unit }: MacroGaugeProps) => {
    
    // Calculate percentage and ensure it doesn't exceed 100% for the gauge fill
    const percent = Math.min(100, Math.round((total / goal) * 100));
    const fillValue = (percent / 100) * 360; // 360 degrees for the full circle
    const remainingValue = 360 - fillValue;

    const data = [
        { name: label, value: fillValue, fill: color },
        { name: 'Remaining', value: remainingValue, fill: '#E5E7EB' } // Gray background
    ];

    // Tooltip formatter to show consumption vs. goal
    const customTooltip = ({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ value: number }> }) => {
        if (active && payload && payload.length) {
            // Only show data from the first payload (the consumed portion)
            const consumed = (payload[0].value / 360) * goal;
            return (
                <div className="bg-white p-2 border rounded-md shadow-md text-sm">
                    <p className="font-semibold">{label}</p>
                    <p className="text-gray-700">Consumed: {total} {unit}</p>
                    <p className="text-gray-700">Goal: {goal} {unit}</p>
                </div>
            );
        }
        return null;
    };


    return (
        <div className="text-center p-4 bg-white rounded-xl border shadow-md h-72">
            <h3 className="text-lg font-semibold mb-2">{label}</h3>
            <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={0}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <Label
                            value={`${percent}%`}
                            position="center"
                            dy={-5}
                            style={{ fontSize: '24px', fontWeight: 'bold', fill: '#1f2937' }}
                        />
                        <Label
                            value={`${total} / ${goal}${unit}`}
                            position="center"
                            dy={20}
                            style={{ fontSize: '12px', fill: '#6b7280' }}
                        />
                    </Pie>
                    <Tooltip content={customTooltip} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};