import { BaseApiService } from './base.service';
import { apiClient } from '../client';
import {
  Subscription,
  SubscriptionQueryParams,
  RenewSubscriptionPayload,
  CancelSubscriptionPayload,
  SubscriptionAnalyticsData,
} from '../../types/subscription';
import { PaginatedResponse } from '../../types/api';
import { subscriptionsApi } from '../../services/api/subscriptions.api';

class SubscriptionService extends BaseApiService {
  constructor() {
    super(apiClient, '/subscriptions');
  }

  public async getSubscriptions(params?: SubscriptionQueryParams): Promise<PaginatedResponse<Subscription>> {
    try {
      const liveSubs = await subscriptionsApi.getSubscriptions({
        search: params?.search,
        tier: params?.plan === 'all' ? undefined : params?.plan,
        status: params?.status === 'all' ? undefined : params?.status,
      });

      let list: Subscription[] = liveSubs.map((s) => ({
        id: s.id,
        vendorId: s.vendorId,
        vendorName: s.ownerName,
        storeName: s.storeName,
        plan: (s.tier as any) || 'pro',
        billingCycle: 'annual',
        price: s.price || 2999,
        startDate: s.startDate,
        expiryDate: s.renewalDate,
        remainingDays: s.daysRemaining,
        status: (s.status === 'suspended' ? 'cancelled' : s.status === 'expiring_soon' ? 'expiring_soon' : s.daysRemaining <= 0 ? 'overdue' : 'active') as any,
        paymentStatus: 'paid',
        autoRenew: true,
        history: [],
        createdAt: s.startDate || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      if (params?.status && params.status !== 'all') {
        list = list.filter((s) => s.status === params.status);
      }

      if (params?.plan && params.plan !== 'all') {
        list = list.filter((s) => s.plan === params.plan);
      }

      if (params?.search) {
        const query = params.search.toLowerCase();
        list = list.filter(
          (s) =>
            s.storeName.toLowerCase().includes(query) ||
            s.vendorName.toLowerCase().includes(query) ||
            s.id.toLowerCase().includes(query)
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

  public async getSubscriptionById(id: string): Promise<Subscription> {
    const list = await subscriptionsApi.getSubscriptions();
    const found = list.find((s) => s.id === id || s.vendorId === id);
    if (found) {
      return {
        id: found.id,
        vendorId: found.vendorId,
        vendorName: found.ownerName,
        storeName: found.storeName,
        plan: (found.tier as any) || 'pro',
        billingCycle: 'annual',
        price: found.price || 2999,
        startDate: found.startDate,
        expiryDate: found.renewalDate,
        remainingDays: found.daysRemaining,
        status: (found.status === 'suspended' ? 'cancelled' : found.status === 'expiring_soon' ? 'expiring_soon' : found.daysRemaining <= 0 ? 'overdue' : 'active') as any,
        paymentStatus: 'paid',
        autoRenew: true,
        history: [],
        createdAt: found.startDate || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    throw new Error('Subscription not found');
  }

  public async getSubscriptionAnalytics(): Promise<SubscriptionAnalyticsData> {
    const list = await subscriptionsApi.getSubscriptions();
    const activeCount = list.filter((s) => s.status === 'active').length;
    const expiringSoonCount = list.filter((s) => s.daysRemaining <= 15 && s.daysRemaining > 0).length;
    const totalMrr = list.reduce((acc, s) => acc + (s.price || 2999), 0);

    const proCount = list.filter((s) => s.tier === 'pro').length;
    const enterpriseCount = list.filter((s) => s.tier === 'enterprise').length;
    const freeCount = list.filter((s) => s.tier === 'free').length;

    return {
      mrr: totalMrr,
      arr: totalMrr * 12,
      activeSubscriptionsCount: activeCount,
      expiringSoonCount: expiringSoonCount,
      mrrGrowthPercentage: 18.5,
      tierDistribution: [
        { name: 'Enterprise Tier', count: enterpriseCount, mrr: enterpriseCount * 9999, color: '#224636' },
        { name: 'Pro Merchant', count: proCount, mrr: proCount * 2999, color: '#C8A878' },
        { name: 'Free Starter', count: freeCount, mrr: 0, color: '#827973' },
      ],
    } as any;
  }

  public async renewSubscription(payload: RenewSubscriptionPayload): Promise<Subscription> {
    await subscriptionsApi.renewSubscription(payload.subscriptionId, {
      plan_tier: payload.plan,
      billing_cycle: payload.billingCycle,
    });
    return this.getSubscriptionById(payload.subscriptionId);
  }

  public async cancelSubscription(payload: CancelSubscriptionPayload): Promise<Subscription> {
    return this.getSubscriptionById(payload.subscriptionId);
  }

  public async downloadInvoice(id: string): Promise<string> {
    return `/invoices/${id}.pdf`;
  }
}

export const subscriptionService = new SubscriptionService();
