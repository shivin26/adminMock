export interface VendorPayment {
  payment_id: number;
  subscription_id: number;
  vendor_id: number;
  amount: number;
  payment_method: string;
  transaction_id: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  paid_at: string;
}

export type VendorStatus = 'active' | 'pending' | 'suspended' | 'expired';

export interface Vendor {
  id: string;
  storeName: string;
  ownerName: string;
  category: string;
  email: string;
  phone: string;
  address: string;
  societyName: string;
  societyId?: string;
  gstin: string;
  subscriptionTier: 'subscribed' | 'unsubscribed' | 'pro' | 'free' | 'enterprise';
  subscriptionRenewalDate: string;
  status: VendorStatus;
  totalEarnings: number;
  totalOrdersCount: number;
  avatarUrl: string;
  payments: VendorPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface RawVendorDTO {
  vendor_id: number | string;
  society_id?: number | string;
  society_name?: string;
  location?: string;
  vendor_name: string;
  email: string;
  phone_number?: string;
  gst_number?: string;
  store_name: string;
  logo?: string;
  description?: string;
  status: string;
  total_orders?: number;
  total_earnings?: number;
  created_at?: string;
  vendor_created_at?: string;
  payments?: VendorPayment[];
  subscription_tier?: string;
  renewal_date?: string;
  subscription_id?: number | string;
  subscription_status?: string;
  start_date?: string;
  end_date?: string;
}

export interface VendorApprovalResponse {
  message: string;
  vendor_id: string | number;
  start_date?: string;
  end_date?: string;
  status?: string;
}
