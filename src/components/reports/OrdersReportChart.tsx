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
import { OrderReportPoint } from '../../types/report';

export interface OrdersReportChartProps {
  data?: OrderReportPoint[];
  isLoading?: boolean;
}

export const OrdersReportChart: React.FC<OrdersReportChartProps> = ({ data, isLoading }) => {
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
        <CardTitle className="text-xl">Orders Fulfilled vs Cancelled</CardTitle>
        <CardDescription>COMPLETED LOCAL MERCHANT ORDERS VS CANCELLATIONS</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <Bar dataKey="completedOrders" fill="#224636" radius={[4, 4, 0, 0]} name="Completed Orders" />
              <Bar dataKey="cancelledOrders" fill="#dc2626" radius={[4, 4, 0, 0]} name="Cancelled Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
