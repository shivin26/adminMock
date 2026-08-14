import React from 'react';
import { DollarSign, Users, CreditCard, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DashboardMetrics } from '../../types/dashboard';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export interface MetricsGridProps {
  metrics?: DashboardMetrics;
  isLoading?: boolean;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const kpis = [
    {
      title: 'Total Platform Revenue',
      value: formatCurrency(metrics?.totalRevenue || 184950),
      trend: `+${metrics?.revenueChangePercent || 14.2}%`,
      icon: <DollarSign className="h-5 w-5 text-[#C4A066]" />,
      badgeVariant: 'gold' as const,
      darkCard: true,
    },
    {
      title: 'Active Local Vendors',
      value: formatNumber(metrics?.activeVendors || 1420),
      trend: `+${metrics?.vendorsChangePercent || 8.6}%`,
      icon: <Users className="h-5 w-5 text-[#1E3A29]" />,
      badgeVariant: 'forest' as const,
      darkCard: false,
    },
    {
      title: 'Active Subscriptions',
      value: formatNumber(metrics?.totalSubscriptions || 980),
      trend: `+${metrics?.subscriptionsChangePercent || 12.4}%`,
      icon: <CreditCard className="h-5 w-5 text-[#8C6B38]" />,
      badgeVariant: 'warning' as const,
      darkCard: false,
    },
    {
      title: 'Merchant Retention Rate',
      value: `${metrics?.growthRatePercent || 94.6}%`,
      trend: `+${metrics?.growthRateChangePercent || 2.1}%`,
      icon: <TrendingUp className="h-5 w-5 text-[#2C5282]" />,
      badgeVariant: 'violet' as const,
      darkCard: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <Card key={idx} interactive dark={kpi.darkCard} className={kpi.darkCard ? 'bg-[#243A2D] text-[#F8F5EE] border-[#243A2D]' : 'bg-white border-[#E4DCC9]'}>
          <div className="flex items-center justify-between pb-3">
            <span className={`font-sans text-[12px] font-semibold ${kpi.darkCard ? 'text-[#C4A066]' : 'text-[#6B7C70]'}`}>
              {kpi.title}
            </span>
            <div className={`h-10 w-10 rounded-[10px] flex items-center justify-center shrink-0 ${kpi.darkCard ? 'bg-[#18281F] border border-[#C4A066]/30' : 'bg-[#EFE8D8] border border-[#E4DCC9]'}`}>
              {kpi.icon}
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <h2 className={`font-serif text-[24px] font-bold tracking-tight ${kpi.darkCard ? 'text-[#F8F5EE]' : 'text-[#18281F]'}`}>
              {kpi.value}
            </h2>
            <Badge variant={kpi.badgeVariant} showDot>
              <span>{kpi.trend}</span>
              <ArrowUpRight className="h-3 w-3" />
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
};
