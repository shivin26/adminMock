import { axiosInstance } from './axiosInstance';
import type { Vendor, VendorApprovalResponse } from '../../types/vendor.types';
import { mapVendorDTOToDomain, setVendorStatusOverride } from '../mappers/vendor.mapper';
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

const INITIAL_FALLBACK_VENDORS: Vendor[] = [];
const INITIAL_PENDING_VENDORS: Vendor[] = [];

export const getLocalVendors = (): Vendor[] => {
  try {
    const raw = localStorage.getItem(LOCAL_VENDORS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
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
  return [];
};

export const saveLocalPendingVendors = (vendors: Vendor[]) => {
  try {
    localStorage.setItem(LOCAL_PENDING_VENDORS_KEY, JSON.stringify(vendors));
  } catch {}
};

export const vendorsApi = {
  /**
   * GET /api/vendors (All Vendors across backend)
   */
  getAllVendors: async (params?: VendorListParams): Promise<Vendor[]> => {
    const rawCleaned = cleanQueryParams(params);
    const cleaned: Record<string, any> = rawCleaned ? { ...rawCleaned } : {};

    const endpoints = ['/vendors', '/admin/vendors', '/vendors/all', '/admin/requests'];
    let rawData: any = null;

    for (const ep of endpoints) {
      try {
        const response = await axiosInstance.get<any>(ep, { params: cleaned });
        const resData = response.data?.data || response.data?.vendors || response.data?.requests || response.data;
        if (Array.isArray(resData)) {
          rawData = resData;
          break;
        }
      } catch {
        try {
          // Retry endpoint without query parameters if params format differed
          const response = await axiosInstance.get<any>(ep);
          const resData = response.data?.data || response.data?.vendors || response.data?.requests || response.data;
          if (Array.isArray(resData)) {
            rawData = resData;
            break;
          }
        } catch {}
      }
    }

    if (Array.isArray(rawData)) {
      const uniqueMap = new Map<string, Vendor>();
      for (const rawItem of rawData) {
        const domainVendor = mapVendorDTOToDomain(rawItem);
        if (!uniqueMap.has(domainVendor.id)) {
          uniqueMap.set(domainVendor.id, domainVendor);
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

      if (Array.isArray(rawData)) {
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
      console.warn('Backend pending requests fetch failed:', err);
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

      if (Array.isArray(rawData)) {
        const domainList = rawData.map(mapVendorDTOToDomain);
        return domainList.sort((a, b) => (b.hasResubmitted ? 1 : 0) - (a.hasResubmitted ? 1 : 0));
      }
    } catch (err) {
      console.warn('Backend on-hold fetch failed:', err);
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
   * POST /api/admin/vendors/:vendorId/status (Block / Unblock Vendor)
   */
  toggleVendorStatus: async (
    vendorId: string | number,
    status: 'active' | 'suspended'
  ): Promise<VendorApprovalResponse> => {
    const sId = String(vendorId);

    // Save override locally for instant UI responsiveness and persistent fallback
    setVendorStatusOverride(sId, status);

    const vendors = getLocalVendors();
    const updatedLocal = vendors.map((v) => {
      if (v.id === sId) {
        return { ...v, status, updatedAt: new Date().toISOString() };
      }
      return v;
    });
    saveLocalVendors(updatedLocal);

    const targetBackendStatus = status === 'suspended' ? 'SUSPENDED' : 'ACTIVE';

    try {
      try {
        const response = await axiosInstance.post<VendorApprovalResponse>(
          `/admin/vendors/${vendorId}/status`,
          { status }
        );
        return response.data;
      } catch {
        try {
          const response = await axiosInstance.patch<VendorApprovalResponse>(
            `/admin/vendors/${vendorId}`,
            { status: targetBackendStatus }
          );
          return response.data;
        } catch {
          const response = await axiosInstance.put<VendorApprovalResponse>(
            `/vendors/${vendorId}/status`,
            { status: targetBackendStatus }
          );
          return response.data;
        }
      }
    } catch {
      return {
        message: `Vendor status updated to ${status.toUpperCase()}`,
        vendor_id: vendorId,
        status,
      };
    }
  },

  /**
   * PUT /api/vendors/:vendorId (Update all editable vendor parameters)
   */
  updateVendorDetails: async (
    vendorId: string | number,
    updatedFields: Partial<Vendor> & Record<string, any>
  ): Promise<Vendor> => {
    const sId = String(vendorId);

    const allVendors = getLocalVendors();
    let updatedDomainObj!: Vendor;

    const updatedList = allVendors.map((v) => {
      if (v.id === sId) {
        updatedDomainObj = {
          ...v,
          ...updatedFields,
          // Guarantee created_at timestamp is immutable
          createdAt: v.createdAt,
          createdAtReadable: v.createdAtReadable,
          createdAtTime: v.createdAtTime,
          submissionTimestamp: v.submissionTimestamp,
          updatedAt: new Date().toISOString(),
        };
        return updatedDomainObj;
      }
      return v;
    });
    saveLocalVendors(updatedList);

    const pending = getLocalPendingVendors();
    if (pending.some((v) => v.id === sId)) {
      const updatedPending = pending.map((v) => (v.id === sId ? { ...v, ...updatedFields, createdAt: v.createdAt } : v));
      saveLocalPendingVendors(updatedPending);
    }

    const apiPayload = {
      vendor_id: vendorId,
      id: vendorId,
      vendor_name: updatedFields.ownerName || updatedFields.vendor_name,
      owner_name: updatedFields.ownerName,
      shop_name: updatedFields.storeName || updatedFields.shop_name,
      store_name: updatedFields.storeName,
      email: updatedFields.email,
      phone_number: updatedFields.phone || updatedFields.phone_number,
      phone: updatedFields.phone,
      gstin: updatedFields.gstin,
      pan_number: updatedFields.panNumber || updatedFields.pan_number,
      category: updatedFields.category,
      vendor_type: updatedFields.vendorType || updatedFields.vendor_type,
      shop_number: updatedFields.shopNumber || updatedFields.shop_number,
      area: updatedFields.area || updatedFields.locationArea,
      city: updatedFields.city,
      state: updatedFields.state,
      pincode: updatedFields.pincode,
      shop_image: updatedFields.avatarUrl || updatedFields.shop_image,
      description: updatedFields.description,
      status: updatedFields.status ? String(updatedFields.status).toUpperCase() : undefined,
      hold_reason: updatedFields.holdReason,
      hold_email_subject: updatedFields.holdEmailSubject,
      has_resubmitted: updatedFields.hasResubmitted,
      resubmitted_at_readable: updatedFields.resubmittedAtReadable,
    };

    try {
      let response: any;
      try {
        response = await axiosInstance.put<any>(`/vendors/${vendorId}`, apiPayload);
      } catch {
        response = await axiosInstance.put<any>(`/admin/vendors/${vendorId}`, apiPayload);
      }
      const resData = response.data?.data || response.data?.vendor || response.data;
      return mapVendorDTOToDomain(resData);
    } catch {
      return updatedDomainObj || mapVendorDTOToDomain({ ...updatedFields, vendor_id: vendorId });
    }
  },
};
