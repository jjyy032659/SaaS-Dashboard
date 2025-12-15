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
    const customTooltip = ({ active, payload }: any) => {
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
                        activeIndex={0} // Forces the active styling to be on the consumed portion
                        activeShape={({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill }) => {
                            return (
                                <g>
                                    <path d={`M${cx},${cy} m-${innerRadius},0 a${innerRadius},${innerRadius} 0 1,0 ${innerRadius * 2},0 a${innerRadius},${innerRadius} 0 1,0 -${innerRadius * 2},0`} fill="#E5E7EB" />
                                    <path d={`M${cx},${cy} m-${outerRadius},0 a${outerRadius},${outerRadius} 0 1,0 ${outerRadius * 2},0 a${outerRadius},${outerRadius} 0 1,0 -${outerRadius * 2},0`} fill="#E5E7EB" />
                                    <path fill={fill} d={`M${cx} ${cy} L${cx} ${cy - outerRadius} A${outerRadius} ${outerRadius} 0 ${fillValue > 180 ? 1 : 0} 1 ${cx + Math.sin(fillValue * Math.PI / 180) * outerRadius} ${cy - Math.cos(fillValue * Math.PI / 180) * outerRadius} Z`} />
                                    <text x={cx} y={cy} dy={-5} textAnchor="middle" fill="#1f2937" className="text-2xl font-bold">{percent}%</text>
                                    <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#6b7280" className="text-sm">{total} / {goal}{unit}</text>
                                </g>
                            );
                        }}
                    >
                        {/* Only the consumed portion needs a cell for the color fill */}
                        <Cell key={`cell-0`} fill={color} />
                    </Pie>
                    <Tooltip content={customTooltip} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};