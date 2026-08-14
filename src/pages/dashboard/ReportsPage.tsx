import React, { useState } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { useReportsTelemetry, useExportReport } from '../../hooks/useReports';
import { TimeframeGranularity, ExportFormat } from '../../types/report';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/feedback/ErrorState';
import { ReportExportBar } from '../../components/reports/ReportExportBar';
import { RevenueReportChart } from '../../components/reports/RevenueReportChart';
import { OrdersReportChart } from '../../components/reports/OrdersReportChart';
import { SubscriptionGrowthReportChart } from '../../components/reports/SubscriptionGrowthReportChart';
import { VendorGrowthReportChart } from '../../components/reports/VendorGrowthReportChart';
import { TopVendorsTable } from '../../components/reports/TopVendorsTable';
import { SocietyPerformanceChart } from '../../components/reports/SocietyPerformanceChart';

export const ReportsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframeGranularity>('monthly');

  const { data, isLoading, isError, refetch } = useReportsTelemetry(timeframe);
  const exportMutation = useExportReport();

  const handleExport = (format: ExportFormat) => {
    exportMutation.mutate({ format, timeframe });
  };

  if (isError) {
    return (
      <div className="py-12">
        <ErrorState
          title="Failed to load Reports Telemetry"
          description="There was a problem retrieving analytics telemetry data. Please check your connection and retry."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[var(--gold)]" />
            <span className="font-mono-meta text-xs text-[var(--gold)] font-semibold">
              EXECUTIVE INTELLIGENCE
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--foreground)] mt-1">
            Reports & Analytics
          </h1>
          <p className="text-sm font-body text-[var(--muted-foreground)] mt-1">
            Deep performance analytics across revenue, order fulfillment, subscription growth, merchant rankings, and society metrics.
          </p>
        </div>

        <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refetch()}>
          Refresh Intelligence
        </Button>
      </div>

      {/* Export & Granularity Bar */}
      <ReportExportBar
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onExport={handleExport}
        isExporting={exportMutation.isPending}
      />

      {/* Revenue & Order Fulfillment Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueReportChart data={data?.revenuePoints} isLoading={isLoading} />
        <OrdersReportChart data={data?.orderPoints} isLoading={isLoading} />
      </div>

      {/* Subscriptions & Vendor Onboarding Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubscriptionGrowthReportChart data={data?.subscriptionGrowthPoints} isLoading={isLoading} />
        <VendorGrowthReportChart data={data?.vendorGrowthPoints} isLoading={isLoading} />
      </div>

      {/* Top Vendors Leaderboard & Society Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopVendorsTable data={data?.topVendors} isLoading={isLoading} />
        <SocietyPerformanceChart data={data?.societyPerformance} isLoading={isLoading} />
      </div>
    </div>
  );
};
