import { BaseApiService } from './base.service';
import { apiClient } from '../client';
import type {
  Vendor,
  VendorQueryParams,
  VendorPayment,
  CreateVendorPayload,
  UpdateVendorPayload,
  BulkVendorActionPayload,
  VendorStatus,
} from '../../types/vendor';
import type { PaginatedResponse } from '../../types/api';
import { vendorsApi } from '../../services/api/vendors.api';

const MOCK_VENDOR_PAYMENTS: Record<string, VendorPayment[]> = {};

class VendorService extends BaseApiService {
  constructor() {
    super(apiClient, '/vendors');
  }

  public async getVendors(params?: VendorQueryParams): Promise<PaginatedResponse<Vendor>> {
    try {
      const liveVendors = await vendorsApi.getAllVendors({
        search: params?.search,
        status: params?.status === 'all' ? undefined : params?.status,
      });

      let list: Vendor[] = liveVendors.map((v) => ({
        id: String(v.id),
        storeName: v.storeName,
        ownerName: v.ownerName,
        category: v.category || 'General Merchant',
        email: v.email,
        phone: v.phone,
        address: v.address || 'Local Enclave Market',
        societyName: v.societyName || 'Unassigned Society',
        gstin: v.gstin || 'N/A',
        businessType: 'Merchant Store',
        subscriptionTier: (v.subscriptionTier as any) || 'pro',
        subscriptionRenewalDate: v.subscriptionRenewalDate || '2026-12-31',
        status: (v.status === 'suspended' ? 'suspended' : v.status === 'pending' ? 'pending' : 'active') as any,
        totalEarnings: v.totalEarnings || 0,
        avatarUrl: v.avatarUrl || '',
        createdAt: v.createdAt || new Date().toISOString(),
        updatedAt: v.updatedAt || new Date().toISOString(),
      }));

      if (params?.status && params.status !== 'all') {
        list = list.filter((v) => v.status === params.status);
      }

      if (params?.tier && params.tier !== 'all') {
        list = list.filter((v) => v.subscriptionTier === params.tier);
      }

      if (params?.search) {
        const query = params.search.toLowerCase();
        list = list.filter(
          (v) =>
            v.storeName.toLowerCase().includes(query) ||
            v.ownerName.toLowerCase().includes(query) ||
            v.phone.toLowerCase().includes(query) ||
            v.societyName.toLowerCase().includes(query)
        );
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

  public async getVendorById(id: string): Promise<Vendor> {
    const list = await vendorsApi.getAllVendors();
    const found = list.find((v) => String(v.id) === String(id));
    if (found) {
      return {
        id: String(found.id),
        storeName: found.storeName,
        ownerName: found.ownerName,
        category: found.category || 'General Merchant',
        email: found.email,
        phone: found.phone,
        address: found.address || 'Local Enclave Market',
        societyName: found.societyName || 'Unassigned Society',
        gstin: found.gstin || 'N/A',
        businessType: 'Merchant Store',
        subscriptionTier: (found.subscriptionTier as any) || 'pro',
        subscriptionRenewalDate: found.subscriptionRenewalDate || '2026-12-31',
        status: (found.status === 'suspended' ? 'suspended' : found.status === 'pending' ? 'pending' : 'active') as any,
        totalEarnings: found.totalEarnings || 0,
        avatarUrl: found.avatarUrl || '',
        createdAt: found.createdAt || new Date().toISOString(),
        updatedAt: found.updatedAt || new Date().toISOString(),
      };
    }
    throw new Error('Vendor not found');
  }

  public async getVendorPayments(id: string): Promise<VendorPayment[]> {
    return MOCK_VENDOR_PAYMENTS[id] || [];
  }

  public async createVendor(payload: CreateVendorPayload): Promise<Vendor> {
    const newVendor: Vendor = {
      id: `vnd_${Date.now()}`,
      ...payload,
      totalEarnings: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newVendor;
  }

  public async updateVendor(id: string, payload: UpdateVendorPayload): Promise<Vendor> {
    return this.getVendorById(id);
  }

  public async deleteVendor(id: string): Promise<void> {
    return;
  }

  public async toggleVendorStatus(id: string, status: VendorStatus): Promise<Vendor> {
    await vendorsApi.toggleVendorStatus(id, status);
    return this.getVendorById(id);
  }

  public async bulkVendorAction(payload: BulkVendorActionPayload): Promise<void> {
    return;
  }
}

export const vendorService = new VendorService();
