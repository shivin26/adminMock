import type { VendorPayment } from './vendor.types';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface Subscription {
  id: string;
  vendorId: string;
  storeName: string;
  ownerName: string;
  societyName: string;
  tier: SubscriptionTier;
  price: number;
  startDate: string;
  renewalDate: string;
  daysRemaining: number;
  status: 'active' | 'expiring_soon' | 'expired' | 'suspended' | 'blocked' | 'pending';
  isVendorBlocked?: boolean;
  vendorStatus?: string;
  payments: VendorPayment[];
}

export interface SubscriptionStats {
  totalActiveSubscriptions: number;
  mrr: number;
  upcomingRenewalsCount: number;
  tierBreakdown: {
    free: number;
    pro: number;
    enterprise: number;
  };
}

export interface SubscriptionRenewalRequest {
  durationMonths: number;
  tier?: SubscriptionTier;
}

export interface Invoice {
  invoiceId: string;
  vendorId: string;
  storeName: string;
  gstin: string;
  amount: number;
  taxAmount: number;
  issueDate: string;
  downloadUrl?: string;
}
