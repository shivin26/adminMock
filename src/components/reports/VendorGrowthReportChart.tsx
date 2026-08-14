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
import { VendorGrowthPoint } from '../../types/report';

export interface VendorGrowthReportChartProps {
  data?: VendorGrowthPoint[];
  isLoading?: boolean;
}

export const VendorGrowthReportChart: React.FC<VendorGrowthReportChartProps> = ({
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
        <CardTitle className="text-xl">Vendor Onboarding Rate</CardTitle>
        <CardDescription>NEWLY REGISTERED MERCHANT STORES</CardDescription>
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
                formatter={(val: any) => [`${val || 0} Vendors`, 'New Registrations']}
              />
              <Bar dataKey="newVendors" fill="#cba358" radius={[4, 4, 0, 0]} name="New Vendors" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
