import React from 'react';
import { CheckCircle2, ShieldAlert, Trash2, X } from 'lucide-react';
import { Button } from '../ui/Button';

export interface VendorBulkActionsToolbarProps {
  selectedCount: number;
  onBulkActivate: () => void;
  onBulkSuspend: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export const VendorBulkActionsToolbar: React.FC<VendorBulkActionsToolbarProps> = ({
  selectedCount,
  onBulkActivate,
  onBulkSuspend,
  onBulkDelete,
  onClearSelection,
  isLoading = false,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-5 py-3 rounded-xl border border-[var(--gold)] bg-[var(--ink)] text-[var(--ink-foreground)] shadow-2xl animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
        <span className="font-mono text-xs font-bold text-[var(--gold)]">{selectedCount}</span>
        <span className="font-body text-xs text-[var(--ink-foreground)]">vendors selected</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          isLoading={isLoading}
          leftIcon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
          onClick={onBulkActivate}
        >
          Activate Selected
        </Button>

        <Button
          variant="secondary"
          size="sm"
          isLoading={isLoading}
          leftIcon={<ShieldAlert className="h-3.5 w-3.5 text-amber-600" />}
          onClick={onBulkSuspend}
        >
          Suspend Selected
        </Button>

        <Button
          variant="destructive"
          size="sm"
          isLoading={isLoading}
          leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          onClick={onBulkDelete}
        >
          Delete Selected
        </Button>
      </div>

      <button
        onClick={onClearSelection}
        className="ml-2 text-[var(--ink-foreground)]/70 hover:text-[var(--gold)] transition cursor-pointer p-1"
        aria-label="Clear selection"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
