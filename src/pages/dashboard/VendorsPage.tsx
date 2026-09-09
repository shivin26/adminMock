import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import './VendorsPage.css';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { DataTable } from '../../components/common/DataTable/DataTable';
import type { Column } from '../../components/common/DataTable/DataTable';
import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { Badge } from '../../components/common/Badge/Badge';
import { useSocieties } from '../../hooks/useSocieties';
import {
  useVendors,
  usePendingVendors,
  useOnHoldVendors,
  useApproveVendor,
  useHoldVendor,
  useRejectVendor,
  useToggleVendorStatus,
  useBlockVendor,
} from '../../hooks/useVendors';
import { useDebounce } from '../../hooks/useDebounce';
import type { Vendor, VendorStatus } from '../../types/vendor.types';
import { formatCurrency, getStatusBadgeVariant } from '../../utils/formatters.utils';
import { Search, XCircle, ShieldCheck, Ban, ShoppingBag, PauseCircle, Clock, MapPin, AlertTriangle, Bell, CheckCircle2, ExternalLink } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { saveLocalVendors, saveLocalPendingVendors, getLocalVendors, getLocalPendingVendors } from '../../services/api/vendors.api';
import { VendorApprovalModal } from '../../components/vendors/VendorApprovalModal';
import { VendorHoldDrawer } from '../../components/vendors/VendorHoldDrawer';
import { VendorRejectDrawer } from '../../components/vendors/VendorRejectDrawer';
import { VendorDetailsDrawer } from '../../components/vendors/VendorDetailsDrawer';
import { VendorBlockConfirmModal } from '../../components/vendors/VendorBlockConfirmModal';
import { PeopleDetailsDrawer } from '../../components/people/PeopleDetailsDrawer';
import { ImagePreviewModal } from '../../components/common/Modal/ImagePreviewModal';

type TabType = 'all' | 'pending' | 'on_hold' | 'active' | 'rejected' | 'suspended' | 'expired';
type VendorSortOption = 'name-asc' | 'name-desc' | 'revenue-desc' | 'revenue-asc' | 'orders-desc' | 'newest' | 'oldest';

export const VendorsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const validTabs: TabType[] = ['all', 'pending', 'on_hold', 'active', 'rejected', 'suspended', 'expired'];
  const initialTab: TabType = (rawTab && validTabs.includes(rawTab as TabType))
    ? (rawTab as TabType)
    : 'all';

  const [activeTab, setActiveTabState] = useState<TabType>(initialTab);
  const [sortBy, setSortBy] = useState<VendorSortOption>('name-asc');

  useEffect(() => {
    if (rawTab && validTabs.includes(rawTab as TabType)) {
      setActiveTabState(rawTab as TabType);
    }
  }, [rawTab]);

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  const { data: rawAllVendors = [], isLoading: isLoadingAll } = useVendors({
    search: debouncedSearch,
    tier: selectedTier,
  });
  const { data: rawPendingVendors, isLoading: isLoadingPending } = usePendingVendors();
  const { data: rawOnHoldVendors, isLoading: isLoadingOnHold } = useOnHoldVendors();

  const approveVendorMutation = useApproveVendor();
  const holdVendorMutation = useHoldVendor();
  const rejectVendorMutation = useRejectVendor();
  const toggleStatusMutation = useToggleVendorStatus();
  const blockVendorMutation = useBlockVendor();

  // Modals & Drawer State
  const [approvingVendor, setApprovingVendor] = useState<Vendor | null>(null);
  const [holdingVendor, setHoldingVendor] = useState<Vendor | null>(null);
  const [rejectingVendor, setRejectingVendor] = useState<Vendor | null>(null);
  const [blockingVendor, setBlockingVendor] = useState<Vendor | null>(null);
  const [selectedDrawerVendor, setSelectedDrawerVendor] = useState<Vendor | null>(null);
  const [isDrawerHoldFormOpen, setIsDrawerHoldFormOpen] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);

  // Active vendors dataset directly from backend status
  const allVendors = Array.isArray(rawAllVendors) ? rawAllVendors : [];
  const pendingVendors = Array.isArray(rawPendingVendors) ? rawPendingVendors : [];
  const onHoldVendors = Array.isArray(rawOnHoldVendors) ? rawOnHoldVendors : [];

  // Combine datasets for tabs filtering
  const allApplications = useMemo(() => {
    const map = new Map<string, Vendor>();
    pendingVendors.forEach((v) => map.set(v.id, v));
    onHoldVendors.forEach((v) => map.set(v.id, v));
    allVendors.forEach((v) => map.set(v.id, v));
    return Array.from(map.values());
  }, [allVendors, pendingVendors, onHoldVendors]);

  // Tab filtering counts
  const pendingCount = allApplications.filter((v) => v.status === 'pending').length;
  const onHoldCount = allApplications.filter((v) => v.status === 'on_hold').length;
  const activeCount = allApplications.filter((v) => v.status === 'active').length;
  const rejectedCount = allApplications.filter((v) => v.status === 'rejected').length;
  const suspendedCount = allApplications.filter((v) => v.status === 'suspended').length;
  const expiredCount = allApplications.filter((v) => v.status === 'expired').length;

  let currentDataset: Vendor[] = [];
  if (activeTab === 'pending') {
    currentDataset = allApplications.filter((v) => v.status === 'pending');
  } else if (activeTab === 'on_hold') {
    currentDataset = allApplications.filter((v) => v.status === 'on_hold');
  } else if (activeTab === 'active') {
    currentDataset = allApplications.filter((v) => v.status === 'active');
  } else if (activeTab === 'rejected') {
    currentDataset = allApplications.filter((v) => v.status === 'rejected');
  } else if (activeTab === 'suspended') {
    currentDataset = allApplications.filter((v) => v.status === 'suspended');
  } else if (activeTab === 'expired') {
    currentDataset = allApplications.filter((v) => v.status === 'expired');
  } else {
    currentDataset = allApplications;
  }

  const displayedVendors = useMemo(() => {
    const list = [...currentDataset];
    switch (sortBy) {
      case 'name-asc':
        return list.sort((a, b) => a.storeName.localeCompare(b.storeName));
      case 'name-desc':
        return list.sort((a, b) => b.storeName.localeCompare(a.storeName));
      case 'revenue-desc':
        return list.sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0));
      case 'revenue-asc':
        return list.sort((a, b) => (a.totalEarnings || 0) - (b.totalEarnings || 0));
      case 'orders-desc':
        return list.sort((a, b) => (b.totalOrdersCount || 0) - (a.totalOrdersCount || 0));
      case 'newest':
        return list.sort((a, b) => new Date(b.submissionTimestamp || b.createdAt || 0).getTime() - new Date(a.submissionTimestamp || a.createdAt || 0).getTime());
      case 'oldest':
        return list.sort((a, b) => new Date(a.submissionTimestamp || a.createdAt || 0).getTime() - new Date(b.submissionTimestamp || b.createdAt || 0).getTime());
      default:
        return list;
    }
  }, [currentDataset, sortBy]);

  const isLoading = activeTab === 'pending' ? isLoadingPending : activeTab === 'on_hold' ? isLoadingOnHold : isLoadingAll;

  const handleApprove = (vendorId: string | number) => {
    approveVendorMutation.mutate(vendorId, {
      onSuccess: () => setApprovingVendor(null),
    });
  };

  const handleHold = (vendorId: string | number, payload: HoldVendorPayload) => {
    const subj = payload.subject || payload.hold_email_subject || 'Document Correction Required';
    const content = payload.email_content || payload.hold_reason || payload.reason || '';
    holdVendorMutation.mutate(
      {
        vendorId,
        subject: subj,
        email_content: content,
        hold_email_subject: subj,
        hold_reason: content,
        reason: content,
        remarks: content,
      },
      {
        onSuccess: () => setHoldingVendor(null),
      }
    );
  };

  const handleReject = (vendorId: string | number, reason?: string) => {
    rejectVendorMutation.mutate(
      { vendorId, reason },
      {
        onSuccess: () => setRejectingVendor(null),
      }
    );
  };

  const handleToggleStatus = (vendorId: string | number, status: 'active' | 'suspended', customMessage?: string) => {
    if (status === 'suspended') {
      blockVendorMutation.mutate(
        { vendorId, reason: customMessage || 'Fraudulent listing / policy violation' },
        {
          onSuccess: () => {
            setBlockingVendor(null);
            if (selectedDrawerVendor && selectedDrawerVendor.id === String(vendorId)) {
              setSelectedDrawerVendor((prev) => (prev ? { ...prev, status: 'suspended' } : null));
            }
          },
        }
      );
    } else {
      toggleStatusMutation.mutate(
        { vendorId, status: 'active' },
        {
          onSuccess: () => {
            setBlockingVendor(null);
            if (selectedDrawerVendor && selectedDrawerVendor.id === String(vendorId)) {
              setSelectedDrawerVendor((prev) => (prev ? { ...prev, status: 'active' } : null));
            }
          },
        }
      );
    }
  };

  const queryClient = useQueryClient();

  const handleMarkViewed = (vendorId: string | number) => {
    const sId = String(vendorId);
    setSelectedDrawerVendor((prev) => (prev && prev.id === sId ? { ...prev, hasResubmitted: false, hasVendorUpdate: false, isUpdateViewed: true } : prev));
    setApprovingVendor((prev) => (prev && prev.id === sId ? { ...prev, hasResubmitted: false, hasVendorUpdate: false, isUpdateViewed: true } : prev));

    const all = getLocalVendors();
    const pending = getLocalPendingVendors();
    const updatedAll = all.map((v) => (v.id === sId ? { ...v, hasResubmitted: false, hasVendorUpdate: false, isUpdateViewed: true } : v));
    const updatedPending = pending.map((v) => (v.id === sId ? { ...v, hasResubmitted: false, hasVendorUpdate: false, isUpdateViewed: true } : v));

    saveLocalVendors(updatedAll);
    saveLocalPendingVendors(updatedPending);
    queryClient.invalidateQueries({ queryKey: ['vendors'] });
  };

  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  const columns: Column<Vendor>[] = [
    {
      header: 'S.No.',
      cell: (_item, index) => <span className="font-mono text-xs text-[#211A19] font-bold">{index + 1}</span>,
    },

    {
      header: 'Store & Owner',
      cell: (vendor) => (
        <div className="vendor-store-cell">
          <img
            src={vendor.avatarUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300'}
            alt={vendor.storeName}
            className="vendor-table-logo cursor-pointer hover:opacity-80 hover:scale-105 transition-all"
            title="Click to view profile picture"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImage({
                url: vendor.avatarUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
                title: `${vendor.storeName} — Profile Picture`,
                subtitle: `Owner: ${vendor.ownerName} (${vendor.email})`,
              });
            }}
          />
          <div>
            <span
              className="vendor-store-title font-serif hover:text-[#C8A878] hover:underline cursor-pointer transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDrawerVendor(vendor);
              }}
              title="Click to view full vendor profile & orders"
            >
              {vendor.storeName}
            </span>
            <span className="vendor-owner-title">
              {vendor.ownerName} • {vendor.email}
            </span>
          </div>
        </div>
      ),
    },

    {
      header: 'Location & Area',
      cell: (vendor) => (
        <div>
          <span className="cell-primary-text flex items-center gap-1 font-bold text-[#211A19]">
            <MapPin size={12} className="text-[#C8A878]" /> {vendor.locationArea || vendor.societyName || vendor.area}
          </span>
          <span className="cell-sub-text truncate max-w-[200px]" title={vendor.address}>
            {vendor.address}
          </span>
        </div>
      ),
    },

    {
      header: 'Category & GSTIN',
      cell: (vendor) => (
        <div>
          <span className="cell-primary-text font-medium">{vendor.category} {vendor.vendorType ? `(${vendor.vendorType})` : ''}</span>
          <span className="cell-sub-text font-mono text-[11px]">GST: {vendor.gstin || 'N/A'}</span>
        </div>
      ),
    },

    {
      header: 'Status & Notifications',
      cell: (vendor) => (
        <div className="flex flex-col items-start gap-1">
          <Badge variant={getStatusBadgeVariant(vendor.status)}>
            {vendor.status === 'on_hold' ? 'ON HOLD' : vendor.status.replace('_', ' ').toUpperCase()}
          </Badge>

          {/* On-Hold Queue Specific Badge Rules */}
          {(vendor.status === 'on_hold' || vendor.status === 'hold') && (
            (vendor.hasResubmitted || vendor.hasVendorUpdate || (vendor.resubmittedChanges && vendor.resubmittedChanges.length > 0) || (vendor.updatedFieldKeys && vendor.updatedFieldKeys.length > 0)) ? (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-xs animate-pulse font-mono cursor-pointer hover:bg-emerald-700 transition-all"
                title={vendor.resubmittedAtReadable ? `Resubmitted: ${vendor.resubmittedAtReadable}` : 'Vendor updated details in portal settings'}
                onClick={() => setSelectedDrawerVendor(vendor)}
              >
                <Bell size={11} className="fill-current text-white animate-bounce shrink-0" />
                🟢 Resubmitted &amp; Updated
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                🟡 Awaiting Vendor Changes
              </span>
            )
          )}
        </div>
      ),
    },

    {
      header: 'Actions',
      cell: (vendor) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ExternalLink size={14} />}
            className="text-[#541D26] hover:bg-[#FAF8F5] border border-[#E7DFD5]"
            title="Inspect Vendor Profile, Audit & Orders"
            onClick={() => setSelectedDrawerVendor(vendor)}
          >
            View ↗
          </Button>

          {vendor.status === 'pending' || vendor.status === 'on_hold' ? (
            <>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<ShieldCheck size={15} />}
                title="Approve Vendor Application"
                aria-label="Approve Vendor Application"
                onClick={() => setSelectedDrawerVendor(vendor)}
              >
                Approve
              </Button>

              <Button
                variant="warning"
                size="sm"
                leftIcon={<PauseCircle size={15} />}
                className="font-bold shadow-2xs"
                title={vendor.status === 'on_hold' ? 'Re-Hold Application (Dispatch new SMTP email)' : 'Place Application On Hold'}
                aria-label="Hold or Re-Hold Application"
                onClick={() => setHoldingVendor(vendor)}
              >
                {vendor.status === 'on_hold' ? 'Re-Hold' : 'Hold'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                leftIcon={<XCircle size={15} />}
                className="text-rose-600 hover:bg-rose-50"
                title="Reject Vendor Application"
                aria-label="Reject Vendor Application"
                onClick={() => setRejectingVendor(vendor)}
              >
                Reject
              </Button>
            </>
          ) : (
            <Button
              variant={vendor.status === 'suspended' ? 'primary' : 'ghost'}
              size="sm"
              leftIcon={<Ban size={15} />}
              className={vendor.status === 'suspended' ? '' : 'text-rose-500 hover:bg-rose-500/10'}
              title={vendor.status === 'suspended' ? 'Unblock Vendor Account' : 'Block / Suspend Vendor Account'}
              aria-label={vendor.status === 'suspended' ? 'Unblock Vendor Account' : 'Block / Suspend Vendor Account'}
              onClick={() => setBlockingVendor(vendor)}
            >
              {vendor.status === 'suspended' ? 'Unblock' : 'Block'}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="vendors-page font-sans">
      <PageHeader
        title="Vendors Onboarding & Management"
        description="Review submitted registration details, approve onboarding requests, place applications on hold with document reasons, or reject vendor requests."
      />

      {/* Control Bar: Status Tabs & Search Filter */}
      <div className="vendors-control-bar glass-panel">
        <div className="vendor-tabs">
          <button
            className={`vtab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({allApplications.length})
          </button>

          <button
            className={`vtab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests ({pendingCount})
            {pendingCount > 0 && <span className="pending-badge-dot" />}
          </button>

          <button
            className={`vtab-btn ${activeTab === 'on_hold' ? 'active' : ''}`}
            onClick={() => setActiveTab('on_hold')}
          >
            On Hold ({onHoldCount})
            {onHoldCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-amber-600 text-white rounded-full ml-1">
                {onHoldCount}
              </span>
            )}
          </button>

          <button
            className={`vtab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active ({activeCount})
          </button>

          <button
            className={`vtab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected ({rejectedCount})
          </button>

          <button
            className={`vtab-btn ${activeTab === 'suspended' ? 'active' : ''}`}
            onClick={() => setActiveTab('suspended')}
          >
            Blocked ({suspendedCount})
          </button>

          <button
            className={`vtab-btn ${activeTab === 'expired' ? 'active' : ''}`}
            onClick={() => setActiveTab('expired')}
          >
            Expired ({expiredCount})
          </button>
        </div>

        <div className="vendor-control-filters">
          <select
            className="vendor-select-filter font-sans"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as VendorSortOption)}
          >
            <option value="name-asc">Sort: Store Name A – Z</option>
            <option value="name-desc">Sort: Store Name Z – A</option>
            <option value="newest">Submission: Newest First</option>
            <option value="oldest">Submission: Oldest First</option>
            <option value="revenue-desc">Highest Revenue</option>
          </select>

          <Input
            placeholder="Search by store name, owner, email, or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={16} />}
            className="vendor-search-input font-sans"
          />
        </div>
      </div>

      {/* Vendors Reusable DataTable */}
      <DataTable<Vendor>
        columns={columns}
        data={displayedVendors}
        isLoading={isLoading}
        emptyMessage={
          activeTab === 'pending'
            ? 'No pending vendor onboarding applications waiting for review.'
            : activeTab === 'on_hold'
            ? 'No vendor applications currently on hold.'
            : activeTab === 'rejected'
            ? 'No rejected vendor onboarding applications.'
            : activeTab === 'active'
            ? 'No active vendor records match your filters.'
            : activeTab === 'suspended'
            ? 'No inactive or blocked vendor records.'
            : 'No vendor records match your filters.'
        }
        onRowClick={(vendor) => setSelectedDrawerVendor(vendor)}
      />

      {/* Vendor Approval Modal */}
      <VendorApprovalModal
        isOpen={!!approvingVendor}
        onClose={() => setApprovingVendor(null)}
        onConfirmApprove={handleApprove}
        onHoldRequest={(v) => setHoldingVendor(v)}
        onRejectRequest={(v) => setRejectingVendor(v)}
        onMarkViewed={handleMarkViewed}
        vendor={approvingVendor}
        isLoading={approveVendorMutation.isPending}
      />

      {/* Vendor Hold Side Drawer */}
      <VendorHoldDrawer
        isOpen={!!holdingVendor}
        onClose={() => setHoldingVendor(null)}
        onConfirmHold={handleHold}
        vendor={holdingVendor}
        isLoading={holdVendorMutation.isPending}
      />

      {/* Vendor Rejection Side Drawer */}
      <VendorRejectDrawer
        isOpen={!!rejectingVendor}
        onClose={() => setRejectingVendor(null)}
        onConfirmReject={handleReject}
        vendor={rejectingVendor}
        isLoading={rejectVendorMutation.isPending}
      />

      {/* Vendor Block / Unblock Modal */}
      <VendorBlockConfirmModal
        isOpen={!!blockingVendor}
        onClose={() => setBlockingVendor(null)}
        onConfirm={handleToggleStatus}
        vendor={blockingVendor}
        isLoading={toggleStatusMutation.isPending}
      />

      {/* Vendor Details Drawer */}
      <VendorDetailsDrawer
        isOpen={!!selectedDrawerVendor}
        onClose={() => {
          setSelectedDrawerVendor(null);
          setIsDrawerHoldFormOpen(false);
        }}
        onToggleBlock={(v) => setBlockingVendor(v)}
        onSelectOwner={(ownerName) => setSelectedOwnerId(ownerName)}
        onConfirmApprove={(vendorId) => handleApprove(vendorId)}
        onConfirmHold={(vendorId, payload) => handleHold(vendorId, payload)}
        onMarkViewed={handleMarkViewed}
        onHold={(v) => {
          setSelectedDrawerVendor(v);
          setIsDrawerHoldFormOpen(true);
        }}
        onReject={(v) => setRejectingVendor(v)}
        vendor={selectedDrawerVendor}
        initialOpenHoldForm={isDrawerHoldFormOpen}
      />

      {/* Owner Profile CRM Drawer */}
      <PeopleDetailsDrawer
        isOpen={!!selectedOwnerId}
        onClose={() => setSelectedOwnerId(null)}
        personId={selectedOwnerId}
        onSelectVendor={(v) => setSelectedDrawerVendor(v)}
      />

      {/* Image Preview Lightbox Modal */}
      <ImagePreviewModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage?.url || ''}
        title={previewImage?.title}
        subtitle={previewImage?.subtitle}
      />
    </div>
  );
};
