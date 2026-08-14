import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../api/services/notification.service';
import { NotificationQueryParams, PaginatedNotifications } from '../types/notification';
import { toast } from '../components/feedback/ToastSystem';

export const NOTIFICATIONS_QUERY_KEY = 'notifications';

export function useNotifications(params?: NotificationQueryParams) {
  return useQuery<PaginatedNotifications>({
    queryKey: [NOTIFICATIONS_QUERY_KEY, params],
    queryFn: () => notificationService.getNotifications(params),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Auto-refetch every 60s
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      const previousData = queryClient.getQueryData<PaginatedNotifications>([NOTIFICATIONS_QUERY_KEY]);

      if (previousData) {
        queryClient.setQueriesData<PaginatedNotifications>(
          { queryKey: [NOTIFICATIONS_QUERY_KEY] },
          (old) => {
            if (!old) return old;
            const updatedItems = old.items.map((n) => (n.id === id ? { ...n, isRead: true } : n));
            const newUnread = Math.max(0, old.unreadCount - 1);
            return { ...old, items: updatedItems, unreadCount: newUnread };
          }
        );
      }

      return { previousData };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: [NOTIFICATIONS_QUERY_KEY] }, context.previousData);
      }
      toast.error('Failed to mark read', error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      const previousData = queryClient.getQueryData<PaginatedNotifications>([NOTIFICATIONS_QUERY_KEY]);

      if (previousData) {
        queryClient.setQueriesData<PaginatedNotifications>(
          { queryKey: [NOTIFICATIONS_QUERY_KEY] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.map((n) => ({ ...n, isRead: true })),
              unreadCount: 0,
            };
          }
        );
      }

      return { previousData };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: [NOTIFICATIONS_QUERY_KEY] }, context.previousData);
      }
      toast.error('Mark all read failed', error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
    },
    onSuccess: () => {
      toast.success('All Notifications Read', 'Marked all unread notifications as read.');
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      const previousData = queryClient.getQueryData<PaginatedNotifications>([NOTIFICATIONS_QUERY_KEY]);

      if (previousData) {
        queryClient.setQueriesData<PaginatedNotifications>(
          { queryKey: [NOTIFICATIONS_QUERY_KEY] },
          (old) => {
            if (!old) return old;
            const target = old.items.find((n) => n.id === id);
            const isTargetUnread = target ? !target.isRead : false;
            return {
              ...old,
              items: old.items.filter((n) => n.id !== id),
              unreadCount: isTargetUnread ? Math.max(0, old.unreadCount - 1) : old.unreadCount,
            };
          }
        );
      }

      return { previousData };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: [NOTIFICATIONS_QUERY_KEY] }, context.previousData);
      }
      toast.error('Deletion failed', error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
    },
    onSuccess: () => {
      toast.success('Notification Removed', 'Notification deleted successfully.');
    },
  });
}
