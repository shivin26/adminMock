import React from 'react';
import { X, ShieldCheck, User, Globe, Laptop, Database, ArrowRight } from 'lucide-react';
import { AuditLogEntry } from '../../types/audit';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/formatters';

export interface AuditLogDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  auditEntry: AuditLogEntry | null;
}

export const AuditLogDetailsDrawer: React.FC<AuditLogDetailsDrawerProps> = ({
  isOpen,
  onClose,
  auditEntry,
}) => {
  if (!isOpen || !auditEntry) return null;

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('SUSPENDED') || action.includes('DELETED')) return 'destructive' as const;
    if (action.includes('CREATED') || action.includes('ACTIVATED')) return 'forest' as const;
    if (action.includes('RENEWED') || action.includes('UPDATED')) return 'gold' as const;
    return 'secondary' as const;
  };

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
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-2xl leading-tight">{auditEntry.id}</h3>
                    <Badge variant={getActionBadgeVariant(auditEntry.action)} className="font-mono text-[10px]">
                      {auditEntry.action}
                    </Badge>
                  </div>
                  <p className="font-mono text-xs text-[var(--muted-foreground)] mt-0.5">
                    {formatDate(auditEntry.timestamp)}
                  </p>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Admin Metadata & Client Info */}
            <div className="p-4 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-3 font-body text-xs my-6">
              <h4 className="font-serif font-bold text-base border-b border-[var(--border)] pb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-[var(--gold)]" />
                <span>Administrator & Session Parameters</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[var(--gold)] shrink-0" />
                  <span>Admin: <strong>{auditEntry.adminName}</strong> ({auditEntry.adminEmail})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[var(--gold)] shrink-0" />
                  <span>IP Address: <strong className="font-mono">{auditEntry.ipAddress}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-[var(--gold)] shrink-0" />
                  <span>Browser / OS: <strong className="font-mono">{auditEntry.browser}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-[var(--gold)] shrink-0" />
                  <span>Impacted Entity: <strong>{auditEntry.affectedResource}</strong></span>
                </div>
              </div>
            </div>

            {/* Side-by-Side JSON State Diff */}
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-lg flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-[var(--gold)]" />
                <span>State Transition Diff (Before & After)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Previous State */}
                <div className="space-y-1.5">
                  <span className="font-mono-meta text-[10px] text-red-600 font-bold">
                    PREVIOUS STATE
                  </span>
                  <pre className="p-3.5 rounded-md bg-[var(--ink)] text-[var(--ink-foreground)] font-mono text-[11px] overflow-x-auto h-48 border border-[var(--border)]">
                    {auditEntry.previousState
                      ? JSON.stringify(auditEntry.previousState, null, 2)
                      : 'None (Initial Creation)'}
                  </pre>
                </div>

                {/* New State */}
                <div className="space-y-1.5">
                  <span className="font-mono-meta text-[10px] text-emerald-600 font-bold">
                    NEW STATE
                  </span>
                  <pre className="p-3.5 rounded-md bg-[var(--ink)] text-[var(--ink-foreground)] font-mono text-[11px] overflow-x-auto h-48 border border-[var(--border)]">
                    {auditEntry.newState
                      ? JSON.stringify(auditEntry.newState, null, 2)
                      : 'None (Deletion Event)'}
                  </pre>
                </div>
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
