export type VendorStatus = 'active' | 'suspended' | 'pending_approval';

export type SubscriptionTier = 'subscribed' | 'unsubscribed' | 'pro' | 'free' | 'enterprise';

export interface BusinessHoursItem {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface VendorPayment {
  id: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  invoiceUrl?: string;
}

export interface Vendor {
  id: string;
  storeName: string;
  ownerName: string;
  category: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  societyName: string;
  gstin: string;
  businessType: 'Sole Proprietorship' | 'Partnership' | 'LLP' | 'Private Limited';
  subscriptionTier: SubscriptionTier;
  subscriptionRenewalDate: string;
  status: VendorStatus;
  totalEarnings: number;
  avatarUrl?: string;
  businessHours: BusinessHoursItem[];
  createdAt: string;
  updatedAt: string;
}

export interface VendorQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: VendorStatus | 'all';
  tier?: SubscriptionTier | 'all';
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface CreateVendorPayload {
  storeName: string;
  ownerName: string;
  category: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  societyName: string;
  gstin: string;
  businessType: 'Sole Proprietorship' | 'Partnership' | 'LLP' | 'Private Limited';
  subscriptionTier: SubscriptionTier;
}

export interface UpdateVendorPayload extends Partial<CreateVendorPayload> {
  status?: VendorStatus;
}

export interface BulkVendorActionPayload {
  ids: string[];
  action: 'activate' | 'suspend' | 'delete';
}
