"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function WageTrendChart({ data = [] }) {
  // Mock data if none provided
  const chartData = data.length > 0 ? data : [
    { name: 'Mon', wages: 12000 },
    { name: 'Tue', wages: 18500 },
    { name: 'Wed', wages: 16200 },
    { name: 'Thu', wages: 22400 },
    { name: 'Fri', wages: 19800 },
    { name: 'Sat', wages: 24500 },
    { name: 'Sun', wages: 8000 }
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorWages" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
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
            formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Wages Paid']}
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: 'none', 
              borderRadius: '8px', 
              color: '#f8fafc',
              fontSize: '12px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="wages" 
            stroke="#4f46e5" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorWages)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
