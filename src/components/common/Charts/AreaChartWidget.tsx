import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export interface AreaChartWidgetProps<T extends Record<string, unknown>> {
  data: T[];
  xKey: keyof T & string;
  yKey: keyof T & string;
  height?: number;
  color?: string;
  valueFormatter?: (val: unknown) => [string, string];
}

export function AreaChartWidget<T extends Record<string, unknown>>({
  data,
  xKey,
  yKey,
  height = 260,
  color = '#18281F',

  valueFormatter,
}: AreaChartWidgetProps<T>): React.ReactElement {
  const gradientId = `grad-${yKey}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
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
        <Area
          type="monotone"
          dataKey={yKey as string}
          stroke={color}
          strokeWidth={3}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
        />

      </AreaChart>
    </ResponsiveContainer>
  );
}
