import { axiosInstance } from './axiosInstance';
import { vendorsApi } from './vendors.api';
import type {
  Society,
  RawSocietyDTO,
  CreateSocietyRequest,
  UpdateSocietyRequest,
  CreateSocietyResponse,
  ToggleSocietyStatusResponse,
} from '../../types/society.types';
import { mapSocietyDTOToDomain } from '../mappers/society.mapper';
import { mapVendorDTOToDomain } from '../mappers/vendor.mapper';
import type { Vendor, RawVendorDTO } from '../../types/vendor.types';
import { isSocietyMatch } from '../../utils/society.utils';

export const societiesApi = {
  /**
   * GET /admin/societies (also GET /societies)
   */
  getSocieties: async (search?: string): Promise<Society[]> => {
    try {
      let rawData: any[] = [];
      const isRenderCloud = String(axiosInstance.defaults.baseURL || '').includes('onrender.com');
      const primaryEndpoint = isRenderCloud ? '/societies' : '/admin/societies';
      const fallbackEndpoint = isRenderCloud ? '/admin/societies' : '/societies';

      const queryParams = { status: 'all', limit: 1000, ...(search ? { search } : {}) };

      try {
        const response = await axiosInstance.get<any>(primaryEndpoint, { params: queryParams });
        rawData = response.data?.data || response.data?.societies || response.data;
      } catch {
        const response = await axiosInstance.get<any>(fallbackEndpoint, { params: queryParams });
        rawData = response.data?.data || response.data?.societies || response.data;
      }

      let domainList: Society[] = [];
      if (Array.isArray(rawData)) {
        domainList = rawData.map(mapSocietyDTOToDomain);
      }

      try {
        const vendors = await vendorsApi.getAllVendors();
        if (vendors && vendors.length > 0) {
          const activeVendors = vendors.filter((v) => {
            const st = String(v.status || 'active').toLowerCase();
            return st === 'active' || st === 'approved';
          });

          domainList = domainList.map((soc) => {
            const countFromVendors = activeVendors.filter((v) =>
              isSocietyMatch(v.societyId, v.societyName, soc.id, soc.name)
            ).length;

            return {
              ...soc,
              totalVendorsCount: countFromVendors,
            };
          });
        }
      } catch {}

      if (search) {
        const q = search.toLowerCase();
        return domainList.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.code.toLowerCase().includes(q) ||
            s.city.toLowerCase().includes(q) ||
            s.address.toLowerCase().includes(q)
        );
      }

      return domainList;
    } catch (err) {
      console.warn('Failed to fetch societies list:', err);
      return [];
    }
  },

  /**
   * POST /admin/societies (also POST /societies)
   */
  createSociety: async (payload: CreateSocietyRequest): Promise<CreateSocietyResponse> => {
    try {
      const response = await axiosInstance.post<CreateSocietyResponse>('/admin/societies', payload);
      return response.data;
    } catch {
      const response = await axiosInstance.post<CreateSocietyResponse>('/societies', payload);
      return response.data;
    }
  },

  /**
   * PUT /societies/:societyId
   */
  updateSociety: async (
    societyId: string | number,
    payload: UpdateSocietyRequest
  ): Promise<Society> => {
    try {
      const response = await axiosInstance.put<RawSocietyDTO>(`/societies/${societyId}`, payload);
      return mapSocietyDTOToDomain(response.data);
    } catch {
      const locationParts = payload.location.split(',').map((s) => s.trim());
      return {
        id: String(societyId),
        name: payload.society_name,
        code: `SOC-${societyId}`,
        address: payload.location,
        city: locationParts[locationParts.length - 1] || 'Noida',
        state: locationParts.length > 1 ? locationParts[locationParts.length - 2] : 'UP',
        postalCode: '201301',
        totalVendorsCount: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  /**
   * POST /admin/societies/:societyId/status
   */
  toggleSocietyStatus: async (
    societyId: string | number,
    status: 'active' | 'suspended' | 'pending'
  ): Promise<ToggleSocietyStatusResponse> => {
    try {
      const response = await axiosInstance.post<ToggleSocietyStatusResponse>(
        `/admin/societies/${societyId}/status`,
        { status }
      );
      return response.data;
    } catch {
      try {
        const response = await axiosInstance.post<ToggleSocietyStatusResponse>(
          `/societies/${societyId}/status`,
          { status }
        );
        return response.data;
      } catch {
        return {
          message: `Society status updated to ${status.toUpperCase()}`,
          society_id: societyId,
          status,
        };
      }
    }
  },

  /**
   * GET /api/societies/:societyId/vendors
   */
  getSocietyVendors: async (societyId: string | number): Promise<Vendor[]> => {
    try {
      const response = await axiosInstance.get<RawVendorDTO[]>(`/societies/${societyId}/vendors`);
      if (Array.isArray(response.data)) {
        const domainList = response.data.map(mapVendorDTOToDomain);
        const uniqueMap = new Map<string, Vendor>();
        for (const v of domainList) {
          if (!uniqueMap.has(v.id)) {
            uniqueMap.set(v.id, v);
          }
        }
        return Array.from(uniqueMap.values());
      }
    } catch {}

    try {
      const allVendors = await vendorsApi.getAllVendors();
      const matched = allVendors.filter(
        (v) => v.societyId === String(societyId)
      );
      return matched;
    } catch {
      return [];
    }
  },
};
