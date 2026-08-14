export type TimeframeGranularity = 'daily' | 'monthly' | 'yearly';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface RevenueReportPoint {
  label: string;
  grossRevenue: number;
  netProfit: number;
  orderCount: number;
}

export interface OrderReportPoint {
  label: string;
  completedOrders: number;
  cancelledOrders: number;
}

export interface SubscriptionGrowthPoint {
  label: string;
  freeCount: number;
  proCount: number;
  enterpriseCount: number;
}

export interface VendorGrowthPoint {
  label: string;
  newVendors: number;
}

export interface TopVendorReport {
  vendorId: string;
  storeName: string;
  category: string;
  societyName: string;
  totalRevenue: number;
  totalOrders: number;
  rating: number;
}

export interface SocietyPerformanceReport {
  societyId: string;
  societyName: string;
  vendorCount: number;
  revenueGenerated: number;
  totalOrders: number;
}

export interface ReportsTelemetryData {
  timeframe: TimeframeGranularity;
  revenuePoints: RevenueReportPoint[];
  orderPoints: OrderReportPoint[];
  subscriptionGrowthPoints: SubscriptionGrowthPoint[];
  vendorGrowthPoints: VendorGrowthPoint[];
  topVendors: TopVendorReport[];
  societyPerformance: SocietyPerformanceReport[];
}

export interface ExportReportPayload {
  format: ExportFormat;
  timeframe: TimeframeGranularity;
  reportType?: string;
}
