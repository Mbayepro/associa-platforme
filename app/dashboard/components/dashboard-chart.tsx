'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { name: 'Jan', total: 12 },
  { name: 'Fév', total: 19 },
  { name: 'Mar', total: 25 },
  { name: 'Avr', total: 32 },
  { name: 'Mai', total: 45 },
  { name: 'Juin', total: 58 },
  { name: 'Juil', total: 60 },
  { name: 'Août', total: 72 },
  { name: 'Sep', total: 85 },
  { name: 'Oct', total: 102 },
  { name: 'Nov', total: 110 },
  { name: 'Déc', total: 135 },
];

export function DashboardChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)'
          }}
          itemStyle={{ color: '#10b981', fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#10b981"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorTotal)"
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
