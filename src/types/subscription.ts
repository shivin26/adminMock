export type SubscriptionStatus = 'active' | 'expiring_soon' | 'overdue' | 'cancelled';

export type BillingCycle = 'monthly' | 'annual';

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export interface SubscriptionHistoryLog {
  id: string;
  action: string;
  date: string;
  amount: number;
  details: string;
}

export interface Subscription {
  id: string;
  vendorId: string;
  vendorName: string;
  storeName: string;
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  price: number;
  startDate: string;
  expiryDate: string;
  remainingDays: number;
  status: SubscriptionStatus;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  autoRenew: boolean;
  invoiceUrl?: string;
  history: SubscriptionHistoryLog[];
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SubscriptionStatus | 'all';
  plan?: SubscriptionPlan | 'all';
  billingCycle?: BillingCycle | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface RenewSubscriptionPayload {
  subscriptionId: string;
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  autoRenew: boolean;
}

export interface CancelSubscriptionPayload {
  subscriptionId: string;
  reason: string;
}

export interface SubscriptionAnalyticsData {
  activeSubscriptions: number;
  expiringSoonCount: number;
  overdueCount: number;
  monthlyRecurringRevenue: number;
  planDistribution: Array<{ name: string; count: number; mrr: number; color: string }>;
}
