// components/RevenueChart.tsx
'use client'; // This component must run in the browser

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// This type should match the data structure defined in lib/db/schema.ts
interface ChartData {
  id: string;
  amount: number;
  month: string;
  createdAt: Date;
}

interface RevenueChartProps {
  data: ChartData[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  return (
    <div className="h-96 w-full p-6 border rounded-xl shadow-lg bg-white">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Monthly Revenue Overview</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
        >
          {/* Simple grid lines for visual aid */}
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          
          {/* X-Axis shows the month */}
          <XAxis dataKey="month" stroke="#666" padding={{ left: 20, right: 20 }} />
          
          {/* Y-Axis shows the amount, formatted to thousands */}
          <YAxis 
            stroke="#666"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} 
          />
          
          {/* Tooltip displays on hover */}
          <Tooltip 
            formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} 
            labelStyle={{ fontWeight: 'bold' }}
            contentStyle={{ borderRadius: '8px' }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          
          {/* The main data bars */}
          <Bar 
            dataKey="amount" 
            fill="#3b82f6" 
            name="Revenue" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};