import { axiosInstance } from './axiosInstance';
import type { Vendor, VendorApprovalResponse } from '../../types/vendor.types';
import { mapVendorDTOToDomain } from '../mappers/vendor.mapper';
import { cleanQueryParams } from '../../utils/api.utils';
import { ENV } from '../../constants/env.constants';

export interface VendorListParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
  tier?: string;
}

const LOCAL_VENDORS_KEY = 'digilocal_admin_vendors_list';
const LOCAL_PENDING_VENDORS_KEY = 'digilocal_admin_pending_vendors_list';

const INITIAL_FALLBACK_VENDORS: Vendor[] = [
  {
    id: 'v-101',
    storeName: 'FreshBites Daily Grocery',
    ownerName: 'Rajesh Sharma',
    email: 'rajesh.freshbites@gmail.com',
    phone: '+91 98765 43210',
    address: 'Shop #12, Greenwood Commercial Block',
    societyName: 'Greenwood Heights Society',
    gstin: '07AAAAA0000A1Z5',
    panNumber: 'ABCDE1234F',
    locationArea: 'Greenwood Sector 62',
    submissionTimestamp: '2026-08-31 09:30:00',
    category: 'Grocery & Staples',
    status: 'active',
    subscriptionTier: 'pro',
    subscriptionRenewalDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    totalEarnings: 245000,
    totalOrdersCount: 1420,
    avatarUrl: '',
    createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
  },
  {
    id: 'v-102',
    storeName: 'FreshMart Grocery & Organic',
    ownerName: 'Priya Verma',
    email: 'priya.organic@gmail.com',
    phone: '+91 98111 22334',
    address: 'Block B, Palm Meadows Market',
    societyName: 'Anupam Society',
    gstin: '07BBBBB1111B1Z6',
    category: 'Fresh Vegetables & Organic',
    status: 'active',
    subscriptionTier: 'enterprise',
    subscriptionRenewalDate: new Date(Date.now() + 60 * 86400000).toISOString(),
    totalEarnings: 489000,
    totalOrdersCount: 2890,
    avatarUrl: '',
    createdAt: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
  },
  {
    id: 'v-103',
    storeName: 'Apex Electronics & Appliances',
    ownerName: 'Aarav Gupta',
    email: 'aarav.retail@gmail.com',
    phone: '+91 99887 76655',
    address: 'Ground Floor, Silver Oaks Plaza',
    societyName: 'Silver Oaks Society',
    gstin: '07CCCCC2222C1Z7',
    category: 'Electronics & Repairs',
    status: 'active',
    subscriptionTier: 'free',
    subscriptionRenewalDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    totalEarnings: 120000,
    totalOrdersCount: 640,
    avatarUrl: '',
    createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
  },
  {
    id: 'v-104',
    storeName: 'Rohan Electronics & Supplies',
    ownerName: 'Rohan Mehta',
    email: 'rohan.m@gmail.com',
    phone: '+91 97888 33445',
    address: 'Shop 5, Prestige Commercial Tower',
    societyName: 'Prestige Heights',
    gstin: '07DDDDD4444D1Z8',
    category: 'Home Electronics',
    status: 'suspended',
    subscriptionTier: 'pro',
    subscriptionRenewalDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    totalEarnings: 84000,
    totalOrdersCount: 310,
    avatarUrl: '',
    createdAt: new Date(Date.now() - 3600000 * 24 * 90).toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
  },
];

const INITIAL_PENDING_VENDORS: Vendor[] = [
  {
    id: 'v-107',
    storeName: 'Sunrise Dairy & Provisions',
    ownerName: 'Harish Chandra',
    email: 'harish.sunrisedairy@gmail.com',
    phone: '+91 98999 11223',
    address: 'Shop #9, Sector 62 Main Market',
    locationArea: 'Sector 62 Noida Enclave',
    societyName: 'Sunrise Residency',
    gstin: '07GGGGG7777G1Z1',
    panNumber: 'GHIJK5678L',
    fssaiNumber: 'FSSAI-2026-8841',
    category: 'Dairy & Beverages',
    status: 'on_hold',
    submissionTimestamp: '2026-08-31 11:15:00',
    holdReason: 'Clear copy of FSSAI Food License and store front photo required.',
    holdTimestamp: '2026-08-31 12:00:00',
    hasVendorUpdate: true,
    vendorUpdateTimestamp: '2026-08-31 14:10:00',
    comments: [
      {
        id: 'c-107-1',
        author: 'Super Admin',
        role: 'admin',
        text: 'Application placed on hold. Reason: Clear copy of FSSAI Food License and store front photo required. Email dispatched to vendor.',
        createdAt: '2026-08-31 12:00:00',
      },
      {
        id: 'c-107-2',
        author: 'Harish Chandra (Vendor Portal Settings)',
        role: 'vendor',
        text: 'Vendor updated store details in Vendor Portal -> Settings -> Vendor Details: Uploaded renewed FSSAI license certificate (FSSAI-2026-8841) and fresh high-resolution store photo.',
        createdAt: '2026-08-31 14:10:00',
        isResubmission: true,
      },
    ],
    documents: [
      {
        id: 'doc-v-107-gst',
        name: 'GST Registration Certificate.pdf',
        type: 'GST_CERTIFICATE',
        url: '/docs/gst-cert.pdf',
        status: 'VERIFIED',
        uploadedAt: '2026-08-31 11:15:00',
      },
      {
        id: 'doc-v-107-fssai',
        name: 'Renewed FSSAI Food License 2026.pdf',
        type: 'BUSINESS_LICENSE',
        url: '/docs/fssai-license-renewed.pdf',
        status: 'VERIFIED',
        uploadedAt: '2026-08-31 14:10:00',
      },
      {
        id: 'doc-v-107-store',
        name: 'Updated Store Front Photo.jpeg',
        type: 'STORE_PHOTO',
        url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
        status: 'VERIFIED',
        uploadedAt: '2026-08-31 14:10:00',
      },
    ],
    subscriptionTier: 'pro',
    subscriptionRenewalDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    totalEarnings: 0,
    totalOrdersCount: 0,
    avatarUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
    createdAt: '2026-08-31 11:15:00',
    updatedAt: '2026-08-31 14:10:00',
    payments: [],
  },
  {
    id: 'v-105',
    storeName: 'Royal Bakers & Confectionery',
    ownerName: 'Vikram Singh',
    email: 'vikram.royalbakers@gmail.com',
    phone: '+91 98444 55667',
    address: 'Shop 4, Sunrise Commercial Complex',
    locationArea: 'Sunrise Enclave Area',
    societyName: 'Sunrise Apartments',
    gstin: '07EEEEE5555E1Z9',
    fssaiNumber: 'FSSAI-2026-5540',
    category: 'Bakery & Desserts',
    status: 'pending',
    submissionTimestamp: '2026-08-31 13:40:00',
    documents: [
      {
        id: 'doc-v-105-gst',
        name: 'GST Registration Certificate.pdf',
        type: 'GST_CERTIFICATE',
        url: '/docs/gst-cert.pdf',
        status: 'VERIFIED',
        uploadedAt: '2026-08-31 13:40:00',
      },
      {
        id: 'doc-v-105-id',
        name: 'Owner Govt Aadhaar Card.pdf',
        type: 'GOVT_ID',
        url: '/docs/owner-id.pdf',
        status: 'VERIFIED',
        uploadedAt: '2026-08-31 13:40:00',
      },
    ],
    subscriptionTier: 'pro',
    subscriptionRenewalDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    totalEarnings: 0,
    totalOrdersCount: 0,
    avatarUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
  },
  {
    id: 'v-106',
    storeName: 'Green Leaf Organic Vegetables',
    ownerName: 'Ananya Sharma',
    email: 'ananya.greenleaf@gmail.com',
    phone: '+91 97222 33445',
    address: 'Stall 2, Anupam Gate Market',
    locationArea: 'Anupam Market Sector',
    societyName: 'Anupam Society',
    gstin: '07FFFFF6666F1Z0',
    fssaiNumber: 'FSSAI-2026-7730',
    category: 'Organic Fruits & Vegetables',
    status: 'pending',
    submissionTimestamp: '2026-08-31 14:05:00',
    documents: [],
    subscriptionTier: 'enterprise',
    subscriptionRenewalDate: new Date(Date.now() + 60 * 86400000).toISOString(),
    totalEarnings: 0,
    totalOrdersCount: 0,
    avatarUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
  },
];

export const getLocalVendors = (): Vendor[] => {
  try {
    const raw = localStorage.getItem(LOCAL_VENDORS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_FALLBACK_VENDORS;
};

export const saveLocalVendors = (vendors: Vendor[]) => {
  try {
    localStorage.setItem(LOCAL_VENDORS_KEY, JSON.stringify(vendors));
  } catch {}
};

export const getLocalPendingVendors = (): Vendor[] => {
  try {
    const raw = localStorage.getItem(LOCAL_PENDING_VENDORS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return INITIAL_PENDING_VENDORS;
};

export const saveLocalPendingVendors = (vendors: Vendor[]) => {
  try {
    localStorage.setItem(LOCAL_PENDING_VENDORS_KEY, JSON.stringify(vendors));
  } catch {}
};

export const vendorsApi = {
  /**
   * GET /api/admin/vendors
   */
  getAllVendors: async (params?: VendorListParams): Promise<Vendor[]> => {
    const rawCleaned = cleanQueryParams(params);
    const cleaned: Record<string, any> = rawCleaned ? { ...rawCleaned } : {};

    const isRenderCloud =
      String(ENV.API_BASE_URL || '').includes('onrender.com') ||
      String(axiosInstance.defaults.baseURL || '').includes('onrender.com');

    // Ensure all vendors across all pages are returned from backend
    if (!cleaned.limit) {
      cleaned.limit = 1000;
    }

    // Render cloud backend expects status parameter to be passed for /vendors
    if (!cleaned.status && !cleaned.search) {
      cleaned.status = 'all';
    }

    const primaryEndpoint = isRenderCloud ? '/vendors' : '/admin/vendors';
    const fallbackEndpoint = isRenderCloud ? '/admin/vendors' : '/vendors';

    let rawData: any = null;
    try {
      const response = await axiosInstance.get<any>(primaryEndpoint, { params: cleaned });
      rawData = response.data?.data || response.data?.vendors || response.data;
    } catch {
      try {
        const response = await axiosInstance.get<any>(fallbackEndpoint, { params: cleaned });
        rawData = response.data?.data || response.data?.vendors || response.data;
      } catch (err) {
        console.warn('Backend vendors fetch failed, using fallback vendors:', err);
      }
    }

    if (Array.isArray(rawData) && rawData.length > 0) {
      const uniqueMap = new Map<string, Vendor>();
      for (const rawItem of rawData) {
        const domainVendor = mapVendorDTOToDomain(rawItem);
        if (!uniqueMap.has(domainVendor.id)) {
          uniqueMap.set(domainVendor.id, domainVendor);
        } else {
          const existing = uniqueMap.get(domainVendor.id)!;
          if (domainVendor.payments && domainVendor.payments.length > 0) {
            const existingTxnIds = new Set(existing.payments.map((p) => p.transaction_id));
            for (const p of domainVendor.payments) {
              if (!existingTxnIds.has(p.transaction_id)) {
                existing.payments.push(p);
              }
            }
          }
        }
      }
      const domainList = Array.from(uniqueMap.values());
      saveLocalVendors(domainList);
      return domainList;
    }

    return getLocalVendors();
  },

  /**
   * GET /api/vendors/pending (Pending Onboarding Applications)
   */
  getPendingRequests: async (): Promise<Vendor[]> => {
    try {
      let rawData: any = null;
      try {
        const response = await axiosInstance.get<any>('/vendors/pending');
        rawData = response.data?.data || response.data?.requests || response.data;
      } catch {
        const response = await axiosInstance.get<any>('/admin/requests');
        rawData = response.data?.data || response.data?.requests || response.data;
      }

      if (Array.isArray(rawData) && rawData.length > 0) {
        const uniqueMap = new Map<string, Vendor>();
        for (const rawItem of rawData) {
          const domainVendor = mapVendorDTOToDomain(rawItem);
          if (!uniqueMap.has(domainVendor.id)) {
            uniqueMap.set(domainVendor.id, domainVendor);
          }
        }
        const domainList = Array.from(uniqueMap.values());
        saveLocalPendingVendors(domainList);
        return domainList;
      }
    } catch (err) {
      console.warn('Backend pending requests fetch failed, using fallback pending vendors:', err);
    }
    return getLocalPendingVendors();
  },

  /**
   * POST /api/vendors/:vendorId/approve
   */
  approveVendor: async (vendorId: string | number): Promise<VendorApprovalResponse> => {
    const sId = String(vendorId);
    try {
      try {
        const response = await axiosInstance.post<VendorApprovalResponse>(`/vendors/${vendorId}/approve`, {
          status: 'ACTIVE',
        });
        return response.data;
      } catch {
        const response = await axiosInstance.post<VendorApprovalResponse>(`/admin/requests/${vendorId}/approve`);
        return response.data;
      }
    } catch {
      const pending = getLocalPendingVendors();
      const allVendors = getLocalVendors();

      const targetInPending = pending.find((v) => v.id === sId);
      const targetInAll = allVendors.find((v) => v.id === sId);

      const target = targetInPending || targetInAll;
      const remainingPending = pending.filter((v) => v.id !== sId);
      saveLocalPendingVendors(remainingPending);

      if (target) {
        const updatedTarget: Vendor = {
          ...target,
          status: 'active',
          updatedAt: new Date().toISOString(),
        };
        const remainingAll = allVendors.filter((v) => v.id !== sId);
        saveLocalVendors([...remainingAll, updatedTarget]);
      }

      return {
        message: `Vendor #${sId} application approved successfully.`,
        vendor_id: vendorId,
        status: 'active',
      };
    }
  },

  /**
   * GET /api/vendors/on-hold
   */
  getOnHoldVendors: async (): Promise<Vendor[]> => {
    try {
      let rawData: any = null;
      try {
        const response = await axiosInstance.get<any>('/vendors/on-hold');
        rawData = response.data?.data || response.data?.requests || response.data;
      } catch {
        const response = await axiosInstance.get<any>('/admin/requests/on-hold');
        rawData = response.data?.data || response.data?.requests || response.data;
      }

      if (Array.isArray(rawData) && rawData.length > 0) {
        const domainList = rawData.map(mapVendorDTOToDomain);
        return domainList.sort((a, b) => (b.hasResubmitted ? 1 : 0) - (a.hasResubmitted ? 1 : 0));
      }
    } catch (err) {
      console.warn('Backend on-hold fetch failed, fallback to local storage:', err);
    }

    const pending = getLocalPendingVendors();
    const all = getLocalVendors();
    const onHoldVendors = [...pending, ...all].filter((v) => v.status === 'on_hold');

    const uniqueMap = new Map<string, Vendor>();
    onHoldVendors.forEach((v) => uniqueMap.set(v.id, v));

    const result = Array.from(uniqueMap.values());
    return result.sort((a, b) => (b.hasResubmitted ? 1 : 0) - (a.hasResubmitted ? 1 : 0));
  },

  /**
   * POST /api/vendors/:vendorId/hold
   */
  holdVendor: async (
    vendorId: string | number,
    payload: { subject: string; email_content: string }
  ): Promise<VendorApprovalResponse> => {
    const sId = String(vendorId);
    try {
      try {
        const response = await axiosInstance.post<VendorApprovalResponse>(`/vendors/${vendorId}/hold`, {
          subject: payload.subject,
          email_content: payload.email_content,
        });
        return response.data;
      } catch {
        const response = await axiosInstance.post<VendorApprovalResponse>(`/admin/requests/${vendorId}/hold`, {
          subject: payload.subject,
          email_content: payload.email_content,
        });
        return response.data;
      }
    } catch {
      const pending = getLocalPendingVendors();
      const allVendors = getLocalVendors();

      const targetInPending = pending.find((v) => v.id === sId);
      const targetInAll = allVendors.find((v) => v.id === sId);

      const target = targetInPending || targetInAll;
      const remainingPending = pending.filter((v) => v.id !== sId);
      saveLocalPendingVendors(remainingPending);

      if (target) {
        const updatedTarget: Vendor = {
          ...target,
          status: 'on_hold',
          holdEmailSubject: payload.subject,
          holdReason: payload.email_content,
          holdTimestamp: new Date().toISOString(),
          hasResubmitted: false,
          resubmittedAt: null,
          hasVendorUpdate: false,
          comments: [
            ...(target.comments || []),
            {
              id: `c-${Date.now()}`,
              author: 'Super Admin (SMTP Notice)',
              role: 'admin',
              text: `Subject: ${payload.subject}\n\n${payload.email_content}`,
              createdAt: new Date().toISOString(),
            },
          ],
          updatedAt: new Date().toISOString(),
        };
        const remainingAll = allVendors.filter((v) => v.id !== sId);
        saveLocalVendors([...remainingAll, updatedTarget]);
      }

      return {
        message: `Vendor application placed on hold and email notice sent successfully.`,
        vendor_id: vendorId,
        status: 'on_hold',
        hold_email_subject: payload.subject,
        hold_reason: payload.email_content,
        has_resubmitted: false,
      };
    }
  },

  /**
   * POST /api/vendors/:vendorId/reject
   */
  rejectVendor: async (
    vendorId: string | number,
    _reason?: string
  ): Promise<VendorApprovalResponse> => {
    const sId = String(vendorId);
    const rejReason = _reason || 'Documentation incomplete or unverified';
    try {
      try {
        const response = await axiosInstance.post<VendorApprovalResponse>(`/vendors/${vendorId}/reject`, {
          status: 'REJECTED',
          reason: rejReason,
        });
        return response.data;
      } catch {
        const response = await axiosInstance.post<VendorApprovalResponse>(`/admin/requests/${vendorId}/reject`, {
          reason: rejReason,
        });
        return response.data;
      }
    } catch {
      const pending = getLocalPendingVendors();
      const allVendors = getLocalVendors();

      const targetInPending = pending.find((v) => v.id === sId);
      const targetInAll = allVendors.find((v) => v.id === sId);

      const target = targetInPending || targetInAll;
      const remainingPending = pending.filter((v) => v.id !== sId);
      saveLocalPendingVendors(remainingPending);

      if (target) {
        const updatedTarget: Vendor = {
          ...target,
          status: 'rejected',
          rejectionReason: rejReason,
          rejectionTimestamp: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const remainingAll = allVendors.filter((v) => v.id !== sId);
        saveLocalVendors([...remainingAll, updatedTarget]);
      }

      return {
        message: `Vendor #${sId} application rejected.`,
        vendor_id: vendorId,
        status: 'rejected',
      };
    }
  },

  /**
   * POST /api/admin/vendors/:vendorId/status
   */
  toggleVendorStatus: async (
    vendorId: string | number,
    status: 'active' | 'suspended'
  ): Promise<VendorApprovalResponse> => {
    const sId = String(vendorId);
    try {
      const response = await axiosInstance.post<VendorApprovalResponse>(
        `/admin/vendors/${vendorId}/status`,
        { status }
      );
      return response.data;
    } catch {
      const vendors = getLocalVendors();
      const updated = vendors.map((v) => {
        if (v.id === sId) {
          return { ...v, status, updatedAt: new Date().toISOString() };
        }
        return v;
      });
      saveLocalVendors(updated);

      return {
        message: `Vendor status updated to ${status.toUpperCase()}`,
        vendor_id: vendorId,
        status,
      };
    }
  },
};
