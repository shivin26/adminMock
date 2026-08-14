import { BaseApiService } from './base.service';
import { apiClient } from '../client';
import {
  AuditLogEntry,
  AuditQueryParams,
  AuditExportPayload,
} from '../../types/audit';
import { PaginatedResponse } from '../../types/api';
import { env } from '../../env';

// Mock Audit Log Entries
let MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-5001',
    adminName: 'Alex Vance',
    adminEmail: 'alex.vance@digilocal.com',
    action: 'VENDOR_SUSPENDED',
    timestamp: '2026-07-28T14:30:00Z',
    ipAddress: '192.168.1.104',
    browser: 'Chrome 126.0 (macOS)',
    affectedResource: 'Vendor: Metro Pottery Works',
    resourceId: 'vnd_3',
    previousState: { status: 'active', reason: undefined },
    newState: { status: 'suspended', reason: 'Failed tax audit verification' },
  },
  {
    id: 'AUD-5002',
    adminName: 'Sarah Jenkins',
    adminEmail: 'sarah.j@digilocal.com',
    action: 'REFUND_ISSUED',
    timestamp: '2026-07-27T10:15:00Z',
    ipAddress: '10.0.4.12',
    browser: 'Firefox 127.0 (Linux)',
    affectedResource: 'Payment: TXN-9003',
    resourceId: 'TXN-9003',
    previousState: { status: 'success', refundAmount: 0 },
    newState: { status: 'refunded', refundAmount: 220.0, reason: 'Damaged pottery return' },
  },
  {
    id: 'AUD-5003',
    adminName: 'Alex Vance',
    adminEmail: 'alex.vance@digilocal.com',
    action: 'SOCIETY_CREATED',
    timestamp: '2026-07-25T11:20:00Z',
    ipAddress: '192.168.1.104',
    browser: 'Chrome 126.0 (macOS)',
    affectedResource: 'Society: Harbor View Gated Colony',
    resourceId: 'soc_4',
    previousState: undefined,
    newState: { name: 'Harbor View Gated Colony', code: 'SOC-HVR-04', city: 'San Jose' },
  },
  {
    id: 'AUD-5004',
    adminName: 'Marcus Bell',
    adminEmail: 'marcus@digilocal.com',
    action: 'SUBSCRIPTION_RENEWED',
    timestamp: '2026-07-20T09:00:00Z',
    ipAddress: '172.16.0.45',
    browser: 'Safari 17.4 (iOS)',
    affectedResource: 'Subscription: SUB-801',
    resourceId: 'SUB-801',
    previousState: { plan: 'pro', remainingDays: 2 },
    newState: { plan: 'enterprise', remainingDays: 365 },
  },
  {
    id: 'AUD-5005',
    adminName: 'Alex Vance',
    adminEmail: 'alex.vance@digilocal.com',
    action: 'SETTINGS_UPDATED',
    timestamp: '2026-07-15T16:00:00Z',
    ipAddress: '192.168.1.104',
    browser: 'Chrome 126.0 (macOS)',
    affectedResource: 'System Settings: Tax & GST',
    resourceId: 'settings_tax',
    previousState: { defaultTaxRate: 15.0 },
    newState: { defaultTaxRate: 18.0 },
  },
];

class AuditService extends BaseApiService {
  constructor() {
    super(apiClient, '/audit-logs');
  }

  public async getAuditLogs(params?: AuditQueryParams): Promise<PaginatedResponse<AuditLogEntry>> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 400));
      let list = [...MOCK_AUDIT_LOGS];

      if (params?.search) {
        const query = params.search.toLowerCase();
        list = list.filter(
          (a) =>
            a.adminName.toLowerCase().includes(query) ||
            a.action.toLowerCase().includes(query) ||
            a.affectedResource.toLowerCase().includes(query) ||
            a.ipAddress.toLowerCase().includes(query)
        );
      }

      if (params?.action && params.action !== 'all') {
        list = list.filter((a) => a.action === params.action);
      }

      if (params?.adminName) {
        list = list.filter((a) => a.adminName.toLowerCase() === params.adminName?.toLowerCase());
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
    }

    return this.getPaginated<AuditLogEntry>('', params);
  }

  public async getAuditLogById(id: string): Promise<AuditLogEntry> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 200));
      const found = MOCK_AUDIT_LOGS.find((a) => a.id === id);
      if (!found) throw new Error('Audit entry not found');
      return found;
    }
    return this.get<AuditLogEntry>(`/${id}`);
  }

  public async exportAuditLog(payload: AuditExportPayload): Promise<{ downloadUrl: string; filename: string }> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 500));
      const filename = `audit_log_${Date.now()}.${payload.format}`;
      return {
        downloadUrl: `/downloads/${filename}`,
        filename,
      };
    }
    return this.post<{ downloadUrl: string; filename: string }, AuditExportPayload>('/export', payload);
  }
}

export const auditService = new AuditService();
