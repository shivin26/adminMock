import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export interface BarChartWidgetProps<T extends Record<string, unknown>> {
  data: T[];
  xKey: keyof T & string;
  yKey: keyof T & string;
  height?: number;
  color?: string;
  valueFormatter?: (val: unknown) => [string, string];
}

export function BarChartWidget<T extends Record<string, unknown>>({
  data,
  xKey,
  yKey,
  height = 260,
  color = '#10b981',
  valueFormatter,
}: BarChartWidgetProps<T>): React.ReactElement {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey={xKey as string} stroke="var(--color-text-muted)" fontSize={12} />
        <YAxis stroke="var(--color-text-muted)" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
          }}
          formatter={valueFormatter as any}
        />
        <Bar dataKey={yKey as string} fill={color} radius={[4, 4, 0, 0]} />

      </BarChart>
    </ResponsiveContainer>
  );
}
