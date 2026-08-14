import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Skeleton } from '../feedback/Skeleton';
import { RevenueReportPoint } from '../../types/report';
import { formatCurrency } from '../../utils/formatters';

export interface RevenueReportChartProps {
  data?: RevenueReportPoint[];
  isLoading?: boolean;
}

export const RevenueReportChart: React.FC<RevenueReportChartProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-2 gold-border-hover transition">
      <CardHeader>
        <CardTitle className="text-xl">Revenue & Profit Performance</CardTitle>
        <CardDescription>GROSS PLATFORM REVENUE VS NET PROFIT MARGINS</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#224636" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#224636" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cba358" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#cba358" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} fontFamily="JetBrains Mono" />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} fontFamily="JetBrains Mono" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontFamily: 'Inter',
                }}
                formatter={(val: any) => [formatCurrency(Number(val || 0)), '']}
              />
              <Area type="monotone" dataKey="grossRevenue" stroke="#224636" fillOpacity={1} fill="url(#grossGrad)" name="Gross Revenue" />
              <Area type="monotone" dataKey="netProfit" stroke="#cba358" fillOpacity={1} fill="url(#profitGrad)" name="Net Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
