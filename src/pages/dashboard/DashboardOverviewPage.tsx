import React from 'react';
import { useDashboardData } from '../../hooks/useDashboard';
import { MetricsGrid } from '../../components/dashboard/MetricsGrid';
import { RevenueChart } from '../../components/dashboard/RevenueChart';
import { VendorGrowthChart } from '../../components/dashboard/VendorGrowthChart';
import { SubscriptionChart } from '../../components/dashboard/SubscriptionChart';
import { RecentPaymentsTable } from '../../components/dashboard/RecentPaymentsTable';
import { RecentVendorsList } from '../../components/dashboard/RecentVendorsList';
import { RecentActivitiesFeed } from '../../components/dashboard/RecentActivitiesFeed';
import { QuickActionsBar } from '../../components/dashboard/QuickActionsBar';
import { Badge } from '../../components/ui/Badge';
import { ErrorState } from '../../components/feedback/ErrorState';

export const DashboardOverviewPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useDashboardData();

  if (isError) {
    return (
      <div className="py-12">
        <ErrorState
          title="Failed to Load Admin Dashboard"
          description="We couldn't retrieve the latest dashboard telemetry metrics. Please try again."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2">
      {/* Header Banner & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[var(--border)] pb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-meta text-xs text-[var(--gold)] font-semibold">
              EXECUTIVE MONITORING CONSOLE
            </span>
            <Badge variant="forest" className="text-[9px]">
              Live Feed
            </Badge>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mt-1">
            DigiLocal Executive Dashboard
          </h1>
          <p className="text-sm font-body text-[var(--muted-foreground)] mt-1.5 max-w-2xl">
            Real-time analytics, revenue performance, local vendor growth metrics, and audit logs.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <QuickActionsBar onRefresh={refetch} />
      </div>

      {/* 4 KPI Dashboard Cards */}
      <MetricsGrid metrics={data?.metrics} isLoading={isLoading} />

      {/* Primary Analytics Charts Section (Revenue Area Chart & Vendor Growth Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={data?.revenueChart} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <VendorGrowthChart data={data?.vendorGrowthChart} isLoading={isLoading} />
        </div>
      </div>

      {/* Secondary Analytics Section (Subscription Donut Chart & Newly Onboarded Vendors) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SubscriptionChart data={data?.subscriptionChart} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <RecentVendorsList vendors={data?.recentVendors} isLoading={isLoading} />
        </div>
      </div>

      {/* Payments & Audit Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentPaymentsTable payments={data?.recentPayments} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivitiesFeed activities={data?.recentActivities} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};
