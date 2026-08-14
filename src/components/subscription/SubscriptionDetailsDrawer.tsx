import React from 'react';
import {
  X,
  CreditCard,
  Calendar,
  Clock,
  Download,
  CheckCircle2,
  AlertTriangle,
  History,
  Store,
} from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { useDownloadInvoice } from '../../hooks/useSubscription';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

export interface SubscriptionDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
}

export const SubscriptionDetailsDrawer: React.FC<SubscriptionDetailsDrawerProps> = ({
  isOpen,
  onClose,
  subscription,
}) => {
  const downloadInvoiceMutation = useDownloadInvoice();

  if (!isOpen || !subscription) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--ink)]/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-2xl bg-[var(--background)] border-l border-[var(--border)] p-6 shadow-2xl overflow-y-auto flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200 text-[var(--foreground)]">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] border border-[var(--gold)] flex items-center justify-center font-serif font-bold text-lg">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-2xl leading-tight">{subscription.storeName}</h3>
                    <Badge
                      variant={
                        subscription.status === 'active'
                          ? 'forest'
                          : subscription.status === 'expiring_soon'
                          ? 'gold'
                          : 'destructive'
                      }
                      className="capitalize"
                    >
                      {subscription.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="font-mono text-xs text-[var(--muted-foreground)] mt-0.5">
                    ID: {subscription.id} • Vendor: {subscription.vendorName}
                  </p>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Overview Meta Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
              <div className="p-4 rounded-md bg-[var(--card)] border border-[var(--border)]">
                <span className="font-mono-meta text-[10px] text-[var(--muted-foreground)]">PLAN TIER</span>
                <div className="mt-1 font-serif text-2xl font-bold text-[var(--foreground)] capitalize">
                  {subscription.plan}
                </div>
                <span className="font-mono text-[10px] text-[var(--gold)] capitalize">
                  {subscription.billingCycle} ({formatCurrency(subscription.price)})
                </span>
              </div>

              <div className="p-4 rounded-md bg-[var(--card)] border border-[var(--border)]">
                <span className="font-mono-meta text-[10px] text-[var(--muted-foreground)]">REMAINING DAYS</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-3xl font-bold text-[var(--gold)]">
                    {subscription.remainingDays}
                  </span>
                  <span className="text-xs font-body text-[var(--muted-foreground)]">days</span>
                </div>
                {subscription.remainingDays <= 7 && (
                  <span className="font-mono text-[9px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" /> Expiring soon
                  </span>
                )}
              </div>

              <div className="p-4 rounded-md bg-[var(--card)] border border-[var(--border)]">
                <span className="font-mono-meta text-[10px] text-[var(--muted-foreground)]">AUTO-RENEWAL</span>
                <div className="mt-1">
                  <Badge variant={subscription.autoRenew ? 'forest' : 'outline'}>
                    {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <span className="font-mono text-[10px] text-[var(--muted-foreground)] block mt-1">
                  Expires {subscription.expiryDate}
                </span>
              </div>
            </div>

            {/* Invoice & Plan Details */}
            <div className="p-4 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-3 font-body text-xs mb-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                <h4 className="font-serif font-bold text-base flex items-center gap-2">
                  <Store className="h-4 w-4 text-[var(--gold)]" />
                  <span>Subscription Status & Billing</span>
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="h-3.5 w-3.5" />}
                  isLoading={downloadInvoiceMutation.isPending}
                  onClick={() => downloadInvoiceMutation.mutate(subscription.id)}
                >
                  Download Invoice
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--gold)]" />
                  <span>Start Date: {formatDate(subscription.startDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--gold)]" />
                  <span>Expiry Date: {formatDate(subscription.expiryDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Payment Status: <strong className="capitalize">{subscription.paymentStatus}</strong></span>
                </div>
              </div>
            </div>

            {/* Subscription History Audit Log */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-lg flex items-center gap-2">
                <History className="h-4 w-4 text-[var(--gold)]" />
                <span>Subscription Lifecycle History</span>
              </h4>

              <div className="rounded-md border border-[var(--border)] overflow-hidden">
                <table className="w-full text-left text-xs font-body">
                  <thead className="bg-[var(--secondary)] font-mono-meta border-b border-[var(--border)] text-[var(--muted-foreground)]">
                    <tr>
                      <th className="p-3">Action Event</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
                    {subscription.history.map((log) => (
                      <tr key={log.id} className="hover:bg-[var(--secondary)]/60 transition">
                        <td className="p-3 font-semibold text-[var(--foreground)]">{log.action}</td>
                        <td className="p-3 font-mono text-[var(--muted-foreground)]">{log.date}</td>
                        <td className="p-3 font-mono font-bold text-[var(--foreground)]">
                          {formatCurrency(log.amount)}
                        </td>
                        <td className="p-3 text-right text-[var(--muted-foreground)] truncate max-w-xs">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-[var(--border)] flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close Drawer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
