import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { SubscriptionTierPoint } from '../../types/dashboard';

export interface SubscriptionChartProps {
  data?: SubscriptionTierPoint[];
  isLoading?: boolean;
}

export const SubscriptionChart: React.FC<SubscriptionChartProps> = ({ data = [] }) => {
  const chartData =
    data.length > 0
      ? data
      : [
          { name: 'Enterprise Tier', count: 343, percentage: 35, color: '#8b5cf6' },
          { name: 'Pro Vendor Tier', count: 490, percentage: 50, color: '#10b981' },
          { name: 'Free Starter Tier', count: 147, percentage: 15, color: '#f59e0b' },
        ];

  const total = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Plan Tier Distribution</CardTitle>
        <CardDescription>ACTIVE MERCHANT SUBSCRIPTION TIERS</CardDescription>
      </CardHeader>
      <CardContent className="h-72 w-full flex flex-col items-center justify-center relative pt-2">
        <ResponsiveContainer width="100%" height="75%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 shadow-2xl backdrop-blur-xl font-mono text-xs">
                      <p className="font-bold text-slate-200">{item.name}</p>
                      <p style={{ color: item.color }}>
                        {item.count} Merchants ({Math.round((item.count / total) * 100)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Legend Pillars */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono pt-2">
          {chartData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300">{item.name.split(' ')[0]}</span>
              <span className="text-slate-500">({Math.round((item.count / total) * 100)}%)</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
