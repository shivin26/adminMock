import React from 'react';
import {
  Store,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Bell,
  Check,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { NotificationItem, NotificationCategory } from '../../types/notification';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatRelativeTime } from '../../utils/formatters';

export interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const getCategoryMeta = (cat: NotificationCategory) => {
    switch (cat) {
      case 'vendor_registration':
        return {
          label: 'Vendor Onboarding',
          badgeVariant: 'forest' as const,
          icon: <Store className="h-4 w-4 text-[var(--primary)]" />,
        };
      case 'subscription_expiry':
        return {
          label: 'Subscription Alert',
          badgeVariant: 'gold' as const,
          icon: <AlertTriangle className="h-4 w-4 text-[var(--gold)]" />,
        };
      case 'payment_success':
        return {
          label: 'Payment Success',
          badgeVariant: 'forest' as const,
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
        };
      case 'payment_failure':
        return {
          label: 'Payment Failed',
          badgeVariant: 'destructive' as const,
          icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        };
      case 'announcement':
      default:
        return {
          label: 'Announcement',
          badgeVariant: 'secondary' as const,
          icon: <Bell className="h-4 w-4 text-[var(--muted-foreground)]" />,
        };
    }
  };

  const meta = getCategoryMeta(notification.category);

  return (
    <div
      className={`p-4 rounded-lg border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-body select-none ${
        notification.isRead
          ? 'bg-[var(--card)] border-[var(--border)] opacity-85 hover:opacity-100'
          : 'bg-[var(--card)] border-[var(--gold)] shadow-xs ring-1 ring-[var(--gold)]/20'
      }`}
    >
      <div className="flex items-start gap-3.5 flex-1">
        {/* Category Icon */}
        <div className="h-9 w-9 rounded-md bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5">
          {meta.icon}
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {!notification.isRead && (
              <span className="h-2 w-2 rounded-full bg-[var(--gold)] shrink-0 animate-pulse" />
            )}
            <h4 className="font-serif font-bold text-base text-[var(--foreground)] leading-snug">
              {notification.title}
            </h4>
            <Badge variant={meta.badgeVariant} className="text-[10px]">
              {meta.label}
            </Badge>
          </div>

          <p className="text-xs text-[var(--muted-foreground)] leading-normal">
            {notification.message}
          </p>

          <span className="font-mono text-[10px] text-[var(--muted-foreground)] block pt-0.5">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
      </div>

      {/* Action Trigger Buttons */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {notification.linkUrl && (
          <Link to={notification.linkUrl}>
            <Button variant="ghost" size="sm" leftIcon={<ExternalLink className="h-3.5 w-3.5" />}>
              View Details
            </Button>
          </Link>
        )}

        {!notification.isRead && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Check className="h-3.5 w-3.5 text-emerald-600" />}
            onClick={() => onMarkAsRead(notification.id)}
          >
            Mark Read
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="text-[var(--muted-foreground)] hover:text-red-600"
          onClick={() => onDelete(notification.id)}
          aria-label="Delete notification"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
