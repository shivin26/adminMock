export type NotificationCategory =
  | 'vendor_registration'
  | 'subscription_expiry'
  | 'payment_success'
  | 'payment_failure'
  | 'announcement';

export type ReadStatusFilter = 'all' | 'unread' | 'read';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: NotificationCategory | 'all';
  readStatus?: ReadStatusFilter;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface PaginatedNotifications {
  items: NotificationItem[];
  unreadCount: number;
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
