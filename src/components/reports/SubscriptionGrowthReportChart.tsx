import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Skeleton } from '../feedback/Skeleton';
import { SubscriptionGrowthPoint } from '../../types/report';

export interface SubscriptionGrowthReportChartProps {
  data?: SubscriptionGrowthPoint[];
  isLoading?: boolean;
}

export const SubscriptionGrowthReportChart: React.FC<SubscriptionGrowthReportChartProps> = ({
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
        <CardTitle className="text-xl">Subscriptions Trajectory</CardTitle>
        <CardDescription>MERCHANT CONVERSION ACROSS SUBSCRIPTION TIERS</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              />
              <Line type="monotone" dataKey="enterpriseCount" stroke="#224636" strokeWidth={2.5} name="Enterprise Tier" />
              <Line type="monotone" dataKey="proCount" stroke="#cba358" strokeWidth={2.5} name="Pro Tier" />
              <Line type="monotone" dataKey="freeCount" stroke="#827973" strokeWidth={2.5} name="Free Starter" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
