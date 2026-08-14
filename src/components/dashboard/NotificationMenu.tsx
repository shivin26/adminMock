import React, { useState } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../../hooks/useNotifications';
import { Button } from '../ui/Button';

export const NotificationMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const notifications = data?.items || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative text-[var(--foreground)]"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--gold)] text-[9px] font-mono font-bold text-black ring-2 ring-[var(--background)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-xl z-50 text-[var(--foreground)] animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-bold text-sm">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="font-mono text-[10px] bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--gold)]/40 px-1.5 py-0.5 rounded font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="font-mono text-[10px] text-[var(--gold)] hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto py-2 space-y-2 divide-y divide-[var(--border)]">
              {notifications.length === 0 ? (
                <p className="text-center text-xs text-[var(--muted-foreground)] py-6">
                  No unread notifications
                </p>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="pt-2 text-xs font-body space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className={`font-semibold text-sm ${!n.isRead ? 'text-[var(--gold)]' : ''}`}>
                        {n.title}
                      </h5>
                      {!n.isRead && (
                        <button
                          onClick={() => markAsReadMutation.mutate(n.id)}
                          className="text-[var(--muted-foreground)] hover:text-emerald-600 cursor-pointer p-0.5"
                          title="Mark read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[var(--muted-foreground)] line-clamp-2 text-[11px]">{n.message}</p>
                    <span className="font-mono text-[9px] text-[var(--muted-foreground)] block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex justify-center">
              <Link
                to="/dashboard/security"
                onClick={() => setIsOpen(false)}
                className="font-mono text-xs text-[var(--gold)] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View Notification Center</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
