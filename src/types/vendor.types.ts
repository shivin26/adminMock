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

export type VendorStatus = 'active' | 'pending' | 'on_hold' | 'rejected' | 'suspended' | 'expired';

export interface VendorVerificationDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  status: 'VERIFIED' | 'PENDING' | 'ACTION_REQUIRED' | 'REJECTED';
  uploadedAt: string;
}

export interface VendorRequestComment {
  id: string;
  author: string;
  role: 'admin' | 'vendor' | 'system';
  text: string;
  createdAt: string;
  isResubmission?: boolean;
}

export interface VendorFieldChange {
  field: string;
  label: string;
  oldValue?: string;
  newValue: string;
}

export interface HoldVendorPayload {
  subject: string;
  email_content: string;
  hold_email_subject?: string;
  hold_reason?: string;
  reason?: string;
  remarks?: string;
  message?: string;
}

export interface Vendor {
  id: string;
  storeName: string;
  ownerName: string;
  category: string;
  vendorType?: string;
  email: string;
  phone: string;
  countryCode?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  address: string;
  description?: string;
  shopNumber?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  locationArea: string;
  societyName: string;
  societyId?: string;
  gstin: string;
  panNumber: string;
  fssaiNumber?: string;
  submissionTimestamp: string;
  createdAtReadable?: string;
  createdAtIst?: string;
  createdAtTime?: string;
  holdEmailSubject?: string;
  holdReason?: string;
  holdTimestamp?: string;
  hasResubmitted?: boolean;
  resubmittedAt?: string | null;
  resubmittedAtReadable?: string | null;
  resubmittedChanges?: VendorFieldChange[];
  updatedFieldKeys?: string[];
  hasVendorUpdate?: boolean;
  isUpdateViewed?: boolean;
  vendorUpdateTimestamp?: string;
  comments?: VendorRequestComment[];
  verifiedFields?: Record<string, boolean>;
  rejectionReason?: string;
  rejectionTimestamp?: string;
  documents?: VendorVerificationDocument[];
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
  id?: number | string;
  society_id?: number | string;
  society_name?: string;
  location?: string;
  location_area?: string;
  vendor_name?: string;
  owner_name?: string;
  email?: string;
  phone_number?: string;
  phone?: string;
  gstin?: string;
  gst_number?: string;
  pan_number?: string;
  fssai_number?: string;
  store_name?: string;
  shop_name?: string;
  category?: string;
  vendor_type?: string;
  shop_number?: string;
  shop_no?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  shop_image?: string;
  logo?: string;
  description?: string;
  status?: string;
  total_orders?: number;
  total_earnings?: number;
  created_at?: string;
  vendor_created_at?: string;
  submission_timestamp?: string;
  created_at_readable?: string;
  created_at_time?: string;
  hold_email_subject?: string;
  hold_reason?: string;
  hold_timestamp?: string;
  has_resubmitted?: boolean;
  is_update_viewed?: boolean;
  resubmitted_at?: string | null;
  resubmitted_at_readable?: string | null;
  resubmitted_changes?: VendorFieldChange[];
  updated_fields?: string[];
  rejection_reason?: string;
  rejection_timestamp?: string;
  documents?: VendorVerificationDocument[];
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
  hold_email_subject?: string;
  hold_reason?: string;
  has_resubmitted?: boolean;
}

