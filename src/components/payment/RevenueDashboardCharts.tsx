import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DollarSign, TrendingUp, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Skeleton } from '../feedback/Skeleton';
import { RevenueDashboardData } from '../../types/payment';
import { formatCurrency } from '../../utils/formatters';

export interface RevenueDashboardChartsProps {
  data?: RevenueDashboardData;
  isLoading?: boolean;
}

export const RevenueDashboardCharts: React.FC<RevenueDashboardChartsProps> = ({
  data,
  isLoading,
}) => {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32 mt-4" />
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: 'TOTAL GROSS VOLUME',
      value: formatCurrency(data.totalGrossVolume),
      subtext: 'processed through gateway',
      icon: <DollarSign className="h-5 w-5 text-[var(--gold)]" />,
    },
    {
      title: 'NET PLATFORM REVENUE',
      value: formatCurrency(data.netPlatformRevenue),
      subtext: '5% commission revenue',
      icon: <TrendingUp className="h-5 w-5 text-[var(--primary)]" />,
    },
    {
      title: 'TOTAL REFUNDED AMOUNT',
      value: formatCurrency(data.totalRefundedAmount),
      subtext: 'merchant refunds issued',
      icon: <RefreshCw className="h-5 w-5 text-amber-600" />,
    },
    {
      title: 'GATEWAY SUCCESS RATE',
      value: `${data.successRate}%`,
      subtext: 'authorized transactions',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="p-6 gold-border-hover transition">
            <div className="flex items-center justify-between">
              <span className="font-mono-meta text-[10px] text-[var(--muted-foreground)]">
                {kpi.title}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--secondary)] border border-[var(--border)]">
                {kpi.icon}
              </div>
            </div>
            <div className="mt-3">
              <span className="font-serif text-3xl font-bold text-[var(--foreground)]">
                {kpi.value}
              </span>
            </div>
            <p className="text-xs font-mono text-[var(--muted-foreground)] mt-1.5">{kpi.subtext}</p>
          </Card>
        ))}
      </div>

      {/* Revenue Charts Grid (Area Chart Volume & Gateway Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Volume Trend Area Chart */}
        <Card className="lg:col-span-2 p-2">
          <CardHeader>
            <CardTitle className="text-xl">Daily Transaction Volume & Net Fees</CardTitle>
            <CardDescription>7-DAY PROCESSED PAYMENT VOLUME (USD)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyVolumeTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#224636" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#224636" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} fontFamily="JetBrains Mono" />
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
                  <Area type="monotone" dataKey="volume" stroke="#224636" fillOpacity={1} fill="url(#volumeGrad)" name="Gross Volume" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gateway Method Distribution */}
        <Card className="p-2">
          <CardHeader>
            <CardTitle className="text-xl">Payment Gateway Breakdown</CardTitle>
            <CardDescription>VOLUME BY PAYMENT PROVIDER</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.gatewayDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {data.gatewayDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--background)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                    }}
                    formatter={(val: any) => [formatCurrency(Number(val || 0)), 'Processed Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-2">
              {data.gatewayDistribution.map((g, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-body">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                    <span className="font-semibold">{g.name}</span>
                  </div>
                  <span className="font-mono text-[var(--muted-foreground)]">{formatCurrency(g.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
