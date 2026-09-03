import React, { useState } from 'react';
import './SubscriptionsPage.css';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { DataTable } from '../../components/common/DataTable/DataTable';
import type { Column } from '../../components/common/DataTable/DataTable';
import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { Badge } from '../../components/common/Badge/Badge';
import { StatCard } from '../../components/common/StatCard/StatCard';
import {
  useSubscriptions,
  useSubscriptionStats,
  useRenewSubscription,
  useDownloadInvoice,
} from '../../hooks/useSubscriptions';
import { useDebounce } from '../../hooks/useDebounce';
import type { Subscription } from '../../types/subscription.types';
import { formatCurrency, formatDate } from '../../utils/formatters.utils';
import {
  RefreshCw,
  Calendar,
  Search,
  IndianRupee,
  CreditCard,
  FileText,
} from 'lucide-react';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { SubscriptionRenewalModal } from '../../components/subscriptions/SubscriptionRenewalModal';
import { SubscriptionInvoiceModal } from '../../components/subscriptions/SubscriptionInvoiceModal';

const TIER_COLORS = {
  free: '#78716C',
  pro: '#10B981',
  enterprise: '#211A19',
};


type SubTabType = 'all' | 'active' | 'pending' | 'blocked' | 'expiring_soon' | 'expired';

export const SubscriptionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SubTabType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  const { data: rawSubscriptions = [], isLoading } = useSubscriptions({
    search: debouncedSearch,
  });
  const { data: stats } = useSubscriptionStats();

  const renewMutation = useRenewSubscription();
  const downloadInvoiceMutation = useDownloadInvoice();

  // Modals state
  const [renewingSubscription, setRenewingSubscription] = useState<Subscription | null>(null);
  const [invoicingSubscription, setInvoicingSubscription] = useState<Subscription | null>(null);

  const subscriptions = Array.isArray(rawSubscriptions) ? rawSubscriptions : [];

  const activeCount = subscriptions.filter(
    (s) => s && s.daysRemaining > 0 && !s.isVendorBlocked && s.status !== 'suspended' && s.status !== 'blocked'
  ).length;
  const pendingCount = subscriptions.filter((s) => s.status === 'pending' || s.vendorStatus === 'pending').length;
  const blockedCount = subscriptions.filter((s) => s.isVendorBlocked || s.status === 'suspended' || s.status === 'blocked').length;
  const expiringSoonCount = subscriptions.filter((s) => s.daysRemaining <= 15 || s.status === 'expiring_soon').length;
  const expiredCount = subscriptions.filter((s) => s.daysRemaining === 0 || s.status === 'expired').length;

  let displayedSubscriptions = subscriptions;
  if (activeTab === 'active') {
    displayedSubscriptions = subscriptions.filter(
      (s) => s.daysRemaining > 0 && !s.isVendorBlocked && s.status !== 'suspended' && s.status !== 'blocked'
    );
  } else if (activeTab === 'pending') {
    displayedSubscriptions = subscriptions.filter((s) => s.status === 'pending' || s.vendorStatus === 'pending');
  } else if (activeTab === 'blocked') {
    displayedSubscriptions = subscriptions.filter((s) => s.isVendorBlocked || s.status === 'suspended' || s.status === 'blocked');
  } else if (activeTab === 'expiring_soon') {
    displayedSubscriptions = subscriptions.filter((s) => s.daysRemaining <= 15 || s.status === 'expiring_soon');
  } else if (activeTab === 'expired') {
    displayedSubscriptions = subscriptions.filter((s) => s.daysRemaining === 0 || s.status === 'expired');
  }

  const handleConfirmRenew = (id: string | number, durationMonths: number) => {
    renewMutation.mutate(
      { id, payload: { durationMonths } },
      {
        onSuccess: () => setRenewingSubscription(null),
      }
    );
  };

  const handleDownloadInvoice = (id: string | number) => {
    downloadInvoiceMutation.mutate(id, {
      onSuccess: () => setInvoicingSubscription(null),
    });
  };

  // Recharts Chart Dataset dynamically computed
  const tierPieData = React.useMemo(() => {
    const proCount = subscriptions.filter((s) => s.tier === 'pro').length || stats?.tierBreakdown.pro || 0;
    const entCount = subscriptions.filter((s) => s.tier === 'enterprise').length || stats?.tierBreakdown.enterprise || 0;
    const freeCount = subscriptions.filter((s) => s.tier === 'free').length || stats?.tierBreakdown.free || 0;

    return [
      { name: 'Pro Plan', value: proCount, color: TIER_COLORS.pro },
      { name: 'Enterprise Plan', value: entCount, color: TIER_COLORS.enterprise },
      { name: 'Free Tier', value: freeCount, color: TIER_COLORS.free },
    ];
  }, [subscriptions, stats]);

  const columns: Column<Subscription>[] = [
    {
      header: 'S.No.',
      cell: (_item, index) => <span className="font-mono text-xs text-[#211A19] font-bold">{index + 1}</span>,
    },

    {
      header: 'Vendor Store',
      cell: (sub) => (
        <div className="sub-vendor-cell">
          <div className="sub-avatar-icon">
            <CreditCard size={18} />
          </div>
          <div>
            <span className="sub-store-name">{sub.storeName}</span>
            <span className="sub-society">{sub.societyName}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Subscription Status',
      cell: (sub) => {
        const isPending = sub.status === 'pending' || sub.vendorStatus === 'pending';
        const isBlocked = sub.isVendorBlocked || sub.status === 'suspended' || sub.status === 'blocked';
        const hasActiveSub = sub.daysRemaining > 0;

        if (isPending) {
          return (
            <Badge variant="warning" className="bg-amber-100 text-amber-900 border-amber-300 font-bold">
              PENDING APPROVAL
            </Badge>
          );
        }

        if (isBlocked && hasActiveSub) {
          return (
            <Badge variant="warning" className="font-bold">
              BLOCKED (ACTIVE SUB)
            </Badge>
          );
        }

        if (isBlocked) {
          return <Badge variant="danger">STORE BLOCKED</Badge>;
        }

        if (hasActiveSub) {
          return <Badge variant="success">SUBSCRIBED</Badge>;
        }

        return <Badge variant="secondary">EXPIRED</Badge>;
      },
    },
    {
      header: 'Monthly Price',
      cell: (sub) => (
        <span className="price-tag">{formatCurrency(sub.price)} / mo</span>
      ),
    },
    {
      header: 'Renewal Date',
      cell: (sub) => (
        <div className="renewal-cell">
          <Calendar size={14} className="text-muted" />
          <span>{formatDate(sub.renewalDate)}</span>
        </div>
      ),
    },
    {
      header: 'Expiration Countdown',
      cell: (sub) => (
        <Badge variant={sub.daysRemaining < 15 ? 'warning' : 'info'}>
          {sub.daysRemaining} Days Remaining
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (sub) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInvoicingSubscription(sub)}
            title="Preview & Download GST Tax Invoice"
            aria-label="Preview & Download GST Tax Invoice"
          >
            <FileText size={16} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setRenewingSubscription(sub)}
            title="Renew Vendor Subscription Extension"
            aria-label="Renew Vendor Subscription Extension"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      ),
    },

  ];

  return (
    <div className="subscriptions-page">
      <PageHeader
        title="Subscriptions & Financials"
        description="Monitor active subscription plans, renewal countdown timers, and issue GST tax invoices."
      />

      {/* Summary KPI Cards */}
      <div className="kpi-grid">
        <StatCard
          title="Active Subscriptions"
          value={activeCount}
          change={`${activeCount} Active Plans`}
          isPositive={true}
          icon={<CreditCard size={22} />}
        />
        <StatCard
          title="Monthly Recurring Revenue"
          value={formatCurrency(stats?.mrr !== undefined ? stats.mrr : subscriptions.filter((s) => s.daysRemaining > 0 && !s.isVendorBlocked).reduce((sum, s) => sum + (s.price || 0), 0))}
          change="Real-time Subscriptions MRR"
          isPositive={true}
          icon={<IndianRupee size={22} />}
        />
        <StatCard
          title="Upcoming Renewals (30 Days)"
          value={`${expiringSoonCount} Vendors`}
          change={`${expiringSoonCount} Expediting Renewal`}
          isPositive={true}
          icon={<Calendar size={22} />}
        />
      </div>

      {/* Sub-Category Pill Tabs Control Bar (Styled Identically to Vendors Panel) */}
      <div className="sub-control-bar">
        <div className="sub-tabs">
          <button
            className={`stab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({subscriptions.length})
          </button>
          <button
            className={`stab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active ({activeCount})
          </button>
          <button
            className={`stab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests ({pendingCount})
            {pendingCount > 0 && <span className="pending-badge-dot" />}
          </button>
          <button
            className={`stab-btn ${activeTab === 'blocked' ? 'active' : ''}`}
            onClick={() => setActiveTab('blocked')}
          >
            Inactive / Blocked ({blockedCount})
          </button>
          <button
            className={`stab-btn ${activeTab === 'expiring_soon' ? 'active' : ''}`}
            onClick={() => setActiveTab('expiring_soon')}
          >
            Expiring Soon ({expiringSoonCount})
          </button>
          <button
            className={`stab-btn ${activeTab === 'expired' ? 'active' : ''}`}
            onClick={() => setActiveTab('expired')}
          >
            Expired ({expiredCount})
          </button>
        </div>

        <div className="sub-control-filters">
          <Input
            placeholder="Search by store name, owner, or society..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={16} />}
            className="search-input"
          />
        </div>
      </div>

      {/* Subscriptions Reusable DataTable */}
      <DataTable<Subscription>
        columns={columns}
        data={displayedSubscriptions}
        isLoading={isLoading}
        emptyMessage="No subscription records match your search parameters."
      />

      {/* Renewal Extension Modal */}
      <SubscriptionRenewalModal
        isOpen={!!renewingSubscription}
        onClose={() => setRenewingSubscription(null)}
        onConfirmRenew={handleConfirmRenew}
        subscription={renewingSubscription}
        isLoading={renewMutation.isPending}
      />

      {/* GST Tax Invoice Modal */}
      <SubscriptionInvoiceModal
        isOpen={!!invoicingSubscription}
        onClose={() => setInvoicingSubscription(null)}
        onDownload={handleDownloadInvoice}
        subscription={invoicingSubscription}
        isLoading={downloadInvoiceMutation.isPending}
      />
    </div>
  );
};
