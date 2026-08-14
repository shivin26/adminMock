import { BaseApiService } from './base.service';
import { apiClient } from '../client';
import {
  TimeframeGranularity,
  ReportsTelemetryData,
  ExportReportPayload,
} from '../../types/report';
import { env } from '../../env';

// Mock Telemetry Datasets for Daily, Monthly, and Yearly
const MOCK_DAILY_TELEMETRY: ReportsTelemetryData = {
  timeframe: 'daily',
  revenuePoints: [
    { label: '00:00', grossRevenue: 4200, netProfit: 1260, orderCount: 42 },
    { label: '04:00', grossRevenue: 2800, netProfit: 840, orderCount: 28 },
    { label: '08:00', grossRevenue: 12500, netProfit: 3750, orderCount: 110 },
    { label: '12:00', grossRevenue: 24800, netProfit: 7440, orderCount: 220 },
    { label: '16:00', grossRevenue: 31000, netProfit: 9300, orderCount: 285 },
    { label: '20:00', grossRevenue: 19500, netProfit: 5850, orderCount: 165 },
  ],
  orderPoints: [
    { label: '00:00', completedOrders: 40, cancelledOrders: 2 },
    { label: '04:00', completedOrders: 26, cancelledOrders: 2 },
    { label: '08:00', completedOrders: 104, cancelledOrders: 6 },
    { label: '12:00', completedOrders: 210, cancelledOrders: 10 },
    { label: '16:00', completedOrders: 270, cancelledOrders: 15 },
    { label: '20:00', completedOrders: 158, cancelledOrders: 7 },
  ],
  subscriptionGrowthPoints: [
    { label: '00:00', freeCount: 178, proCount: 476, enterpriseCount: 318 },
    { label: '08:00', freeCount: 179, proCount: 478, enterpriseCount: 319 },
    { label: '16:00', freeCount: 180, proCount: 480, enterpriseCount: 320 },
  ],
  vendorGrowthPoints: [
    { label: 'Mon', newVendors: 4 },
    { label: 'Tue', newVendors: 7 },
    { label: 'Wed', newVendors: 12 },
    { label: 'Thu', newVendors: 9 },
    { label: 'Fri', newVendors: 15 },
    { label: 'Sat', newVendors: 18 },
    { label: 'Sun', newVendors: 8 },
  ],
  topVendors: [
    { vendorId: 'v_1', storeName: 'Artisan Bakery Co.', category: 'Bakery & Food', societyName: 'Greenwood Heights', totalRevenue: 84500, totalOrders: 1420, rating: 4.9 },
    { vendorId: 'v_2', storeName: 'GreenThumb Organics', category: 'Grocery', societyName: 'Riverside Hub', totalRevenue: 42100, totalOrders: 980, rating: 4.8 },
    { vendorId: 'v_3', storeName: 'Metro Pottery Works', category: 'Home & Living', societyName: 'Oakridge Enclave', totalRevenue: 28400, totalOrders: 410, rating: 4.6 },
    { vendorId: 'v_4', storeName: 'Botanical Bloom Co.', category: 'Florist & Decor', societyName: 'Harbor View', totalRevenue: 19800, totalOrders: 320, rating: 4.7 },
    { vendorId: 'v_5', storeName: 'Sunrise Dairy Fresh', category: 'Dairy & Milk', societyName: 'Sunset Meadow', totalRevenue: 14200, totalOrders: 650, rating: 4.5 },
  ],
  societyPerformance: [
    { societyId: 's_1', societyName: 'Greenwood Heights', vendorCount: 42, revenueGenerated: 94500, totalOrders: 2840 },
    { societyId: 's_2', societyName: 'Riverside Hub', vendorCount: 28, revenueGenerated: 62100, totalOrders: 1920 },
    { societyId: 's_3', societyName: 'Oakridge Enclave', vendorCount: 15, revenueGenerated: 38400, totalOrders: 1100 },
    { societyId: 's_4', societyName: 'Harbor View', vendorCount: 64, revenueGenerated: 124000, totalOrders: 3900 },
  ],
};

const MOCK_MONTHLY_TELEMETRY: ReportsTelemetryData = {
  ...MOCK_DAILY_TELEMETRY,
  timeframe: 'monthly',
  revenuePoints: [
    { label: 'Jan', grossRevenue: 120000, netProfit: 36000, orderCount: 1100 },
    { label: 'Feb', grossRevenue: 135000, netProfit: 40500, orderCount: 1250 },
    { label: 'Mar', grossRevenue: 142000, netProfit: 42600, orderCount: 1320 },
    { label: 'Apr', grossRevenue: 158000, netProfit: 47400, orderCount: 1450 },
    { label: 'May', grossRevenue: 169000, netProfit: 50700, orderCount: 1560 },
    { label: 'Jun', grossRevenue: 175000, netProfit: 52500, orderCount: 1610 },
    { label: 'Jul', grossRevenue: 184950, netProfit: 55485, orderCount: 1720 },
  ],
};

const MOCK_YEARLY_TELEMETRY: ReportsTelemetryData = {
  ...MOCK_DAILY_TELEMETRY,
  timeframe: 'yearly',
  revenuePoints: [
    { label: '2023', grossRevenue: 850000, netProfit: 255000, orderCount: 8200 },
    { label: '2024', grossRevenue: 1240000, netProfit: 372000, orderCount: 11800 },
    { label: '2025', grossRevenue: 1890000, netProfit: 567000, orderCount: 17400 },
    { label: '2026', grossRevenue: 2450000, netProfit: 735000, orderCount: 22100 },
  ],
};

class ReportService extends BaseApiService {
  constructor() {
    super(apiClient, '/reports');
  }

  public async getReportsTelemetry(timeframe: TimeframeGranularity = 'monthly'): Promise<ReportsTelemetryData> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 400));
      if (timeframe === 'daily') return MOCK_DAILY_TELEMETRY;
      if (timeframe === 'yearly') return MOCK_YEARLY_TELEMETRY;
      return MOCK_MONTHLY_TELEMETRY;
    }
    return this.get<ReportsTelemetryData>(`/telemetry?timeframe=${timeframe}`);
  }

  public async exportReport(payload: ExportReportPayload): Promise<{ downloadUrl: string; filename: string }> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 500));
      const filename = `digilocal_report_${payload.timeframe}_${Date.now()}.${payload.format}`;
      return {
        downloadUrl: `/downloads/${filename}`,
        filename,
      };
    }
    return this.post<{ downloadUrl: string; filename: string }, ExportReportPayload>('/export', payload);
  }
}

export const reportService = new ReportService();
