import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export interface PieChartWidgetItem {
  name: string;
  value: number;
  color: string;
}

export interface PieChartWidgetProps {
  data: PieChartWidgetItem[];
  height?: number;
}

export const PieChartWidget: React.FC<PieChartWidgetProps> = ({ data, height = 220 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
