import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OverviewPage.css';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { StatCard } from '../../components/common/StatCard/StatCard';
import { Button } from '../../components/common/Button/Button';
import { Badge } from '../../components/common/Badge/Badge';
import { useSocieties } from '../../hooks/useSocieties';
import { useVendors } from '../../hooks/useVendors';
import { usePermission } from '../../hooks/usePermission';
import { formatCurrency, formatDate } from '../../utils/formatters.utils';
import {
  IndianRupee,
  Store,
  CreditCard,
  TrendingUp,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: rawSocieties } = useSocieties();
  const { data: rawVendors } = useVendors();
  const { hasPower } = usePermission();

  const [pendingVisibleCount, setPendingVisibleCount] = React.useState(3);
  const [recentVisibleCount, setRecentVisibleCount] = React.useState(3);

  const societies = Array.isArray(rawSocieties) ? rawSocieties : [];
  const vendors = Array.isArray(rawVendors) ? rawVendors : [];

  const totalVendors = vendors.length;
  const activeVendorsCount = vendors.filter((v) => v && v.status === 'active').length;
  const pendingVendors = vendors.filter((v) => v && v.status === 'pending');
  const activeSocietiesCount = societies.filter((s) => s && s.status === 'active').length;

  const handlePendingScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 40 && pendingVisibleCount < pendingVendors.length) {
      setPendingVisibleCount((prev) => Math.min(prev + 3, pendingVendors.length));
    }
  };

  const handleRecentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 40 && recentVisibleCount < vendors.length) {
      setRecentVisibleCount((prev) => Math.min(prev + 3, vendors.length));
    }
  };

  const totalPlatformRevenue = vendors.reduce((sum, v) => sum + (v.totalEarnings || 0), 0);

  const revenueChartData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const map: Record<string, { revenue: number; vendors: number }> = {};
    months.forEach((m) => {
      map[m] = { revenue: 0, vendors: 0 };
    });

    vendors.forEach((v) => {
      const date = new Date(v.createdAt || Date.now());
      const monthStr = date.toLocaleString('en-US', { month: 'short' });
      if (map[monthStr]) {
        map[monthStr].revenue += v.totalEarnings || 0;
        map[monthStr].vendors += 1;
      }
    });

    return months.map((m) => ({
      month: m,
      revenue: map[m].revenue,
      vendors: map[m].vendors,
    }));
  }, [vendors]);

  return (
    <div className="overview-page">
      <PageHeader
        title="Dashboard"
        description="Real-time financial analytics, vendor performance, and onboarding queues."
        action={
          hasPower('VENDORS') && pendingVendors.length > 0 ? (
            <Button
              leftIcon={<UserCheck size={16} />}
              onClick={() => navigate('/dashboard/vendors?tab=pending')}
            >
              Review Pending ({pendingVendors.length})
            </Button>
          ) : undefined
        }
      />

      {/* KPI Stats Grid */}
      <div className="kpi-grid">
        {hasPower('SUBSCRIPTIONS') && (
          <StatCard
            title="Total Platform Revenue"
            value={formatCurrency(totalPlatformRevenue)}
            change={`${activeVendorsCount} Active Monetized Merchants`}
            isPositive={true}
            icon={<IndianRupee size={22} />}
            onClick={() => navigate('/dashboard/subscriptions')}
          />
        )}
        {hasPower('VENDORS') && (
          <StatCard
            title="Active Vendors"
            value={activeVendorsCount}
            change={`${pendingVendors.length} Onboarding Pending`}
            isPositive={true}
            icon={<Store size={22} />}
            onClick={() => navigate('/dashboard/vendors')}
          />
        )}
        {hasPower('SOCIETIES') && (
          <StatCard
            title="Active Societies"
            value={activeSocietiesCount}
            change={`${societies.length} Total Coverage Areas`}
            isPositive={true}
            icon={<CreditCard size={22} />}
            onClick={() => navigate('/dashboard/societies')}
          />
        )}
        {hasPower('SUBSCRIPTIONS') && (
          <StatCard
            title="Platform Growth Rate"
            value={`${totalVendors > 0 ? Math.round((activeVendorsCount / totalVendors) * 100) : 0}%`}
            change="Active Merchant Ratio"
            isPositive={true}
            icon={<TrendingUp size={22} />}
            onClick={() => navigate('/dashboard/subscriptions')}
          />
        )}
      </div>

      {/* Interactive Charts Section */}
      <div className="charts-grid">
        {hasPower('SUBSCRIPTIONS') && (
          <div className="chart-card glass-panel">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Monthly Revenue Trend (₹)</h3>
                <p className="chart-subtitle">Gross subscription revenue collected</p>
              </div>
              <Badge variant="success">Live API Sync</Badge>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8A878" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C8A878" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7DFD5" />
                  <XAxis dataKey="month" stroke="#78716C" fontSize={12} />
                  <YAxis stroke="#78716C" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FAF8F5',
                      borderColor: '#E7DFD5',
                      borderRadius: '0.875rem',
                      color: '#211A19',
                    }}
                    formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#541D26"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {hasPower('VENDORS') && (
          <div className="chart-card glass-panel">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Vendor Onboarding Growth</h3>
                <p className="chart-subtitle">New vendor registrations by month</p>
              </div>
              <Badge variant="primary">Active Expansion</Badge>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7DFD5" />
                  <XAxis dataKey="month" stroke="#78716C" fontSize={12} />
                  <YAxis stroke="#78716C" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FAF8F5',
                      borderColor: '#E7DFD5',
                      borderRadius: '0.875rem',
                      color: '#211A19',
                    }}
                  />
                  <Bar dataKey="vendors" fill="#541D26" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Widgets & Tables */}
      {hasPower('VENDORS') && (
        <div className="dashboard-widgets-grid">
          {/* Quick Pending Applications Widget */}
          <div className="widget-card glass-panel">
            <div className="widget-header">
              <div>
                <h3 className="widget-title">Pending Onboarding Requests</h3>
                <p className="widget-subtitle">Awaiting administrative payment verification</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight size={14} />}
                onClick={() => navigate('/dashboard/vendors?tab=pending')}
              >
                View All
              </Button>
            </div>

            <div className="widget-list" onScroll={handlePendingScroll}>
              {pendingVendors.length === 0 ? (
                <div className="widget-empty">
                  <span>No pending vendor requests at present.</span>
                </div>
              ) : (
                pendingVendors.slice(0, pendingVisibleCount).map((vendor) => (
                  <div
                    key={vendor.id}
                    className="widget-item cursor-pointer"
                    onClick={() => navigate('/dashboard/vendors?tab=pending')}
                  >
                    <img
                      src={vendor.avatarUrl}
                      alt={vendor.storeName}
                      className="widget-item-avatar"
                    />
                    <div className="widget-item-info">
                      <span className="widget-item-title">{vendor.storeName}</span>
                      <span className="widget-item-sub">
                        {vendor.ownerName} • {vendor.societyName}
                      </span>
                    </div>
                    <Badge variant="warning">PENDING</Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Vendors Activity Widget */}
          <div className="widget-card glass-panel">
            <div className="widget-header">
              <div>
                <h3 className="widget-title">Recently Registered Vendors</h3>
                <p className="widget-subtitle">Active sellers servicing local societies</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight size={14} />}
                onClick={() => navigate('/dashboard/vendors')}
              >
                All Vendors
              </Button>
            </div>

            <div className="widget-list" onScroll={handleRecentScroll}>
              {vendors.slice(0, recentVisibleCount).map((v) => (
                <div
                  key={v.id}
                  className="widget-item cursor-pointer"
                  onClick={() => navigate('/dashboard/vendors')}
                >
                  <img src={v.avatarUrl} alt={v.storeName} className="widget-item-avatar" />
                  <div className="widget-item-info">
                    <span className="widget-item-title">{v.storeName}</span>
                    <span className="widget-item-sub">{formatDate(v.createdAt)}</span>
                  </div>
                  <Badge variant={v.status === 'active' ? 'success' : 'warning'}>
                    {v.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
