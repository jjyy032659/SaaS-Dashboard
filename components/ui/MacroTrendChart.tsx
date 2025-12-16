// app/components/MacroTrendChart.tsx
'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';

// Define the type to match the data structure from fetchMonthlyMacroTrend
interface DailyMacroTrend {
    date: string; // YYYY-MM-DD
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface MacroTrendChartProps {
    data: DailyMacroTrend[];
}

export const MacroTrendChart: React.FC<MacroTrendChartProps> = ({ data }) => {
    
  return (
    <ResponsiveContainer width="100%" height="90%">
      <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
        
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        
        {/* X-Axis: Dates (e.g., 2025-12-15) */}
        <XAxis 
            dataKey="date" 
            stroke="#6b7280" 
            tickFormatter={(tick) => tick.substring(5)} // Show only MM-DD
        />
        
        {/* Y-Axis: Shows values in grams/kcal, automatically scaled */}
        <YAxis stroke="#6b7280" domain={[0, 'auto']} allowDecimals={false} />
        
        {/* Tooltip on hover */}
        <Tooltip 
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value, name) => [`${value} ${name === 'calories' ? 'kcal' : 'g'}`, name.charAt(0).toUpperCase() + name.slice(1)]}
        />
        
        <Legend wrapperStyle={{ paddingTop: '15px' }} />

        {/* Line 1: Calories (Kcal) */}
        <Line 
            type="monotone" 
            dataKey="calories" 
            name="Calories" 
            stroke="#EF4444" // Red
            strokeWidth={2} 
            dot={false}
        />

        {/* Line 2: Protein (g) */}
        <Line 
            type="monotone" 
            dataKey="protein" 
            name="Protein" 
            stroke="#10B981" // Green
            strokeWidth={2} 
            dot={false}
        />
        
        {/* Line 3: Carbs (g) */}
        <Line 
            type="monotone" 
            dataKey="carbs" 
            name="Carbs" 
            stroke="#3B82F6" // Blue
            strokeWidth={2} 
            dot={false}
        />
        
        {/* Line 4: Fat (g) */}
        <Line 
            type="monotone" 
            dataKey="fat" 
            name="Fat" 
            stroke="#F59E0B" // Amber
            strokeWidth={2} 
            dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};