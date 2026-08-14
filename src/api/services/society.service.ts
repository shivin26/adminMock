import { BaseApiService } from './base.service';
import { apiClient } from '../client';
import {
  Society,
  SocietyQueryParams,
  SocietyVendor,
  CreateSocietyPayload,
  UpdateSocietyPayload,
  BulkSocietyActionPayload,
} from '../../types/society';
import { PaginatedResponse } from '../../types/api';
import { societiesApi } from '../../services/api/societies.api';

const MOCK_SOCIETY_VENDORS: Record<string, SocietyVendor[]> = {
  soc_1: [
    { id: 'v_101', storeName: 'Artisan Bakery Co.', ownerName: 'Claire Vance', category: 'Bakery & Food', email: 'claire@artisanbakery.com', phone: '+1 (555) 234-5678', status: 'active', joinedDate: '2026-02-01' },
    { id: 'v_102', storeName: 'GreenThumb Organics', ownerName: 'David Zhang', category: 'Grocery', email: 'david@greenthumb.org', phone: '+1 (555) 345-6789', status: 'active', joinedDate: '2026-03-15' },
  ],
  soc_2: [
    { id: 'v_103', storeName: 'Metro Pottery Works', ownerName: 'Marcus Bell', category: 'Home & Living', email: 'marcus@metropottery.com', phone: '+1 (555) 456-7890', status: 'active', joinedDate: '2026-04-10' },
  ],
};

class SocietyService extends BaseApiService {
  constructor() {
    super(apiClient, '/societies');
  }

  public async getSocieties(params?: SocietyQueryParams): Promise<PaginatedResponse<Society>> {
    try {
      const societiesFromApi = await societiesApi.getSocieties(params?.search);
      let list: Society[] = societiesFromApi.map((s) => ({
        id: String(s.id),
        name: s.name,
        code: s.code,
        city: s.city,
        state: s.state,
        postalCode: s.postalCode,
        address: s.address,
        totalVendorsCount: s.totalVendorsCount,
        status: (s.status === 'suspended' ? 'inactive' : s.status) as any,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));

      if (params?.status && params.status !== 'all') {
        list = list.filter((s) => s.status === params.status);
      }

      if (params?.city) {
        list = list.filter((s) => s.city.toLowerCase() === params.city?.toLowerCase());
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const startIndex = (page - 1) * limit;
      const paginatedItems = list.slice(startIndex, startIndex + limit);

      return {
        items: paginatedItems,
        meta: {
          page,
          limit,
          totalItems: list.length,
          totalPages: Math.ceil(list.length / limit) || 1,
          hasNextPage: page * limit < list.length,
          hasPrevPage: page > 1,
        },
      };
    } catch {
      return {
        items: [],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  public async getSocietyById(id: string): Promise<Society> {
    const list = await societiesApi.getSocieties();
    const found = list.find((s) => String(s.id) === String(id));
    if (found) {
      return {
        id: String(found.id),
        name: found.name,
        code: found.code,
        city: found.city,
        state: found.state,
        postalCode: found.postalCode,
        address: found.address,
        totalVendorsCount: found.totalVendorsCount,
        status: (found.status === 'suspended' ? 'inactive' : found.status) as any,
        createdAt: found.createdAt,
        updatedAt: found.updatedAt,
      };
    }
    throw new Error('Society not found');
  }

  public async getSocietyVendors(id: string): Promise<SocietyVendor[]> {
    return MOCK_SOCIETY_VENDORS[id] || [
      { id: `v_mock_${id}`, storeName: 'Sample Local Vendor', ownerName: 'John Doe', category: 'General Store', email: 'vendor@example.com', phone: '+1 555-0000', status: 'active', joinedDate: '2026-05-01' }
    ];
  }

  public async createSociety(payload: CreateSocietyPayload): Promise<Society> {
    const res = await societiesApi.createSociety({
      society_name: payload.name,
      location: `${payload.address}, ${payload.city}, ${payload.state}`,
    });
    return {
      id: String(res.id || res.society_id || Date.now()),
      name: payload.name,
      code: payload.code || `SOC-${res.society_id || Date.now()}`,
      city: payload.city,
      state: payload.state,
      postalCode: payload.postalCode,
      address: payload.address,
      totalVendorsCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  public async updateSociety(id: string, payload: UpdateSocietyPayload): Promise<Society> {
    const updated = await societiesApi.updateSociety(id, {
      society_name: payload.name || '',
      location: `${payload.address || ''}, ${payload.city || ''}, ${payload.state || ''}`,
    });
    return {
      id: String(updated.id),
      name: updated.name,
      code: updated.code,
      city: updated.city,
      state: updated.state,
      postalCode: updated.postalCode,
      address: updated.address,
      totalVendorsCount: updated.totalVendorsCount,
      status: (updated.status === 'suspended' ? 'inactive' : updated.status) as any,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  public async deleteSociety(id: string): Promise<void> {
    return;
  }

  public async toggleSocietyStatus(id: string, status: 'active' | 'inactive'): Promise<Society> {
    const targetStatus = status === 'inactive' ? 'suspended' : 'active';
    const updated = await societiesApi.toggleSocietyStatus(id, targetStatus as any);
    return {
      id: String(updated.id),
      name: updated.name,
      code: updated.code,
      city: updated.city,
      state: updated.state,
      postalCode: updated.postalCode,
      address: updated.address,
      totalVendorsCount: updated.totalVendorsCount,
      status: (updated.status === 'suspended' ? 'inactive' : updated.status) as any,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  public async bulkSocietyAction(payload: BulkSocietyActionPayload): Promise<void> {
    return;
  }
}

export const societyService = new SocietyService();

