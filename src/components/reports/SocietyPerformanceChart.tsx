import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Skeleton } from '../feedback/Skeleton';
import { SocietyPerformanceReport } from '../../types/report';
import { formatCurrency } from '../../utils/formatters';

export interface SocietyPerformanceChartProps {
  data?: SocietyPerformanceReport[];
  isLoading?: boolean;
}

export const SocietyPerformanceChart: React.FC<SocietyPerformanceChartProps> = ({
  data,
  isLoading,
}) => {
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
        <CardTitle className="text-xl">Residential Society Performance</CardTitle>
        <CardDescription>REVENUE GENERATION & ORDER VOLUME BY COMMUNITY</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="societyName" stroke="var(--muted-foreground)" fontSize={11} fontFamily="JetBrains Mono" />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} fontFamily="JetBrains Mono" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontFamily: 'Inter',
                }}
                formatter={(val: any) => [formatCurrency(Number(val || 0)), 'Total Revenue']}
              />
              <Bar dataKey="revenueGenerated" fill="#224636" radius={[4, 4, 0, 0]} name="Gross Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
