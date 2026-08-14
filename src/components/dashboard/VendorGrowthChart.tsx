import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { VendorGrowthPoint } from '../../types/dashboard';

export interface VendorGrowthChartProps {
  data?: VendorGrowthPoint[];
  isLoading?: boolean;
}

export const VendorGrowthChart: React.FC<VendorGrowthChartProps> = ({ data = [] }) => {
  const chartData =
    data.length > 0
      ? data
      : [
          { month: 'Jan', newVendors: 42, totalVendors: 420 },
          { month: 'Feb', newVendors: 68, totalVendors: 488 },
          { month: 'Mar', newVendors: 95, totalVendors: 583 },
          { month: 'Apr', newVendors: 120, totalVendors: 703 },
          { month: 'May', newVendors: 145, totalVendors: 848 },
          { month: 'Jun', newVendors: 180, totalVendors: 1028 },
          { month: 'Jul', newVendors: 215, totalVendors: 1243 },
        ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Vendor Onboarding Rate</CardTitle>
        <CardDescription>NEW MERCHANT REGISTRATIONS PER MONTH</CardDescription>
      </CardHeader>
      <CardContent className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
            <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 shadow-2xl backdrop-blur-xl font-mono text-xs">
                      <p className="font-bold text-slate-200">{payload[0].payload.month}</p>
                      <p className="text-cyan-400">Onboarded: {payload[0].value} Merchants</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="newVendors" fill="url(#gradientBar)" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
