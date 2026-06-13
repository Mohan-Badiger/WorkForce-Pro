"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function CashFlowChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { month: 'Jan', revenue: 450000, expenses: 280000 },
    { month: 'Feb', revenue: 520000, expenses: 310000 },
    { month: 'Mar', revenue: 490000, expenses: 340000 },
    { month: 'Apr', revenue: 620000, expenses: 410000 },
    { month: 'May', revenue: 580000, expenses: 390000 },
    { month: 'Jun', revenue: 710000, expenses: 450000 }
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="month" 
            stroke="#94a3b8" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value / 1000}k`}
          />
          <Tooltip 
            formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: 'none', 
              borderRadius: '8px', 
              color: '#f8fafc',
              fontSize: '12px'
            }}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
          />
          <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Total Revenue" barSize={16} />
          <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Total Expenses" barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
