import { BaseApiService } from './base.service';
import { apiClient } from '../client';
import {
  DashboardMetrics,
  RevenuePoint,
  VendorGrowthPoint,
  SubscriptionTierPoint,
  PaymentRecord,
  RecentVendor,
  ActivityItem,
  NotificationItem,
} from '../../types/dashboard';

export interface DashboardData {
  metrics: DashboardMetrics;
  revenueChart: RevenuePoint[];
  vendorGrowthChart: VendorGrowthPoint[];
  subscriptionChart: SubscriptionTierPoint[];
  recentPayments: PaymentRecord[];
  recentVendors: RecentVendor[];
  recentActivities: ActivityItem[];
  notifications: NotificationItem[];
}

// Mock Data Definitions matching DigiLocal platform
const MOCK_DASHBOARD_DATA: DashboardData = {
  metrics: {
    totalRevenue: 184950,
    revenueChangePercent: 14.8,
    activeVendors: 1420,
    vendorsChangePercent: 22.4,
    totalSubscriptions: 980,
    subscriptionsChangePercent: 18.2,
    growthRatePercent: 94.6,
    growthRateChangePercent: 4.1,
  },
  revenueChart: [
    { month: 'Jan', revenue: 12400, profit: 8200, target: 11000 },
    { month: 'Feb', revenue: 14800, profit: 9600, target: 13000 },
    { month: 'Mar', revenue: 16200, profit: 11100, target: 15000 },
    { month: 'Apr', revenue: 19500, profit: 13400, target: 17000 },
    { month: 'May', revenue: 22100, profit: 15200, target: 20000 },
    { month: 'Jun', revenue: 26800, profit: 18900, target: 24000 },
    { month: 'Jul', revenue: 31200, profit: 22400, target: 28000 },
    { month: 'Aug', revenue: 34800, profit: 25100, target: 32000 },
    { month: 'Sep', revenue: 29100, profit: 20800, target: 30000 },
  ],
  vendorGrowthChart: [
    { month: 'Jan', newVendors: 65, totalVendors: 850 },
    { month: 'Feb', newVendors: 82, totalVendors: 932 },
    { month: 'Mar', newVendors: 98, totalVendors: 1030 },
    { month: 'Apr', newVendors: 115, totalVendors: 1145 },
    { month: 'May', newVendors: 140, totalVendors: 1285 },
    { month: 'Jun', newVendors: 165, totalVendors: 1450 },
    { month: 'Jul', newVendors: 190, totalVendors: 1640 },
  ],
  subscriptionChart: [
    { name: 'Enterprise', count: 320, percentage: 35, color: '#224636' }, // Deep Forest
    { name: 'Pro Vendor', count: 480, percentage: 50, color: '#cba358' }, // Warm Gold
    { name: 'Free Starter', count: 180, percentage: 15, color: '#827973' }, // Muted Taupe
  ],
  recentPayments: [
    { id: 'PAY-8921', vendorName: 'Artisan Bakery Co.', vendorCategory: 'Food & Beverage', amount: 1250, date: 'Today, 14:20', status: 'completed', paymentMethod: 'Stripe Direct' },
    { id: 'PAY-8920', vendorName: 'Urban Coffee Roasters', vendorCategory: 'Cafe & Restaurant', amount: 890, date: 'Today, 12:45', status: 'completed', paymentMethod: 'Card' },
    { id: 'PAY-8919', vendorName: 'GreenThumb Organics', vendorCategory: 'Agriculture & Produce', amount: 2100, date: 'Yesterday', status: 'pending', paymentMethod: 'Bank Transfer' },
    { id: 'PAY-8918', vendorName: 'Boutique Apparel Studio', vendorCategory: 'Retail & Fashion', amount: 640, date: '28 Jul 2026', status: 'completed', paymentMethod: 'Stripe Direct' },
    { id: 'PAY-8917', vendorName: 'Heritage Woodcraft', vendorCategory: 'Crafts & Furniture', amount: 1750, date: '27 Jul 2026', status: 'completed', paymentMethod: 'Bank Transfer' },
  ],
  recentVendors: [
    { id: 'VND-301', name: 'The Local Pantry', ownerName: 'Claire Vance', category: 'Grocery & Gourmet', location: 'North District', joinedDate: 'Just now', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80' },
    { id: 'VND-302', name: 'Metro Pottery Works', ownerName: 'Marcus Bell', category: 'Home & Living', location: 'East Hub', joinedDate: '2 hours ago', status: 'pending', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
    { id: 'VND-303', name: 'Botanical Bloom Co.', ownerName: 'Elena Rostova', category: 'Florist & Decor', location: 'South Plaza', joinedDate: 'Yesterday', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' },
    { id: 'VND-304', name: 'Summit Outdoor Gear', ownerName: 'David Zhang', category: 'Sports & Adventure', location: 'West End', joinedDate: '26 Jul 2026', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
  ],
  recentActivities: [
    { id: 'ACT-101', title: 'New Vendor Registration', description: 'The Local Pantry submitted documentation for verification.', timestamp: '10 mins ago', category: 'vendor' },
    { id: 'ACT-102', title: 'Payout Processed', description: 'Monthly payout of $12,450 sent to 18 verified vendors.', timestamp: '1 hour ago', category: 'payment' },
    { id: 'ACT-103', title: 'Security Audit Completed', description: 'Automated vulnerability scanner reported zero high risks.', timestamp: '3 hours ago', category: 'security' },
    { id: 'ACT-104', title: 'System Backup Success', description: 'PostgreSQL database snapshot saved securely to S3 storage.', timestamp: '6 hours ago', category: 'system' },
  ],
  notifications: [
    { id: 'NOTIF-1', title: 'Vendor Approval Required', message: 'Metro Pottery Works is waiting for admin verification.', timestamp: '15 mins ago', read: false, type: 'warning' },
    { id: 'NOTIF-2', title: 'High Revenue Milestone', message: 'Monthly recurring revenue crossed $180,000 threshold!', timestamp: '2 hours ago', read: false, type: 'success' },
    { id: 'NOTIF-3', title: 'System Update Completed', message: 'Vite & React 19 engine optimization applied successfully.', timestamp: '1 day ago', read: true, type: 'info' },
  ],
};

class DashboardService extends BaseApiService {
  constructor() {
    super(apiClient, '/dashboard');
  }

  public async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await apiClient.get<any>('/admin/dashboard');
      const data = response.data?.data || response.data;
      if (data && data.metrics) {
        return data;
      }
    } catch (err) {
      console.warn('Backend dashboard fetch failed, falling back to local mock data:', err);
    }
    return MOCK_DASHBOARD_DATA;
  }
}

export const dashboardService = new DashboardService();
