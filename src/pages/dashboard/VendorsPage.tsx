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
  useApproveVendor,
  useRejectVendor,
  useToggleVendorStatus,
} from '../../hooks/useVendors';
import { useDebounce } from '../../hooks/useDebounce';
import type { Vendor, VendorStatus } from '../../types/vendor.types';
import { formatCurrency, getStatusBadgeVariant } from '../../utils/formatters.utils';
import { Search, XCircle, ShieldCheck, Ban, ShoppingBag } from 'lucide-react';

import { VendorApprovalModal } from '../../components/vendors/VendorApprovalModal';
import { VendorRejectModal } from '../../components/vendors/VendorRejectModal';
import { VendorDetailsDrawer } from '../../components/vendors/VendorDetailsDrawer';
import { VendorBlockConfirmModal } from '../../components/vendors/VendorBlockConfirmModal';
import { PeopleDetailsDrawer } from '../../components/people/PeopleDetailsDrawer';

type TabType = 'all' | 'pending' | 'active' | 'suspended' | 'expired';
type VendorSortOption = 'name-asc' | 'name-desc' | 'revenue-desc' | 'revenue-asc' | 'orders-desc' | 'newest' | 'oldest';

export const VendorsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const validTabs: TabType[] = ['all', 'pending', 'active', 'suspended', 'expired'];
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

  const { data: societies = [] } = useSocieties();
  const { data: rawAllVendors = [], isLoading: isLoadingAll } = useVendors({
    search: debouncedSearch,
    tier: selectedTier,
  });
  const { data: pendingVendors = [], isLoading: isLoadingPending } = usePendingVendors();

  const approveVendorMutation = useApproveVendor();
  const rejectVendorMutation = useRejectVendor();
  const toggleStatusMutation = useToggleVendorStatus();

  // Modals & Drawer State
  const [approvingVendor, setApprovingVendor] = useState<Vendor | null>(null);
  const [rejectingVendor, setRejectingVendor] = useState<Vendor | null>(null);
  const [blockingVendor, setBlockingVendor] = useState<Vendor | null>(null);
  const [selectedDrawerVendor, setSelectedDrawerVendor] = useState<Vendor | null>(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);

  // Active vendors dataset directly from backend status
  const allVendors = rawAllVendors;

  // Tab filtering logic
  const activeCount = allVendors.filter((v) => v.status === 'active').length;
  const suspendedCount = allVendors.filter((v) => v.status === 'suspended').length;
  const expiredCount = allVendors.filter((v) => v.status === 'expired').length;

  let currentDataset: Vendor[] = [];
  if (activeTab === 'pending') {
    currentDataset = pendingVendors;
  } else if (activeTab === 'active') {
    currentDataset = allVendors.filter((v) => v.status === 'active');
  } else if (activeTab === 'suspended') {
    currentDataset = allVendors.filter((v) => v.status === 'suspended');
  } else if (activeTab === 'expired') {
    currentDataset = allVendors.filter((v) => v.status === 'expired');
  } else {
    currentDataset = allVendors;
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
        return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      case 'oldest':
        return list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      default:
        return list;
    }
  }, [currentDataset, sortBy]);

  const isLoading = activeTab === 'pending' ? isLoadingPending : isLoadingAll;

  const handleApprove = (vendorId: string | number) => {
    approveVendorMutation.mutate(vendorId, {
      onSuccess: () => setApprovingVendor(null),
    });
  };

  const handleReject = (vendorId: string | number, reason?: string) => {
    rejectVendorMutation.mutate(
      { vendorId, reason },
      {
        onSuccess: () => setRejectingVendor(null),
      }
    );
  };

  const handleToggleStatus = (vendorId: string | number, status: 'active' | 'suspended') => {
    toggleStatusMutation.mutate(
      { vendorId, status },
      {
        onSuccess: () => {
          setBlockingVendor(null);
          if (selectedDrawerVendor && selectedDrawerVendor.id === String(vendorId)) {
            setSelectedDrawerVendor((prev) => (prev ? { ...prev, status } : null));
          }
        },
      }
    );
  };

  const columns: Column<Vendor>[] = [
    {
      header: 'S.No.',
      cell: (_item, index) => <span className="font-mono text-xs text-[#18281F] font-bold">{index + 1}</span>,
    },

    {
      header: 'Store & Owner',
      cell: (vendor) => (

        <div className="vendor-store-cell">
          <img src={vendor.avatarUrl} alt={vendor.storeName} className="vendor-table-logo" />
          <div>
            <span className="vendor-store-title">{vendor.storeName}</span>
            <span className="vendor-owner-title">
              {vendor.ownerName} • {vendor.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Orders & Revenue',
      cell: (vendor) => (
        <div>
          <span className="cell-primary-text font-bold text-emerald-400">
            {formatCurrency(vendor.totalEarnings)}
          </span>
          <span className="cell-sub-text flex items-center gap-1">
            <ShoppingBag size={12} /> {vendor.totalOrdersCount.toLocaleString()} Total Orders
          </span>
        </div>
      ),
    },
    {
      header: 'Society & Category',
      cell: (vendor) => (
        <div>
          <span className="cell-primary-text">{vendor.societyName}</span>
          <span className="cell-sub-text">{vendor.category}</span>
        </div>
      ),
    },
    {
      header: 'Subscription',
      cell: (vendor) => {
        const isSub = vendor.status === 'active' || vendor.subscriptionTier === 'subscribed';
        return (
          <Badge variant={isSub ? 'success' : 'warning'}>
            {isSub ? 'SUBSCRIBED' : 'NOT SUBSCRIBED'}
          </Badge>
        );
      },
    },
    {
      header: 'Status',
      cell: (vendor) => (
        <Badge variant={getStatusBadgeVariant(vendor.status)}>
          {vendor.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (vendor) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          {vendor.status === 'pending' ? (
            <>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<ShieldCheck size={16} />}
                title="Approve Vendor Application"
                aria-label="Approve Vendor Application"
                onClick={() => setApprovingVendor(vendor)}
              >
                Approve
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<XCircle size={16} />}
                className="text-rose-500 hover:bg-rose-500/10"
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
              leftIcon={<Ban size={16} />}
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
    <div className="vendors-page">
      <PageHeader
        title="Vendors Management"
        description="Monitor active vendors, pending requests, inactive accounts, and expired subscriptions."
      />

      {/* Control Bar: 4 Status Tabs & Search Filter */}
      <div className="vendors-control-bar glass-panel">
        <div className="vendor-tabs">
          <button
            className={`vtab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({allVendors.length})
          </button>
          <button
            className={`vtab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active ({activeCount})
          </button>
          <button
            className={`vtab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests ({pendingVendors.length})
            {pendingVendors.length > 0 && <span className="pending-badge-dot" />}
          </button>
          <button
            className={`vtab-btn ${activeTab === 'suspended' ? 'active' : ''}`}
            onClick={() => setActiveTab('suspended')}
          >
            Inactive / Blocked ({suspendedCount})
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
            className="vendor-select-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as VendorSortOption)}
          >
            <option value="name-asc">Sort: A – Z</option>
            <option value="name-desc">Sort: Z – A</option>
            <option value="revenue-desc">Highest Revenue</option>
            <option value="revenue-asc">Lowest Revenue</option>
            <option value="orders-desc">Most Orders</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          <select
            className="vendor-select-filter"
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
          >
            <option value="">All Subscriptions</option>
            <option value="subscribed">Subscribed</option>
            <option value="unsubscribed">Not Subscribed</option>
          </select>

          <Input
            placeholder="Search by store name, owner, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={16} />}
            className="vendor-search-input"
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
            : activeTab === 'active'
            ? 'No active vendor records match your filters.'
            : activeTab === 'suspended'
            ? 'No inactive or blocked vendor records.'
            : activeTab === 'expired'
            ? 'No expired vendor subscription accounts.'
            : 'No vendor records match your filters.'
        }
        onRowClick={(vendor) => setSelectedDrawerVendor(vendor)}
      />

      {/* Vendor Approval Modal */}
      <VendorApprovalModal
        isOpen={!!approvingVendor}
        onClose={() => setApprovingVendor(null)}
        onConfirmApprove={handleApprove}
        vendor={approvingVendor}
        isLoading={approveVendorMutation.isPending}
      />

      {/* Vendor Rejection Modal */}
      <VendorRejectModal
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
        onClose={() => setSelectedDrawerVendor(null)}
        onToggleBlock={(v) => setBlockingVendor(v)}
        onSelectOwner={(ownerName) => setSelectedOwnerId(ownerName)}
        vendor={selectedDrawerVendor}
      />

      {/* Owner Profile CRM Drawer */}
      <PeopleDetailsDrawer
        isOpen={!!selectedOwnerId}
        onClose={() => setSelectedOwnerId(null)}
        personId={selectedOwnerId}
      />
    </div>
  );
};
