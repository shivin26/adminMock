import React, { useState } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '../../hooks/useNotifications';
import { NotificationCategory, ReadStatusFilter } from '../../types/notification';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/feedback/Skeleton';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { NotificationCard } from '../../components/notification/NotificationCard';
import { NotificationFilterBar } from '../../components/notification/NotificationFilterBar';
import { useDebounce } from '../../hooks/useDebounce';

export const NotificationListPage: React.FC = () => {
  // Query Filter States
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<NotificationCategory | 'all'>('all');
  const [readStatus, setReadStatus] = useState<ReadStatusFilter>('all');

  const debouncedSearch = useDebounce(search, 300);

  // TanStack Query Hooks
  const { data, isLoading, isError, refetch } = useNotifications({
    page,
    limit,
    search: debouncedSearch,
    category,
    readStatus,
  });

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteMutation = useDeleteNotification();

  // Filter Reset Handlers
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleCategoryChange = (val: NotificationCategory | 'all') => {
    setCategory(val);
    setPage(1);
  };

  const handleReadStatusChange = (val: ReadStatusFilter) => {
    setReadStatus(val);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('all');
    setReadStatus('all');
    setPage(1);
  };

  if (isError) {
    return (
      <div className="py-12">
        <ErrorState
          title="Failed to load Notifications"
          description="There was a problem retrieving notification alerts. Please check your connection and retry."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[var(--gold)]" />
            <span className="font-mono-meta text-xs text-[var(--gold)] font-semibold">
              REAL-TIME DISPATCH
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Notification Center
            </h1>
            {data && data.unreadCount > 0 && (
              <Badge variant="gold" className="font-mono text-xs">
                {data.unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-sm font-body text-[var(--muted-foreground)] mt-1">
            System broadcasts, vendor onboardings, subscription expirations, and gateway payment alerts.
          </p>
        </div>

        <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refetch()}>
          Sync Feed
        </Button>
      </div>

      {/* Filter Bar */}
      <NotificationFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        category={category}
        onCategoryChange={handleCategoryChange}
        readStatus={readStatus}
        onReadStatusChange={handleReadStatusChange}
        onMarkAllAsRead={() => markAllAsReadMutation.mutate()}
        onClearFilters={handleClearFilters}
        isMarkingAll={markAllAsReadMutation.isPending}
      />

      {/* Notification Cards Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-20 w-full" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No notifications found"
          description="You are all caught up! No active notification alerts match your query."
        />
      ) : (
        <div className="space-y-4">
          {data.items.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}

          {/* Simple Pagination Controls */}
          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 mt-6">
              <span className="font-mono text-xs text-[var(--muted-foreground)]">
                Page {data.meta.page} of {data.meta.totalPages} ({data.meta.totalItems} items)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.meta.hasPrevPage}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.meta.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
