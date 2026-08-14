import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { RevenuePoint } from '../../types/dashboard';
import { formatCurrency } from '../../utils/formatters';

export interface RevenueChartProps {
  data?: RevenuePoint[];
  isLoading?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data = [] }) => {
  const chartData =
    data.length > 0
      ? data
      : [
          { month: 'Jan', revenue: 14200, profit: 8900 },
          { month: 'Feb', revenue: 18500, profit: 11200 },
          { month: 'Mar', revenue: 22400, profit: 14800 },
          { month: 'Apr', revenue: 21100, profit: 13900 },
          { month: 'May', revenue: 28900, profit: 19400 },
          { month: 'Jun', revenue: 34200, profit: 24100 },
          { month: 'Jul', revenue: 39800, profit: 27900 },
        ];

  return (
    <Card className="h-full border-[#E4DCC9]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Revenue & Margin Trajectory</CardTitle>
            <CardDescription>GROSS REVENUE VS NET MARGIN PERFORMANCE</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-[12px] font-sans">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#18281F]" />
              <span className="text-[#6B7C70] font-semibold">Gross Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#C4A066]" />
              <span className="text-[#6B7C70] font-semibold">Net Profit</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#18281F" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#18281F" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradientProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C4A066" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#C4A066" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFE8D8" vertical={false} />
            <XAxis dataKey="month" stroke="#6B7C70" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#6B7C70"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${val / 1000}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-[10px] border border-[#E4DCC9] bg-white p-3 shadow-md font-sans text-[12px] space-y-1">
                      <p className="font-bold text-[#18281F]">{payload[0].payload.month}</p>
                      <p className="text-[#18281F] font-semibold">Revenue: {formatCurrency(payload[0].value as number)}</p>
                      <p className="text-[#8C6B38] font-semibold">Profit: {formatCurrency(payload[1].value as number)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#18281F"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#gradientRevenue)"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#C4A066"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gradientProfit)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
