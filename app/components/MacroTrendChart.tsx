'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DailyMacroTrend {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroTrendChartProps {
  data: DailyMacroTrend[];
}

export function MacroTrendChart({ data }: MacroTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="calories"
          stroke="#EF4444"
          strokeWidth={2}
          name="Calories (kcal)"
        />
        <Line
          type="monotone"
          dataKey="protein"
          stroke="#10B981"
          strokeWidth={2}
          name="Protein (g)"
        />
        <Line
          type="monotone"
          dataKey="carbs"
          stroke="#3B82F6"
          strokeWidth={2}
          name="Carbs (g)"
        />
        <Line
          type="monotone"
          dataKey="fat"
          stroke="#F59E0B"
          strokeWidth={2}
          name="Fat (g)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
