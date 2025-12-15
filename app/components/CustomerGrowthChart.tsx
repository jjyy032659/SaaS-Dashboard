// app/components/CustomerGrowthChart.tsx
'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { CustomerGrowthData } from "@/lib/analytics";

interface CustomerGrowthChartProps {
  data: CustomerGrowthData[];
}

export const CustomerGrowthChart: React.FC<CustomerGrowthChartProps> = ({ data }) => {
  // Map raw data into cumulative growth
  let cumulativeCount = 0;
  const cumulativeData = data.map(item => {
    cumulativeCount += item.count;
    return { 
      ...item, 
      cumulative: cumulativeCount 
    };
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border h-96">
      <h2 className="text-xl font-semibold mb-4">Customer Growth (Cumulative)</h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={cumulativeData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" domain={[0, 'auto']} allowDecimals={false} />
          <Tooltip 
            formatter={(value, name) => [`${value} customers`, name === 'cumulative' ? 'Total Customers' : 'New Customers']}
            labelFormatter={(label) => `Month: ${label}`}
          />
          {/* Line for Cumulative Growth */}
          <Line 
            type="monotone" 
            dataKey="cumulative" 
            stroke="#10B981" // Green
            strokeWidth={2} 
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};