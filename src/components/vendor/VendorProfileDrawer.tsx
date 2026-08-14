import React, { useState } from 'react';
import {
  X,
  Store,
  FileCheck,
  Clock,
  CreditCard,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { Vendor } from '../../types/vendor';
import { useVendorPayments } from '../../hooks/useVendor';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Skeleton } from '../feedback/Skeleton';
import { formatCurrency, formatDate } from '../../utils/formatters';

export interface VendorProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOwner?: (ownerName: string) => void;
  vendor: Vendor | null;
}

export const VendorProfileDrawer: React.FC<VendorProfileDrawerProps> = ({
  isOpen,
  onClose,
  onSelectOwner,
  vendor,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gst' | 'hours' | 'payments'>('overview');
  const { data: payments, isLoading: isLoadingPayments } = useVendorPayments(vendor?.id || '');

  if (!isOpen || !vendor) return null;

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
              <div className="flex items-center gap-4">
                <img
                  src={vendor.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80'}
                  alt={vendor.storeName}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-[var(--gold)]/50 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-2xl leading-tight">{vendor.storeName}</h3>
                    <Badge
                      variant={
                        vendor.status === 'active'
                          ? 'forest'
                          : vendor.status === 'suspended'
                          ? 'destructive'
                          : 'warning'
                      }
                      className="capitalize"
                    >
                      {vendor.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="font-mono text-xs text-[var(--muted-foreground)] mt-0.5 flex items-center gap-1">
                    <span>Owned by</span>
                    <button
                      type="button"
                      onClick={() => onSelectOwner?.(vendor.ownerName)}
                      className="font-bold text-[#C4A066] hover:underline cursor-pointer transition-colors"
                      title="Click to view Owner details"
                    >
                      {vendor.ownerName} ↗
                    </button>
                    <span>• {vendor.category}</span>
                  </p>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Tab Navigation Controls */}
            <div className="flex items-center space-x-1 border-b border-[var(--border)] mt-4">
              {[
                { id: 'overview', label: 'Store Overview', icon: <Store className="h-3.5 w-3.5" /> },
                { id: 'gst', label: 'GST & Tax Details', icon: <FileCheck className="h-3.5 w-3.5" /> },
                { id: 'hours', label: 'Business Hours', icon: <Clock className="h-3.5 w-3.5" /> },
                { id: 'payments', label: 'Payment History', icon: <CreditCard className="h-3.5 w-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-mono-meta font-semibold transition border-b-2 cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-[var(--gold)] text-[var(--gold)]'
                      : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content 1: Overview */}
            {activeTab === 'overview' && (
              <div className="py-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-md bg-[var(--card)] border border-[var(--border)]">
                    <span className="font-mono-meta text-[10px] text-[var(--muted-foreground)]">
                      TOTAL PLATFORM EARNINGS
                    </span>
                    <div className="mt-1 font-serif text-3xl font-bold text-[var(--foreground)] flex items-center gap-1">
                      <DollarSign className="h-5 w-5 text-[var(--gold)]" />
                      <span>{formatCurrency(vendor.totalEarnings)}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-md bg-[var(--card)] border border-[var(--border)]">
                    <span className="font-mono-meta text-[10px] text-[var(--muted-foreground)]">
                      SUBSCRIPTION TIER
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="gold" className="capitalize text-xs">
                        {vendor.subscriptionTier} Tier
                      </Badge>
                      <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                        Renews {vendor.subscriptionRenewalDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-3 font-body text-xs">
                  <h4 className="font-serif font-bold text-base border-b border-[var(--border)] pb-2">
                    Contact & Location Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[var(--gold)] shrink-0" />
                      <span>{vendor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[var(--gold)] shrink-0" />
                      <span>{vendor.phone}</span>
                    </div>
                    {vendor.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-[var(--gold)] shrink-0" />
                        <a href={vendor.website} target="_blank" rel="noreferrer" className="text-[var(--gold)] hover:underline truncate">
                          {vendor.website}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[var(--gold)] shrink-0" />
                      <span>{vendor.societyName}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[var(--gold)] shrink-0" />
                      <span>{vendor.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content 2: GST & Tax Details */}
            {activeTab === 'gst' && (
              <div className="py-6 space-y-6">
                <div className="p-5 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-emerald-600" />
                      <h4 className="font-serif font-bold text-lg">Tax Verification Record</h4>
                    </div>
                    <Badge variant="forest" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Verified GSTIN</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="font-mono-meta text-[10px] text-[var(--muted-foreground)]">GSTIN NUMBER</span>
                      <p className="font-mono font-bold text-base text-[var(--foreground)] mt-0.5">
                        {vendor.gstin}
                      </p>
                    </div>

                    <div>
                      <span className="font-mono-meta text-[10px] text-[var(--muted-foreground)]">BUSINESS ENTITY TYPE</span>
                      <p className="font-body font-semibold text-sm text-[var(--foreground)] mt-0.5">
                        {vendor.businessType}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content 3: Business Hours */}
            {activeTab === 'hours' && (
              <div className="py-6 space-y-4">
                <h4 className="font-serif font-bold text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--gold)]" />
                  <span>Weekly Store Operating Hours</span>
                </h4>

                <div className="rounded-md border border-[var(--border)] overflow-hidden">
                  <table className="w-full text-left text-xs font-body">
                    <thead className="bg-[var(--secondary)] font-mono-meta border-b border-[var(--border)] text-[var(--muted-foreground)]">
                      <tr>
                        <th className="p-3">Day of Week</th>
                        <th className="p-3">Opening Time</th>
                        <th className="p-3">Closing Time</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
                      {vendor.businessHours.map((h, idx) => (
                        <tr key={idx} className="hover:bg-[var(--secondary)]/60 transition">
                          <td className="p-3 font-semibold text-[var(--foreground)]">{h.day}</td>
                          <td className="p-3 font-mono">{h.isClosed ? '-' : h.openTime}</td>
                          <td className="p-3 font-mono">{h.isClosed ? '-' : h.closeTime}</td>
                          <td className="p-3 text-right">
                            {h.isClosed ? (
                              <span className="font-mono text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded font-semibold">
                                Closed
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                                Open
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab Content 4: Payment History */}
            {activeTab === 'payments' && (
              <div className="py-6 space-y-4">
                <h4 className="font-serif font-bold text-lg flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[var(--gold)]" />
                  <span>Payout & Invoicing Records</span>
                </h4>

                {isLoadingPayments ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <Skeleton key={idx} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-[var(--border)] overflow-hidden">
                    <table className="w-full text-left text-xs font-body">
                      <thead className="bg-[var(--secondary)] font-mono-meta border-b border-[var(--border)] text-[var(--muted-foreground)]">
                        <tr>
                          <th className="p-3">Transaction ID</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Method</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
                        {payments?.map((p) => (
                          <tr key={p.id} className="hover:bg-[var(--secondary)]/60 transition">
                            <td className="p-3 font-mono font-semibold text-[var(--foreground)]">{p.id}</td>
                            <td className="p-3 font-mono font-bold text-[var(--foreground)]">
                              {formatCurrency(p.amount)}
                            </td>
                            <td className="p-3 font-mono text-[var(--muted-foreground)]">{p.date}</td>
                            <td className="p-3">{p.paymentMethod}</td>
                            <td className="p-3 text-right">
                              <Badge variant={p.status === 'completed' ? 'forest' : 'warning'}>
                                {p.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-[var(--border)] flex justify-between items-center">
            <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
              Created on {formatDate(vendor.createdAt)}
            </span>
            <Button variant="outline" onClick={onClose}>
              Close Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
