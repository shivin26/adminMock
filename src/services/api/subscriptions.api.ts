import { axiosInstance } from './axiosInstance';
import type {
  Subscription,
  SubscriptionStats,
  SubscriptionRenewalRequest,
  Invoice,
} from '../../types/subscription.types';
import { vendorsApi } from './vendors.api';

export interface SubscriptionListParams {
  search?: string;
  tier?: string;
  status?: string;
}

const INITIAL_SUBSCRIPTIONS_MOCK: Subscription[] = [
  {
    id: 'sub-90',
    vendorId: '90',
    storeName: 'Apna Store',
    ownerName: 'Apna Store Grocery',
    societyName: 'Manglam Aananda',
    tier: 'pro',
    price: 2999,
    startDate: '2026-08-07',
    renewalDate: '2026-12-31',
    daysRemaining: 141,
    status: 'active',
    payments: [],
  },
  {
    id: 'sub-89',
    vendorId: '89',
    storeName: 'GS Cafe',
    ownerName: 'GS Cafe',
    societyName: 'Manglam Aananda',
    tier: 'pro',
    price: 2999,
    startDate: '2026-08-07',
    renewalDate: '2026-12-31',
    daysRemaining: 141,
    status: 'active',
    payments: [],
  },
  {
    id: 'sub-79',
    vendorId: '79',
    storeName: 'FreshMart Grocery',
    ownerName: 'Rajesh Sharma',
    societyName: 'Anupam apartment',
    tier: 'pro',
    price: 2999,
    startDate: '2026-08-07',
    renewalDate: '2026-12-31',
    daysRemaining: 141,
    status: 'active',
    payments: [],
  },
  {
    id: 'sub-p1',
    vendorId: 'v-105',
    storeName: 'QuickMart Convenience Store',
    ownerName: 'Vikram Singh',
    societyName: 'Manglam Aananda',
    tier: 'pro',
    price: 2999,
    startDate: '2026-08-10',
    renewalDate: '2026-12-31',
    daysRemaining: 141,
    status: 'pending',
    vendorStatus: 'pending',
    payments: [],
  },
  {
    id: 'sub-p2',
    vendorId: 'v-106',
    storeName: 'Green Leaf Organic Vegetables',
    ownerName: 'Ananya Sharma',
    societyName: 'Anupam Society',
    tier: 'enterprise',
    price: 9999,
    startDate: '2026-08-11',
    renewalDate: '2026-12-31',
    daysRemaining: 141,
    status: 'pending',
    vendorStatus: 'pending',
    payments: [],
  },
];

const mapSubscriptionDTOToDomain = (raw: any): Subscription => {
  const sId = raw.id || raw.subscription_id || `sub-${raw.vendor_id || '1'}`;
  const renewal = raw.renewal_date || raw.renewalDate || '2026-12-31';
  const now = new Date();
  const diffTime = new Date(renewal).getTime() - now.getTime();
  const daysRemaining = Number(
    raw.days_remaining ?? raw.daysRemaining ?? Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  );
  const rawTier = String(raw.tier || raw.subscription_tier || raw.plan_tier || 'pro').toLowerCase();
  const tier = (rawTier === 'subscribed' ? 'pro' : rawTier) as any;
  const rawStatus = String(raw.vendor_status || raw.vendorStatus || raw.status || '').toLowerCase();
  const isBlocked = rawStatus === 'suspended' || rawStatus === 'blocked';
  const isPending = rawStatus === 'pending';

  return {
    id: String(sId),
    vendorId: String(raw.vendor_id || raw.vendorId || '1'),
    storeName: raw.store_name || raw.storeName || 'Vendor Store',
    ownerName: raw.owner_name || raw.ownerName || raw.vendor_name || 'Vendor Owner',
    societyName: raw.society_name || raw.societyName || 'Greenwood Residency',
    tier,
    price: Number(raw.price || raw.amount || (tier === 'enterprise' ? 9999 : 2999)),
    startDate: raw.start_date || raw.startDate || raw.created_at || '2026-01-01',
    renewalDate: renewal,
    daysRemaining,
    status: isBlocked ? 'suspended' : isPending ? 'pending' : (daysRemaining < 15 ? 'expiring_soon' : 'active'),
    isVendorBlocked: isBlocked,
    vendorStatus: rawStatus || 'active',
    payments: raw.payments || [],
  };
};

export const subscriptionsApi = {
  /**
   * GET /api/subscriptions or /api/admin/subscriptions
   */
  getSubscriptions: async (params?: SubscriptionListParams): Promise<Subscription[]> => {
    let rawData: any = null;

    try {
      const response = await axiosInstance.get<any>('/admin/subscriptions', { params });
      rawData = response.data?.data || response.data?.subscriptions || response.data;
    } catch {
      try {
        const response = await axiosInstance.get<any>('/subscriptions', { params });
        rawData = response.data?.data || response.data?.subscriptions || response.data;
      } catch {}
    }

    if (Array.isArray(rawData)) {
      return rawData.map(mapSubscriptionDTOToDomain).filter((sub) => {
        if (params?.search) {
          const query = params.search.toLowerCase();
          return (
            sub.storeName.toLowerCase().includes(query) ||
            sub.ownerName.toLowerCase().includes(query) ||
            sub.societyName.toLowerCase().includes(query)
          );
        }
        if (params?.tier) {
          return sub.tier === params.tier;
        }
        return true;
      });
    }

    return [];
  },

  /**
   * POST /api/admin/subscriptions/:id/renew
   */
  renewSubscription: async (
    id: string | number,
    payload: SubscriptionRenewalRequest
  ): Promise<{ message: string; newRenewalDate: string }> => {
    try {
      const response = await axiosInstance.post<{ message: string; newRenewalDate: string }>(
        `/admin/subscriptions/${id}/renew`,
        payload
      );
      return response.data;
    } catch {
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + payload.durationMonths);
      return {
        message: 'Subscription renewed successfully',
        newRenewalDate: nextDate.toISOString().split('T')[0],
      };
    }
  },

  /**
   * GET /api/admin/subscriptions/:id/invoice
   */
  getInvoice: async (id: string | number): Promise<Invoice> => {
    try {
      const response = await axiosInstance.get<Invoice>(`/admin/subscriptions/${id}/invoice`);
      return response.data;
    } catch {
      return {
        invoiceId: `INV-2026-${id}`,
        vendorId: String(id),
        storeName: `Vendor #${id} Store`,
        gstin: '07AAAAA0000A1Z5',
        amount: 2999,
        taxAmount: 539.82,
        issueDate: new Date().toISOString().split('T')[0],
      };
    }
  },

  /**
   * GET /api/admin/subscriptions/stats
   */
  getStats: async (): Promise<SubscriptionStats> => {
    try {
      const response = await axiosInstance.get<any>('/subscriptions/stats');
      const raw = response.data?.data || response.data;
      if (raw && (raw.mrr !== undefined || raw.totalActiveSubscriptions !== undefined)) {
        return {
          totalActiveSubscriptions: Number(raw.totalActiveSubscriptions ?? raw.active_subscriptions ?? 0),
          mrr: Number(raw.mrr ?? 0),
          upcomingRenewalsCount: Number(raw.upcomingRenewalsCount ?? raw.expiring_soon_count ?? 0),
          tierBreakdown: raw.tierBreakdown || raw.tier_breakdown || {
            free: 0,
            pro: 0,
            enterprise: 0,
          },
        };
      }
    } catch {
      try {
        const response = await axiosInstance.get<any>('/admin/subscriptions/stats');
        const raw = response.data?.data || response.data;
        if (raw) return raw;
      } catch {}
    }

    try {
      const vendors = await vendorsApi.getAllVendors();
      const activeCount = vendors.filter((v) => v.status === 'active').length;
      return {
        totalActiveSubscriptions: activeCount,
        mrr: activeCount * 2999,
        upcomingRenewalsCount: 0,
        tierBreakdown: {
          free: 0,
          pro: activeCount,
          enterprise: 0,
        },
      };
    } catch {}

    return {
      totalActiveSubscriptions: 0,
      mrr: 0,
      upcomingRenewalsCount: 0,
      tierBreakdown: {
        free: 0,
        pro: 0,
        enterprise: 0,
      },
    };
  },
};
