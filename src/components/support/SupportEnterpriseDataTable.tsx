import React, { useState, useMemo, useRef, useEffect } from 'react';
import './SupportEnterpriseDataTable.css';
import { DataTable } from '../common/DataTable/DataTable';
import type { Column } from '../common/DataTable/DataTable';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import { SupportTicketStatusBadge } from './SupportTicketStatusBadge';
import type { SupportTicket, TicketStatus } from '../../types/support.types';
import { formatDate } from '../../utils/formatters.utils';
import {
  Download,
  FileSpreadsheet,
  FileText,
  SlidersHorizontal,
  CheckSquare,
  Square,
  CheckCircle2,
  XCircle,
  Eye,
  User,
  Building2,
  Clock,
  Tag,
  Globe,
  Smartphone,
} from 'lucide-react';

export interface SupportEnterpriseDataTableProps {
  tickets: SupportTicket[];
  isLoading?: boolean;
  onSelectTicket: (ticketId: string) => void;
  onUpdateBulkStatus?: (ids: string[], status: TicketStatus) => void;
  onOpenUserProfile?: (userName: string) => void;
  onOpenVendorProfile?: (vendorName: string) => void;
}

export const SupportEnterpriseDataTable: React.FC<SupportEnterpriseDataTableProps> = ({
  tickets,
  isLoading = false,
  onSelectTicket,
  onUpdateBulkStatus,
  onOpenUserProfile,
  onOpenVendorProfile,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setIsColumnMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Column visibility state for 15 columns
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    select: true,
    ticketNumber: true,
    subject: true,
    userType: true,
    source: true,
    reporterName: true,
    entityName: true,
    priority: true,
    category: true,
    assignedTo: true,
    status: true,
    createdAt: true,
    updatedAt: false,
    dueDate: true,
    slaStatus: true,
    tags: true,
    actions: true,
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === tickets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tickets.map((t) => t.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tickets]);

  // Export Helpers
  const exportToCSV = () => {
    const headers = ['Ticket ID', 'Subject', 'Category', 'Priority', 'Status', 'Reporter', 'Entity', 'Created At'];
    const rows = sortedTickets.map((t) => [
      t.ticketNumber,
      `"${t.subject.replace(/"/g, '""')}"`,
      t.category,
      t.priority,
      t.status,
      t.reporterName,
      t.entityName || '',
      t.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `support_tickets_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    exportToCSV(); // Downloads formatted CSV compatible with MS Excel
  };

  const exportToPDF = () => {
    window.print();
  };

  // Build columns dynamically based on column visibility checkboxes
  const columns = useMemo(() => {
    const list: Column<SupportTicket>[] = [];

    if (visibleColumns.select) {
      list.push({
        header: '',
        cell: (ticket) => (
          <div onClick={(e) => e.stopPropagation()} className="cursor-pointer">
            {selectedIds.has(ticket.id) ? (
              <CheckSquare size={16} className="text-[#C8A878]" onClick={() => toggleSelectRow(ticket.id)} />
            ) : (
              <Square size={16} className="text-[#78716C]" onClick={() => toggleSelectRow(ticket.id)} />
            )}
          </div>
        ),
      });
    }

    if (visibleColumns.ticketNumber) {
      list.push({
        header: 'Ticket ID',
        cell: (t) => (
          <span className="font-mono text-xs font-bold text-[#C8A878] bg-[#EEE5DA]/60 px-2 py-0.5 rounded whitespace-nowrap inline-block">
            {t.ticketNumber}
          </span>
        ),
      });
    }

    if (visibleColumns.subject) {
      list.push({
        header: 'Subject',
        cell: (t) => (
          <div className="flex flex-col">
            <span className="font-bold text-[#211A19] text-xs line-clamp-1">{t.subject}</span>
            <span className="text-[11px] text-[#78716C] line-clamp-1">{t.description}</span>
          </div>
        ),
      });
    }

    if (visibleColumns.userType) {
      list.push({
        header: 'Type',
        cell: (t) => (
          <Badge variant={t.userType === 'vendor' ? 'primary' : t.userType === 'user_vendor' ? 'warning' : 'neutral'}>
            {t.userType === 'user_vendor' ? 'USER & VENDOR' : t.userType.toUpperCase()}
          </Badge>
        ),
      });
    }

    if (visibleColumns.source) {
      list.push({
        header: 'Channel Source',
        cell: (t) => {
          const effectiveSource = t.userType === 'user' ? 'landing_website' : t.source;
          const isWeb = effectiveSource === 'landing_website';
          return (
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border whitespace-nowrap ${
                isWeb
                  ? 'bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]/40'
                  : 'bg-[#FAF8F5] text-[#211A19] border-[#E7DFD5]'
              }`}
            >
              {isWeb ? <Globe size={12} className="text-[#D97706]" /> : <Smartphone size={12} className="text-[#C8A878]" />}
              {t.userType === 'user'
                ? 'Website Intake'
                : effectiveSource === 'mobile_app'
                ? 'Vendor Mobile App'
                : 'Vendor Web Portal'}
            </span>
          );
        },
      });
    }

    if (visibleColumns.reporterName) {
      list.push({
        header: 'Raised By',
        cell: (t) => (
          <div className="flex flex-col text-xs">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenUserProfile) onOpenUserProfile(t.reporterName);
              }}
              className="font-bold text-[#211A19] hover:text-[#C8A878] underline text-left flex items-center gap-1 cursor-pointer transition-colors"
            >
              <User size={12} className="text-[#C8A878]" /> {t.reporterName}
            </button>
            <span className="text-[#78716C] text-[11px]">{t.reporterEmail}</span>
          </div>
        ),
      });
    }

    if (visibleColumns.entityName) {
      list.push({
        header: 'Store / Entity Name',
        cell: (t) => (
          <div className="flex flex-col text-xs">
            {(t.userType === 'vendor' || t.userType === 'user_vendor') ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenVendorProfile) onOpenVendorProfile(t.entityName || '');
                }}
                className="text-xs text-[#211A19] font-semibold hover:text-[#C8A878] underline text-left flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Building2 size={12} className="text-[#C8A878]" /> {t.entityName || 'Vendor Store'}
              </button>
            ) : (
              <span className="text-xs text-[#78716C] italic">N/A (User Account)</span>
            )}
          </div>
        ),
      });
    }

    if (visibleColumns.priority) {
      list.push({
        header: 'Priority',
        cell: (t) => <SupportTicketStatusBadge priority={t.priority} />,
      });
    }

    if (visibleColumns.category) {
      list.push({
        header: 'Category & Direction',
        cell: (t) => {
          let label = t.category.replace(/_/g, ' ').toUpperCase();
          let variant: 'primary' | 'warning' | 'danger' | 'info' | 'neutral' = 'neutral';
          if (t.category === 'vendor_vs_user') {
            label = 'VENDOR → RESIDENT';
            variant = 'warning';
          } else if (t.category === 'vendor_vs_vendor') {
            label = 'VENDOR → VENDOR';
            variant = 'primary';
          } else if (t.category === 'user_vs_vendor') {
            label = 'RESIDENT → VENDOR';
            variant = 'danger';
          }
          return <Badge variant={variant}>{label}</Badge>;
        },
      });
    }

    if (visibleColumns.assignedTo) {
      list.push({
        header: 'Assigned To',
        cell: (t) => (
          <span className="text-xs font-semibold text-[#211A19]">{t.assignedTo || 'Super Admin'}</span>
        ),
      });
    }

    if (visibleColumns.status) {
      list.push({
        header: 'Status',
        cell: (t) => <SupportTicketStatusBadge status={t.status} />,
      });
    }

    if (visibleColumns.createdAt) {
      list.push({
        header: 'Created At',
        cell: (t) => <span className="text-xs text-[#78716C]">{formatDate(t.createdAt)}</span>,
      });
    }

    if (visibleColumns.updatedAt) {
      list.push({
        header: 'Updated At',
        cell: (t) => <span className="text-xs text-[#78716C]">{formatDate(t.updatedAt)}</span>,
      });
    }

    if (visibleColumns.dueDate) {
      list.push({
        header: 'Due Date',
        cell: (_t) => (
          <span className="text-xs text-[#78716C] flex items-center gap-1">
            <Clock size={12} /> Today, 6:00 PM
          </span>
        ),
      });
    }

    if (visibleColumns.slaStatus) {
      list.push({
        header: 'SLA Status',
        cell: (t) => {
          const isAtRisk = (t.slaMinutesRemaining || 0) < 60;
          return (
            <Badge variant={isAtRisk ? 'danger' : 'success'}>
              {isAtRisk ? 'SLA AT RISK' : 'SLA COMPLIANT'}
            </Badge>
          );
        },
      });
    }

    if (visibleColumns.tags) {
      list.push({
        header: 'Tags',
        cell: (t) => (
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] font-semibold text-[#C8A878] bg-[#EEE5DA] px-1.5 py-0.5 rounded flex items-center gap-1">
              <Tag size={10} /> #{t.category}
            </span>
          </div>
        ),
      });
    }

    if (visibleColumns.actions) {
      list.push({
        header: 'Actions',
        cell: (t) => (
          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eye size={14} />}
              onClick={() => onSelectTicket(t.id)}
            >
              View
            </Button>
          </div>
        ),
      });
    }

    return list;
  }, [visibleColumns, selectedIds, tickets]);

  return (
    <div className="enterprise-table-container">
      {/* Table Toolbar */}
      <div className="table-toolbar">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
            {selectedIds.size === tickets.length ? 'Deselect All' : 'Select All'}
          </Button>
          {selectedIds.size > 0 && (
            <span className="text-xs font-bold text-[#C8A878]">
              {selectedIds.size} selected
            </span>
          )}
        </div>

        {/* Action Controls & Column Visibility Dropdown */}
        <div className="flex items-center gap-2 relative" ref={columnMenuRef}>
          <Button variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={exportToCSV}>
            CSV
          </Button>
          <Button variant="outline" size="sm" leftIcon={<FileSpreadsheet size={14} />} onClick={exportToExcel}>
            Excel
          </Button>
          <Button variant="outline" size="sm" leftIcon={<FileText size={14} />} onClick={exportToPDF}>
            PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<SlidersHorizontal size={14} />}
            onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
          >
            Columns
          </Button>

          {/* Column Visibility Dropdown Menu */}
          {isColumnMenuOpen && (
            <div className="column-visibility-menu">
              <span className="text-xs font-bold text-[#211A19] block mb-2">Toggle Table Columns</span>
              <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                {Object.keys(visibleColumns).map((colKey) => (
                  <label key={colKey} className="column-checkbox-item">
                    <input
                      type="checkbox"
                      checked={visibleColumns[colKey]}
                      onChange={(e) =>
                        setVisibleColumns((prev) => ({ ...prev, [colKey]: e.target.checked }))
                      }
                      className="rounded border-[#E7DFD5]"
                    />
                    <span className="capitalize">{colKey.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bulk Actions Bar when rows selected */}
      {selectedIds.size > 0 && (
        <div className="bulk-actions-floating-bar">
          <span className="text-xs font-bold">{selectedIds.size} tickets selected</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCircle2 size={14} />}
              onClick={() => onUpdateBulkStatus && onUpdateBulkStatus(Array.from(selectedIds), 'resolved')}
            >
              Bulk Resolve
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<XCircle size={14} />}
              onClick={() => onUpdateBulkStatus && onUpdateBulkStatus(Array.from(selectedIds), 'closed')}
            >
              Bulk Close
            </Button>
          </div>
        </div>
      )}

      {/* Main Table with Resizable Sticky Header & Infinite Scroll */}
      <DataTable
        columns={columns}
        data={sortedTickets}
        isLoading={isLoading}
        emptyMessage="No enterprise support tickets match the selected view."
        onRowClick={(ticket) => onSelectTicket(ticket.id)}
        initialBatchSize={8}
        batchStep={6}
      />
    </div>
  );
};
