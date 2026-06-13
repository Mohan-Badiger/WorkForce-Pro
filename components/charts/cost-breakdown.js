"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function CostBreakdownChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { name: 'Material', value: 850000, color: '#4f46e5' },
    { name: 'Labor Cost', value: 128400, color: '#10b981' },
    { name: 'Equipment Hire', value: 95000, color: '#f59e0b' },
    { name: 'Transport & Fuel', value: 42000, color: '#3b82f6' },
    { name: 'Food & Misc', value: 34000, color: '#ec4899' }
  ];

  return (
    <div className="h-[300px] w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
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
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
