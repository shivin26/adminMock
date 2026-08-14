export interface DashboardMetrics {
  totalRevenue: number;
  revenueChangePercent: number;
  activeVendors: number;
  vendorsChangePercent: number;
  totalSubscriptions: number;
  subscriptionsChangePercent: number;
  growthRatePercent: number;
  growthRateChangePercent: number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  profit: number;
  target: number;
}

export interface VendorGrowthPoint {
  month: string;
  newVendors: number;
  totalVendors: number;
}

export interface SubscriptionTierPoint {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface PaymentRecord {
  id: string;
  vendorName: string;
  vendorCategory: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
}

export interface RecentVendor {
  id: string;
  name: string;
  ownerName: string;
  category: string;
  location: string;
  joinedDate: string;
  status: 'active' | 'pending' | 'suspended';
  avatarUrl?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: 'vendor' | 'payment' | 'system' | 'security';
  iconType?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}
