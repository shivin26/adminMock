import React from 'react';
import { X, Building2, Store, MapPin, Calendar, Mail, Phone } from 'lucide-react';
import { Society } from '../../types/society';
import { useSocietyVendors } from '../../hooks/useSociety';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Skeleton } from '../feedback/Skeleton';
import { EmptyState } from '../feedback/EmptyState';
import { formatDate } from '../../utils/formatters';

export interface SocietyDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  society: Society | null;
}

export const SocietyDetailsDrawer: React.FC<SocietyDetailsDrawerProps> = ({
  isOpen,
  onClose,
  society,
}) => {
  const { data: rawVendors, isLoading: isLoadingVendors } = useSocietyVendors(society?.id || '');
  const vendors = React.useMemo(() => {
    if (!rawVendors) return [];
    return rawVendors.filter((v) => {
      const st = String(v.status || 'active').toLowerCase();
      return st === 'active' || st === 'approved';
    });
  }, [rawVendors]);

  if (!isOpen || !society) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--ink)]/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-xl bg-[var(--background)] border-l border-[var(--border)] p-6 shadow-2xl overflow-y-auto flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200 text-[var(--foreground)]">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] border border-[var(--gold)] flex items-center justify-center font-serif font-bold text-lg">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl leading-tight">{society.name}</h3>
                  <span className="font-mono text-[11px] text-[var(--gold)] font-semibold">
                    {society.code}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Overview Meta Stats */}
            <div className="grid grid-cols-2 gap-4 py-6">
              <div className="p-3.5 rounded-md bg-[var(--card)] border border-[var(--border)]">
                <span className="font-mono-meta text-[10px] text-[var(--muted-foreground)]">STATUS</span>
                <div className="mt-1">
                  <Badge variant={society.status === 'active' ? 'forest' : 'secondary'} className="capitalize">
                    {society.status}
                  </Badge>
                </div>
              </div>

              <div className="p-3.5 rounded-md bg-[var(--card)] border border-[var(--border)]">
                <span className="font-mono-meta text-[10px] text-[var(--muted-foreground)]">TOTAL VENDORS</span>
                <div className="mt-1 font-serif text-2xl font-bold text-[var(--foreground)]">
                  {society.totalVendorsCount}
                </div>
              </div>

              <div className="col-span-2 p-3.5 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-1">
                <div className="flex items-center gap-2 text-xs font-body text-[var(--foreground)]">
                  <MapPin className="h-4 w-4 text-[var(--gold)] shrink-0" />
                  <span>{society.address}, {society.city}, {society.state} {society.postalCode}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted-foreground)]">
                  <Calendar className="h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0" />
                  <span>Onboarded on {formatDate(society.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Vendors inside Society */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-lg flex items-center gap-2">
                  <Store className="h-4 w-4 text-[var(--gold)]" />
                  <span>Associated Local Vendors</span>
                </h4>
                <span className="font-mono text-xs text-[var(--muted-foreground)]">
                  {vendors?.length || 0} registered
                </span>
              </div>

              {isLoadingVendors ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-14 w-full" />
                  ))}
                </div>
              ) : !vendors || vendors.length === 0 ? (
                <EmptyState
                  title="No vendors assigned"
                  description="There are currently no active vendors operating inside this society."
                />
              ) : (
                <div className="space-y-3">
                  {vendors.map((v) => (
                    <div
                      key={v.id}
                      className="p-3.5 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-2 hover:border-[var(--gold)] transition"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-serif font-bold text-sm text-[var(--foreground)]">
                          {v.storeName}
                        </h5>
                        <Badge variant="gold" className="capitalize">
                          {v.category}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[var(--muted-foreground)]">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{v.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span className="truncate">{v.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Action */}
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
