import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CreditCard, AlertTriangle, AlertCircle, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Skeleton } from '../feedback/Skeleton';
import { SubscriptionAnalyticsData } from '../../types/subscription';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export interface SubscriptionAnalyticsChartsProps {
  data?: SubscriptionAnalyticsData;
  isLoading?: boolean;
}

export const SubscriptionAnalyticsCharts: React.FC<SubscriptionAnalyticsChartsProps> = ({
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
      title: 'ACTIVE SUBSCRIPTIONS',
      value: formatNumber(data.activeSubscriptions),
      subtext: 'verified active plans',
      icon: <CreditCard className="h-5 w-5 text-[var(--primary)]" />,
    },
    {
      title: 'EXPIRING SOON (≤ 7 DAYS)',
      value: formatNumber(data.expiringSoonCount),
      subtext: 'action required',
      icon: <AlertTriangle className="h-5 w-5 text-[var(--gold)]" />,
    },
    {
      title: 'OVERDUE SUBSCRIPTIONS',
      value: formatNumber(data.overdueCount),
      subtext: 'pending renewal',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
    },
    {
      title: 'MONTHLY RECURRING REVENUE',
      value: formatCurrency(data.monthlyRecurringRevenue),
      subtext: 'predictable MRR',
      icon: <DollarSign className="h-5 w-5 text-emerald-700" />,
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

      {/* Plan Distribution Donut Chart */}
      <Card className="p-2">
        <CardHeader>
          <CardTitle className="text-xl">Subscription Plan Distribution & MRR</CardTitle>
          <CardDescription>ACTIVE RECURRING REVENUE BY SUBSCRIPTION TIER</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="h-56 w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {data.planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--background)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontFamily: 'Inter',
                    }}
                    formatter={(val: any) => [`${val || 0} Vendors`, 'Active Subscribers']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full lg:w-1/2 space-y-3">
              {data.planDistribution.map((tier, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-md bg-[var(--secondary)] border border-[var(--border)]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: tier.color }} />
                    <span className="font-body text-xs font-semibold text-[var(--foreground)]">
                      {tier.name} Tier
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-[var(--muted-foreground)]">{tier.count} stores</span>
                    <span className="font-bold text-[var(--foreground)]">{formatCurrency(tier.mrr)}/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
