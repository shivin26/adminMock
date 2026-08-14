import { BaseApiService } from './base.service';
import { apiClient } from '../client';
import {
  NotificationItem,
  NotificationQueryParams,
  PaginatedNotifications,
} from '../../types/notification';
import { env } from '../../env';

// Mock Notifications Dataset
let MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'New Vendor Registration',
    message: 'Artisan Bakery Co. registered in Greenwood Heights Society.',
    category: 'vendor_registration',
    isRead: false,
    linkUrl: '/dashboard/users',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
  },
  {
    id: 'notif_2',
    title: 'Subscription Expiring Soon',
    message: 'GreenThumb Organics Pro Plan expires in 6 days.',
    category: 'subscription_expiry',
    isRead: false,
    linkUrl: '/dashboard/subscriptions',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
  },
  {
    id: 'notif_3',
    title: 'Payment Processed',
    message: 'Successfully processed $145.50 via Stripe Direct for TXN-9001.',
    category: 'payment_success',
    isRead: true,
    linkUrl: '/dashboard/payments',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
  },
  {
    id: 'notif_4',
    title: 'Payment Gateway Failure',
    message: 'Payment attempt TXN-9008 failed for Botanical Bloom Co.',
    category: 'payment_failure',
    isRead: false,
    linkUrl: '/dashboard/payments',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
  },
  {
    id: 'notif_5',
    title: 'Scheduled System Maintenance',
    message: 'Platform maintenance scheduled for Sunday 02:00 AM UTC.',
    category: 'announcement',
    isRead: true,
    linkUrl: '/dashboard/settings',
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 1 day ago
  },
];

class NotificationService extends BaseApiService {
  constructor() {
    super(apiClient, '/notifications');
  }

  public async getNotifications(params?: NotificationQueryParams): Promise<PaginatedNotifications> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 300));
      let list = [...MOCK_NOTIFICATIONS];

      if (params?.search) {
        const query = params.search.toLowerCase();
        list = list.filter(
          (n) => n.title.toLowerCase().includes(query) || n.message.toLowerCase().includes(query)
        );
      }

      if (params?.category && params.category !== 'all') {
        list = list.filter((n) => n.category === params.category);
      }

      if (params?.readStatus && params.readStatus !== 'all') {
        const wantRead = params.readStatus === 'read';
        list = list.filter((n) => n.isRead === wantRead);
      }

      const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const startIndex = (page - 1) * limit;
      const paginatedItems = list.slice(startIndex, startIndex + limit);

      return {
        items: paginatedItems,
        unreadCount,
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

    return this.get<PaginatedNotifications>('', { params });
  }

  public async markAsRead(id: string): Promise<NotificationItem> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 200));
      let updated: NotificationItem | null = null;
      MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.map((n) => {
        if (n.id === id) {
          updated = { ...n, isRead: true };
          return updated;
        }
        return n;
      });
      if (!updated) throw new Error('Notification not found');
      return updated;
    }
    return this.patch<NotificationItem, { isRead: boolean }>(`/${id}/read`, { isRead: true });
  }

  public async markAllAsRead(): Promise<void> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 300));
      MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.map((n) => ({ ...n, isRead: true }));
      return;
    }
    return this.patch<void, {}>('/read-all', {});
  }

  public async deleteNotification(id: string): Promise<void> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 200));
      MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.filter((n) => n.id !== id);
      return;
    }
    return this.delete<void>(`/${id}`);
  }
}

export const notificationService = new NotificationService();
