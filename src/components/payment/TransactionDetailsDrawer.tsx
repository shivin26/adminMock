import React from 'react';
import {
  X,
  CreditCard,
  Download,
  FileCheck,
  RefreshCw,
  User,
  Mail,
  Store,
  DollarSign,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { PaymentTransaction } from '../../types/payment';
import { useDownloadReceipt, useDownloadInvoice } from '../../hooks/usePayment';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

export interface TransactionDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: PaymentTransaction | null;
  onOpenRefundModal: (transaction: PaymentTransaction) => void;
}

export const TransactionDetailsDrawer: React.FC<TransactionDetailsDrawerProps> = ({
  isOpen,
  onClose,
  transaction,
  onOpenRefundModal,
}) => {
  const downloadReceiptMutation = useDownloadReceipt();
  const downloadInvoiceMutation = useDownloadInvoice();

  if (!isOpen || !transaction) return null;

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
                    <h3 className="font-serif font-bold text-2xl leading-tight">{transaction.id}</h3>
                    <Badge
                      variant={
                        transaction.status === 'success'
                          ? 'forest'
                          : transaction.status === 'refunded'
                          ? 'gold'
                          : 'destructive'
                      }
                      className="capitalize"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                  <p className="font-mono text-xs text-[var(--muted-foreground)] mt-0.5">
                    Gateway ID: {transaction.gatewayTransactionId}
                  </p>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Financial Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
              <div className="p-4 rounded-md bg-[var(--card)] border border-[var(--border)]">
                <span className="font-mono-meta text-[10px] text-[var(--muted-foreground)]">GROSS TRANSACTION</span>
                <div className="mt-1 font-serif text-2xl font-bold text-[var(--foreground)]">
                  {formatCurrency(transaction.amount)}
                </div>
                <span className="font-mono text-[10px] text-[var(--gold)] uppercase">
                  {transaction.currency} Total
                </span>
              </div>

              <div className="p-4 rounded-md bg-[var(--card)] border border-[var(--border)]">
                <span className="font-mono-meta text-[10px] text-[var(--muted-foreground)]">PLATFORM FEE (5%)</span>
                <div className="mt-1 font-serif text-2xl font-bold text-emerald-700">
                  {formatCurrency(transaction.platformFee)}
                </div>
                <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                  DigiLocal Commission
                </span>
              </div>

              <div className="p-4 rounded-md bg-[var(--card)] border border-[var(--border)]">
                <span className="font-mono-meta text-[10px] text-[var(--muted-foreground)]">VENDOR PAYOUT</span>
                <div className="mt-1 font-serif text-2xl font-bold text-[var(--foreground)]">
                  {formatCurrency(transaction.vendorPayout)}
                </div>
                <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                  Net Merchant Share
                </span>
              </div>
            </div>

            {/* Customer & Merchant Meta */}
            <div className="p-4 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-3 font-body text-xs mb-6">
              <h4 className="font-serif font-bold text-base border-b border-[var(--border)] pb-2 flex items-center gap-2">
                <Store className="h-4 w-4 text-[var(--gold)]" />
                <span>Transaction & Customer Metadata</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-[var(--gold)] shrink-0" />
                  <span>Merchant: <strong>{transaction.storeName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[var(--gold)] shrink-0" />
                  <span>Customer: <strong>{transaction.customerName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[var(--gold)] shrink-0" />
                  <span>Email: {transaction.customerEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--gold)] shrink-0" />
                  <span>Date: {formatDate(transaction.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Gateway Method: <strong className="uppercase font-mono">{transaction.gatewayMethod}</strong></span>
                </div>
              </div>
            </div>

            {/* Refund Reason Banner */}
            {transaction.status === 'refunded' && transaction.refundReason && (
              <div className="p-4 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-800 space-y-1 mb-6">
                <div className="flex items-center gap-2 font-serif font-bold text-sm">
                  <RefreshCw className="h-4 w-4" />
                  <span>Refund Audit Log</span>
                </div>
                <p className="font-body text-xs">{transaction.refundReason}</p>
              </div>
            )}

            {/* Receipt & Invoice Downloads CTA */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-3.5 w-3.5" />}
                isLoading={downloadReceiptMutation.isPending}
                onClick={() => downloadReceiptMutation.mutate(transaction.id)}
              >
                Download Receipt PDF
              </Button>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<FileCheck className="h-3.5 w-3.5" />}
                isLoading={downloadInvoiceMutation.isPending}
                onClick={() => downloadInvoiceMutation.mutate(transaction.id)}
              >
                Download Tax Invoice
              </Button>

              {transaction.status === 'success' && (
                <Button
                  variant="destructive"
                  size="sm"
                  leftIcon={<DollarSign className="h-3.5 w-3.5" />}
                  onClick={() => onOpenRefundModal(transaction)}
                >
                  Issue Refund
                </Button>
              )}
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
