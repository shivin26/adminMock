import React from 'react';
import { useVendorReapplicationChanges } from '../../hooks/useVendors';
import { Badge } from '../common/Badge/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AlertTriangle, Clock, Sparkles } from 'lucide-react';

export interface ChangeItem {
  change_id?: number;
  field_name: string;
  field_label: string;
  old_value: string;
  new_value: string;
  changed_at?: string;
  batch_id?: string;
}

export interface ReapplicationDiffData {
  code?: number;
  status?: string;
  message?: string;
  vendor_id?: number | string;
  store_name?: string;
  vendor_name?: string;
  email?: string;
  phone_number?: string;
  has_resubmitted?: boolean;
  resubmitted_at?: string | null;
  hold_reason?: string;
  total_changed_fields?: number;
  changed_fields?: Record<string, ChangeItem>;
  changes_list?: ChangeItem[];
}

export interface VendorReapplicationDiffCardProps {
  vendorId: string | number;
  fallbackChanges?: Array<{ field: string; label: string; oldValue?: string; newValue: string }>;
  fallbackHoldReason?: string;
}

export const VendorReapplicationDiffCard: React.FC<VendorReapplicationDiffCardProps> = ({
  vendorId,
  fallbackChanges,
  fallbackHoldReason,
}) => {
  const { data: rawDiffData, isLoading } = useVendorReapplicationChanges(vendorId);

  const diffData: ReapplicationDiffData | null = rawDiffData || null;

  // Resolve changes list either from backend API or fallback
  const changesList: ChangeItem[] = React.useMemo(() => {
    if (diffData?.changes_list && Array.isArray(diffData.changes_list) && diffData.changes_list.length > 0) {
      return diffData.changes_list;
    }

    if (diffData?.changed_fields && Object.keys(diffData.changed_fields).length > 0) {
      return Object.values(diffData.changed_fields);
    }

    if (fallbackChanges && fallbackChanges.length > 0) {
      return fallbackChanges.map((c) => ({
        field_name: c.field,
        field_label: c.label,
        old_value: c.oldValue || '',
        new_value: c.newValue,
      }));
    }

    return [];
  }, [diffData, fallbackChanges]);

  const totalFields = diffData?.total_changed_fields ?? changesList.length;
  const holdReason = diffData?.hold_reason || fallbackHoldReason || '';

  if (isLoading) {
    return (
      <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl text-center">
        <LoadingSpinner size="sm" label="Fetching vendor reapplication field diffs..." />
      </div>
    );
  }

  if (changesList.length === 0) {
    return (
      <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center justify-between">
        <span className="font-medium flex items-center gap-1.5">
          <AlertTriangle size={15} className="text-amber-600 shrink-0" />
          No specific field modifications reported for this vendor reapplication.
        </span>
        <Badge variant="warning" className="text-[10px]">0 CHANGES</Badge>
      </div>
    );
  }

  return (
    <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl shadow-xs flex flex-col gap-3 font-sans">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-amber-200 pb-2 flex-wrap gap-2">
        <h5 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <AlertTriangle size={15} className="text-amber-600 shrink-0" />
          ⚠️ Vendor Updated Details (Reapplication Diff)
        </h5>
        <span className="px-2.5 py-0.5 bg-amber-800 text-white font-mono text-[10px] font-bold rounded-full">
          {totalFields} Field(s) Changed
        </span>
      </div>

      {/* Hold Reason Banner */}
      {holdReason && (
        <div className="p-2.5 bg-white/80 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
          <strong>Original Hold Reason:</strong> {holdReason}
        </div>
      )}

      {/* Side by Side Diff Table */}
      <div className="overflow-x-auto rounded-xl border border-amber-200 shadow-2xs">
        <table className="w-full text-left text-xs bg-white border-collapse">
          <thead>
            <tr className="bg-amber-100/80 text-amber-950 font-mono text-[11px] uppercase tracking-wider border-b border-amber-200">
              <th className="p-2.5 font-bold">Field Name</th>
              <th className="p-2.5 font-bold text-rose-900">Previous Value (Before Hold)</th>
              <th className="p-2.5 font-bold text-emerald-900">New Updated Value (Vendor Input)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100 text-xs">
            {changesList.map((item, idx) => (
              <tr key={item.field_name || idx} className="hover:bg-amber-50/40 transition-colors">
                <td className="p-2.5 font-bold text-[#211A19]">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-600 shrink-0" />
                    {item.field_label || item.field_name}
                  </span>
                </td>
                <td className="p-2.5 text-rose-800 line-through bg-rose-50/50 font-mono text-[11px]">
                  {item.old_value ? (
                    item.old_value
                  ) : (
                    <em className="text-rose-400 not-italic">(empty)</em>
                  )}
                </td>
                <td className="p-2.5 font-bold text-emerald-900 bg-emerald-50/60 font-mono text-[11px]">
                  {item.new_value ? (
                    item.new_value
                  ) : (
                    <em className="text-emerald-500 not-italic">(empty)</em>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
