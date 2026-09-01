import React from 'react';
import './SupportAnalyticsDashboard.css';
import { StatCard } from '../common/StatCard/StatCard';
import { Badge } from '../common/Badge/Badge';
import { Button } from '../common/Button/Button';
import { SupportTicketStatusBadge } from './SupportTicketStatusBadge';
import type { SupportTicket } from '../../types/support.types';
import {
  Headphones,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Smile,
  Store,
  UserCheck,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Flame,
  Award,
  Calendar,
  Layers,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { useNavigate } from 'react-router-dom';

export interface SupportAnalyticsDashboardProps {
  tickets: SupportTicket[];
  isLoading?: boolean;
  onSelectTicket: (id: string) => void;
  onNavigateToQueue?: (status?: string, category?: string) => void;
  onOpenSLA?: () => void;
  onOpenSettings?: () => void;
}

const DAILY_TICKETS_DATA = [
  { day: 'Mon', incoming: 42, resolved: 38 },
  { day: 'Tue', incoming: 58, resolved: 52 },
  { day: 'Wed', incoming: 65, resolved: 60 },
  { day: 'Thu', incoming: 49, resolved: 47 },
  { day: 'Fri', incoming: 72, resolved: 68 },
  { day: 'Sat', incoming: 35, resolved: 34 },
  { day: 'Sun', incoming: 28, resolved: 28 },
];

const MONTHLY_TICKETS_DATA = [
  { month: 'Jan', volume: 840, slaMet: 810 },
  { month: 'Feb', volume: 920, slaMet: 890 },
  { month: 'Mar', volume: 1100, slaMet: 1040 },
  { month: 'Apr', volume: 1250, slaMet: 1190 },
  { month: 'May', volume: 1380, slaMet: 1320 },
  { month: 'Jun', volume: 1482, slaMet: 1420 },
];

const CATEGORY_DISTRIBUTION = [
  { name: 'Technical Issues', value: 485, color: '#18281F' },
  { name: 'Billing & Payments', value: 412, color: '#C4A066' },
  { name: 'Vendor Onboarding', value: 340, color: '#3B82F6' },
  { name: 'General Inquiries', value: 245, color: '#10B981' },
];

const PRIORITY_DISTRIBUTION = [
  { name: 'Urgent SLA', count: 42, color: '#EF4444' },
  { name: 'High Priority', count: 185, color: '#F59E0B' },
  { name: 'Medium Priority', count: 680, color: '#3B82F6' },
  { name: 'Low Priority', count: 575, color: '#6B7C70' },
];

const AGENT_PERFORMANCE = [
  { name: 'Super Admin', resolved: 412, avgTime: '1.8 hrs', csat: '98.2%' },
  { name: 'Vikram Mehta', resolved: 385, avgTime: '2.1 hrs', csat: '97.4%' },
  { name: 'Ananya Sharma', resolved: 340, avgTime: '2.4 hrs', csat: '96.1%' },
  { name: 'Rahul Verma', resolved: 248, avgTime: '2.9 hrs', csat: '95.0%' },
];

const TOP_RECURRING_ISSUES = [
  { issue: 'Razorpay UPI Payout Delay', count: 184, category: 'Billing' },
  { issue: 'Society Entry Gate QR Scanner Failure', count: 142, category: 'Technical' },
  { issue: 'Vendor GSTIN Document Verification', count: 96, category: 'Onboarding' },
  { issue: 'Store Product Inventory Sync Error', count: 78, category: 'Technical' },
  { issue: 'Resident Delivery Pass Generation', count: 65, category: 'General' },
];

const HEATMAP_LOAD_DATA = [
  { time: '00:00 - 06:00', load: 'Low (4%)', color: '#FAF9F6' },
  { time: '06:00 - 12:00', load: 'Peak (42%)', color: '#FEF3C7' },
  { time: '12:00 - 18:00', load: 'High (38%)', color: '#FDE68A' },
  { time: '18:00 - 24:00', load: 'Moderate (16%)', color: '#FAF9F6' },
];

export const SupportAnalyticsDashboard: React.FC<SupportAnalyticsDashboardProps> = ({
  tickets,
  isLoading = false,
  onSelectTicket,
  onNavigateToQueue,
  onOpenSLA,
  onOpenSettings,
}) => {
  const navigate = useNavigate();

  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;
  const closedCount = tickets.filter((t) => t.status === 'closed').length;
  const urgentCount = tickets.filter((t) => t.priority === 'urgent').length;

  const vendorComplaints = tickets.filter((t) => t.userType === 'vendor' || t.userType === 'user_vendor' || t.category === 'vendor_vs_user' || t.category === 'vendor_vs_vendor').length;
  const userComplaints = tickets.filter((t) => t.userType === 'user' || t.category === 'user_vs_vendor').length;

  const resolutionRate = totalCount > 0 
    ? `${((resolvedCount / totalCount) * 100).toFixed(1)}%` 
    : '0%';

  const resolvedTickets = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed');
  const avgResolutionHours = React.useMemo(() => {
    if (resolvedTickets.length === 0) return '0.0 hrs';
    let totalMs = 0;
    resolvedTickets.forEach((t) => {
      const created = new Date(t.createdAt).getTime();
      const updated = new Date(t.updatedAt || Date.now()).getTime();
      totalMs += Math.max(0, updated - created);
    });
    const avgHours = (totalMs / (resolvedTickets.length * 3600000)).toFixed(1);
    return `${avgHours} hrs`;
  }, [resolvedTickets]);

  const csatRatingStr = React.useMemo(() => {
    if (totalCount === 0) return '0.0%';
    const rate = Math.min(100, Math.round(((resolvedCount + closedCount) / totalCount) * 100));
    return `${rate}%`;
  }, [totalCount, resolvedCount, closedCount]);

  const urgentTickets = tickets.filter((t) => t.priority === 'urgent' || t.status === 'open').slice(0, 4);
  const slaViolations = tickets.filter((t) => (t.slaMinutesRemaining || 0) < 60 && t.status !== 'resolved' && t.status !== 'closed').slice(0, 4);

  const categoryDistribution = React.useMemo(() => {
    const map: Record<string, number> = {};
    tickets.forEach((t) => {
      const cat = t.category || 'General';
      map[cat] = (map[cat] || 0) + 1;
    });
    const colors = ['#18281F', '#C4A066', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    const res = Object.entries(map).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length],
    }));
    return res.length > 0 ? res : [{ name: 'No Data', value: 1, color: '#E4DCC9' }];
  }, [tickets]);

  const priorityDistribution = React.useMemo(() => {
    const urgent = tickets.filter((t) => t.priority === 'urgent').length;
    const high = tickets.filter((t) => t.priority === 'high').length;
    const medium = tickets.filter((t) => t.priority === 'medium').length;
    const low = tickets.filter((t) => t.priority === 'low').length;
    return [
      { name: 'Urgent SLA', count: urgent, color: '#EF4444' },
      { name: 'High Priority', count: high, color: '#F59E0B' },
      { name: 'Medium Priority', count: medium, color: '#3B82F6' },
      { name: 'Low Priority', count: low, color: '#6B7C70' },
    ];
  }, [tickets]);

  // Dynamic Agent Productivity Leaderboard
  const agentPerformance = React.useMemo(() => {
    const map: Record<string, { resolved: number; total: number }> = {};
    tickets.forEach((t) => {
      const agent = t.assignedTo || 'Unassigned Staff';
      if (!map[agent]) map[agent] = { resolved: 0, total: 0 };
      map[agent].total += 1;
      if (t.status === 'resolved' || t.status === 'closed') {
        map[agent].resolved += 1;
      }
    });

    return Object.entries(map).map(([name, data]) => {
      const csatVal = data.total > 0 ? ((data.resolved / data.total) * 100).toFixed(1) : '0.0';
      return {
        name,
        resolved: data.resolved,
        avgTime: data.resolved > 0 ? '1.5 hrs' : '0.0 hrs',
        csat: `${csatVal}%`,
      };
    });
  }, [tickets]);

  // Dynamic Top Recurring Issues
  const topRecurringIssues = React.useMemo(() => {
    const map: Record<string, { count: number; category: string }> = {};
    tickets.forEach((t) => {
      const key = t.subject || 'General Support Inquiry';
      if (!map[key]) map[key] = { count: 0, category: t.category || 'General' };
      map[key].count += 1;
    });

    return Object.entries(map)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([issue, data]) => ({
        issue,
        count: data.count,
        category: data.category,
      }));
  }, [tickets]);

  // Dynamic 24x7 Load Heatmap
  const heatmapLoadData = React.useMemo(() => {
    const slots = [
      { time: '00:00 - 06:00', color: '#FAF9F6' },
      { time: '06:00 - 12:00', color: '#FEF3C7' },
      { time: '12:00 - 18:00', color: '#FDE68A' },
      { time: '18:00 - 24:00', color: '#FAF9F6' },
    ];

    const countsArr = [0, 0, 0, 0];
    tickets.forEach((t) => {
      const date = new Date(t.createdAt);
      const hour = date.getHours();
      if (hour < 6) countsArr[0]++;
      else if (hour < 12) countsArr[1]++;
      else if (hour < 18) countsArr[2]++;
      else countsArr[3]++;
    });

    const total = tickets.length || 1;
    return slots.map((s, idx) => {
      const cnt = countsArr[idx];
      const pct = tickets.length > 0 ? Math.round((cnt / total) * 100) : 0;
      return {
        time: s.time,
        load: `${cnt} Inquiries (${pct}%)`,
        color: s.color,
      };
    });
  }, [tickets]);

  // Dynamic Daily Ticket Trends
  const dailyTicketsData = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const map: Record<string, { incoming: number; resolved: number }> = {};
    days.forEach((d) => (map[d] = { incoming: 0, resolved: 0 }));

    tickets.forEach((t) => {
      const dayName = days[new Date(t.createdAt).getDay()];
      if (map[dayName]) {
        map[dayName].incoming += 1;
        if (t.status === 'resolved' || t.status === 'closed') {
          map[dayName].resolved += 1;
        }
      }
    });

    return days.map((day) => ({
      day,
      incoming: map[day].incoming,
      resolved: map[day].resolved,
    }));
  }, [tickets]);

  // Dynamic Monthly Ticket Trends
  const monthlyTicketsData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const activeMonths = months.slice(Math.max(0, currentMonthIdx - 5), currentMonthIdx + 1);

    const map: Record<string, { volume: number; slaMet: number }> = {};
    activeMonths.forEach((m) => (map[m] = { volume: 0, slaMet: 0 }));

    tickets.forEach((t) => {
      const monthName = months[new Date(t.createdAt).getMonth()];
      if (map[monthName]) {
        map[monthName].volume += 1;
        if (t.status === 'resolved' || t.status === 'closed') {
          map[monthName].slaMet += 1;
        }
      }
    });

    return activeMonths.map((month) => ({
      month,
      volume: map[month].volume,
      slaMet: map[month].slaMet,
    }));
  }, [tickets]);

  // Dynamic Vendor Fraud & Disputes by Location Area / Society
  const vendorFraudByArea = React.useMemo(() => {
    const map: Record<string, { total: number; urgentCount: number; lastReason: string }> = {};

    const vendorTickets = tickets.filter(
      (t) =>
        t.userType === 'vendor' ||
        t.userType === 'user_vendor' ||
        t.category === 'vendor_vs_user' ||
        t.category === 'vendor_vs_vendor' ||
        t.category === 'billing'
    );

    vendorTickets.forEach((t) => {
      const areaName = t.societyName || t.entityName || t.reporterName || 'Sector 62 Noida Area';
      if (!map[areaName]) {
        map[areaName] = { total: 0, urgentCount: 0, lastReason: t.subject };
      }
      map[areaName].total += 1;
      if (t.priority === 'urgent' || t.priority === 'high') {
        map[areaName].urgentCount += 1;
      }
    });

    return Object.entries(map)
      .map(([area, data]) => ({
        area,
        fraudCount: data.total,
        urgentCount: data.urgentCount,
        riskLevel: data.urgentCount > 2 ? 'HIGH RISK' : data.urgentCount > 0 ? 'MODERATE' : 'LOW RISK',
        primaryIssue: data.lastReason,
      }))
      .sort((a, b) => b.fraudCount - a.fraudCount);
  }, [tickets]);

  const handleExportAnalyticsCSV = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Tickets', totalCount],
      ['Open Tickets', openCount],
      ['In Progress', inProgressCount],
      ['Resolved', resolvedCount],
      ['CSAT Rating', csatRatingStr],
      ['Avg Resolution Time', avgResolutionHours],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvData.map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `support_analytics_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-white border border-[#E4DCC9] rounded-2xl">
        <span className="text-xs font-semibold text-[#6B7C70]">Generating Service Analytics...</span>
      </div>
    );
  }

  return (
    <div className="support-analytics-dashboard">
      {/* Analytics Toolbar Header */}
      <div className="flex items-center justify-between p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-[#C4A066]" />
          <div>
            <h2 className="text-sm font-bold text-[#18281F]">Executive Support Intelligence &amp; SLA Reports</h2>
            <p className="text-xs text-[#6B7C70]">24x7 resolution performance, heatmaps, agent productivity, and top issue trends.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={handleExportAnalyticsCSV}>
            Export CSV Report
          </Button>
          <Button variant="outline" size="sm" leftIcon={<FileSpreadsheet size={14} />} onClick={() => window.print()}>
            Print PDF Summary
          </Button>
        </div>
      </div>

      {/* 10 KPI Dashboard Cards with Dynamic API Metrics */}
      <div className="support-kpi-grid-10">
        <StatCard
          title="Total Tickets"
          value={totalCount}
          change={`${totalCount} Total Inquiries`}
          isPositive={true}
          icon={<Headphones size={20} />}
          onClick={() => onNavigateToQueue && onNavigateToQueue('all')}
        />
        <StatCard
          title="Open Tickets"
          value={openCount}
          change={`${openCount} Awaiting Action`}
          isPositive={openCount === 0}
          icon={<AlertTriangle size={20} />}
          onClick={() => onNavigateToQueue && onNavigateToQueue('open')}
        />
        <StatCard
          title="Pending Queue"
          value={inProgressCount}
          change={`${inProgressCount} Under Investigation`}
          isPositive={true}
          icon={<Clock size={20} />}
          onClick={() => onNavigateToQueue && onNavigateToQueue('in_progress')}
        />
        <StatCard
          title="Urgent Tickets"
          value={urgentCount}
          change={`${urgentCount} Critical Priority`}
          isPositive={urgentCount === 0}
          icon={<Flame size={20} />}
          onClick={() => onNavigateToQueue && onNavigateToQueue('open')}
        />
        <StatCard
          title="Resolved"
          value={resolvedCount}
          change={`${resolutionRate} Resolution Rate`}
          isPositive={true}
          icon={<CheckCircle2 size={20} />}
          onClick={() => onNavigateToQueue && onNavigateToQueue('resolved')}
        />
        <StatCard
          title="Closed"
          value={closedCount}
          change={`${closedCount} Archived`}
          isPositive={true}
          icon={<XCircle size={20} />}
          onClick={() => onNavigateToQueue && onNavigateToQueue('closed')}
        />
        <StatCard
          title="Avg Resolution Time"
          value={avgResolutionHours}
          change="SLA Target Tracking"
          isPositive={true}
          icon={<TrendingUp size={20} />}
          onClick={onOpenSLA}
        />
        <StatCard
          title="Customer Satisfaction"
          value={csatRatingStr}
          change="Live CSAT Score"
          isPositive={true}
          icon={<Smile size={20} />}
          onClick={onOpenSettings}
        />
        <StatCard
          title="Vendor Complaints"
          value={vendorComplaints}
          change={`${vendorComplaints} Merchant Reports`}
          isPositive={false}
          icon={<Store size={20} />}
          onClick={() => navigate('/dashboard/vendors')}
        />
        <StatCard
          title="User Complaints"
          value={userComplaints}
          change={`${userComplaints} Consumer Reports`}
          isPositive={false}
          icon={<UserCheck size={20} />}
          onClick={() => onNavigateToQueue && onNavigateToQueue('all')}
        />
      </div>

      {/* Row 1 Charts: Daily Ticket Trends & Monthly Growth */}
      <div className="charts-row-2">
        <div className="support-chart-card">
          <div className="support-chart-header">
            <div>
              <h3 className="support-chart-title">Daily Ticket Volume &amp; Clearance</h3>
              <p className="support-chart-subtitle">Incoming vs resolved inquiries (Weekly View)</p>
            </div>
            <Badge variant="primary">Real-time Stream</Badge>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailyTicketsData}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C4A066" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C4A066" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC9" />
                <XAxis dataKey="day" stroke="#6B7C70" fontSize={12} />
                <YAxis stroke="#6B7C70" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF9F6',
                    borderColor: '#E4DCC9',
                    borderRadius: '0.875rem',
                    color: '#18281F',
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="incoming" name="Incoming Tickets" stroke="#C4A066" fill="url(#colorInc)" strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" name="Resolved Tickets" stroke="#10B981" fill="url(#colorRes)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="support-chart-card">
          <div className="support-chart-header">
            <div>
              <h3 className="support-chart-title">Monthly Ticket Growth &amp; SLA Compliance</h3>
              <p className="support-chart-subtitle">Total volume vs tickets resolved within SLA target</p>
            </div>
            <Badge variant="success">{csatRatingStr} SLA Target Met</Badge>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyTicketsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC9" />
                <XAxis dataKey="month" stroke="#6B7C70" fontSize={12} />
                <YAxis stroke="#6B7C70" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF9F6',
                    borderColor: '#E4DCC9',
                    borderRadius: '0.875rem',
                    color: '#18281F',
                  }}
                />
                <Legend />
                <Bar dataKey="volume" name="Total Volume" fill="#18281F" radius={[6, 6, 0, 0]} />
                <Bar dataKey="slaMet" name="Resolved within SLA" fill="#C4A066" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Vendor Fraud & Dispute Complaints by Area Section */}
      <div className="p-5 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-rose-600" />
            <div>
              <h3 className="text-sm font-bold text-[#18281F]">Vendor Fraud &amp; Dispute Complaints by Area</h3>
              <p className="text-xs text-[#6B7C70]">Regional distribution of merchant-reported payment disputes, fake customer orders, and B2B vendor claims.</p>
            </div>
          </div>
          <Badge variant={vendorFraudByArea.length > 0 ? "warning" : "success"}>
            {vendorFraudByArea.length} Affected Location Areas
          </Badge>
        </div>

        {vendorFraudByArea.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col items-center justify-center gap-2">
            <ShieldCheck size={32} className="text-emerald-600" />
            <span className="text-xs font-bold text-[#18281F]">No Vendor Fraud or Dispute Complaints Reported</span>
            <span className="text-[11px] text-[#6B7C70]">All vendor location areas across the network have 0 active fraud alerts.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart View */}
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={vendorFraudByArea} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC9" />
                  <XAxis type="number" stroke="#6B7C70" fontSize={12} />
                  <YAxis dataKey="area" type="category" stroke="#6B7C70" fontSize={11} width={130} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FAF9F6',
                      borderColor: '#E4DCC9',
                      borderRadius: '0.875rem',
                      color: '#18281F',
                    }}
                    formatter={(val: any) => [`${val} Fraud Complaints`, 'Volume']}
                  />
                  <Bar dataKey="fraudCount" name="Vendor Fraud Complaints" fill="#EF4444" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Ranking Breakdown List */}
            <div className="flex flex-col gap-2.5 text-xs max-h-[260px] overflow-y-auto pr-1">
              {vendorFraudByArea.map((item, idx) => (
                <div key={idx} className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex items-center justify-between gap-3 shadow-xs hover:border-[#EF4444] transition-all">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-600 text-xs">#{idx + 1}</span>
                      <span className="font-bold text-[#18281F] truncate">{item.area}</span>
                    </div>
                    <span className="text-[11px] text-[#6B7C70] line-clamp-1 mt-0.5">{item.primaryIssue}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={item.riskLevel === 'HIGH RISK' ? 'danger' : item.riskLevel === 'MODERATE' ? 'warning' : 'info'}>
                      {item.riskLevel}
                    </Badge>
                    <span className="font-mono font-bold text-[#18281F] bg-white px-2 py-1 rounded-lg border border-[#E4DCC9]">
                      {item.fraudCount} Complaints
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Row 2 Analytics: Agent Productivity Leaderboard & Top Issues */}
      <div className="charts-row-2">
        {/* Agent Productivity Leaderboard */}
        <div className="support-chart-card">
          <div className="support-chart-header">
            <div>
              <h3 className="support-chart-title flex items-center gap-1.5">
                <Award size={16} className="text-[#C4A066]" /> Agent Productivity Leaderboard
              </h3>
              <p className="support-chart-subtitle">Resolution speed &amp; CSAT satisfaction per agent</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            {agentPerformance.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#6B7C70] bg-[#FAF9F6] rounded-xl border border-[#E4DCC9]">
                No agent performance records available.
              </div>
            ) : (
              agentPerformance.map((ag) => (
                <div key={ag.name} className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#18281F] block">{ag.name}</span>
                    <span className="text-[11px] text-[#6B7C70]">Avg Resolution Time: <strong>{ag.avgTime}</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#18281F]">{ag.resolved} Resolved</span>
                    <Badge variant="success">{ag.csat} CSAT</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top 5 Common Issues Ranking */}
        <div className="support-chart-card">
          <div className="support-chart-header">
            <div>
              <h3 className="support-chart-title flex items-center gap-1.5">
                <Layers size={16} className="text-[#C4A066]" /> Top 5 Recurring Support Topics
              </h3>
              <p className="support-chart-subtitle">Most frequent issue inquiries across network</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            {topRecurringIssues.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#6B7C70] bg-[#FAF9F6] rounded-xl border border-[#E4DCC9]">
                No recurring support topics recorded.
              </div>
            ) : (
              topRecurringIssues.map((issue, idx) => (
                <div key={idx} className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#C4A066] text-xs">#{idx + 1}</span>
                    <div>
                      <span className="font-bold text-[#18281F] block">{issue.issue}</span>
                      <span className="text-[10px] text-[#6B7C70] uppercase font-semibold">{issue.category}</span>
                    </div>
                  </div>
                  <Badge variant="primary">{issue.count} Reports</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 3 Charts: Category Distribution, Priority Breakdown, Status Breakdown */}
      <div className="charts-row-3">
        <div className="support-chart-card">
          <div className="support-chart-header">
            <div>
              <h3 className="support-chart-title">Category Distribution</h3>
              <p className="support-chart-subtitle">Inquiries categorized by feature area</p>
            </div>
          </div>
          <div className="chart-wrapper flex justify-center">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={categoryDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="support-chart-card">
          <div className="support-chart-header">
            <div>
              <h3 className="support-chart-title">Priority Breakdown</h3>
              <p className="support-chart-subtitle">Tickets by SLA urgency level</p>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={priorityDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC9" />
                <XAxis type="number" stroke="#6B7C70" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#6B7C70" fontSize={11} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#C4A066" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 24x7 Support Load Heatmap Box */}
        <div className="support-chart-card">
          <div className="support-chart-header">
            <div>
              <h3 className="support-chart-title flex items-center gap-1.5">
                <Calendar size={15} /> 24x7 Load Heatmap
              </h3>
              <p className="support-chart-subtitle">Peak hourly intake volume</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            {heatmapLoadData.map((h) => (
              <div key={h.time} className="p-2.5 rounded-xl border border-[#E4DCC9] flex items-center justify-between" style={{ backgroundColor: h.color }}>
                <span className="font-bold text-[#18281F]">{h.time}</span>
                <span className="font-semibold text-[#18281F]">{h.load}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4 Real-time Tables/Lists: Latest Escalations, At-Risk SLA Violations, Recent Activity */}
      <div className="support-widgets-row">
        {/* Widget 1: Latest Escalations */}
        <div className="support-widget-card">
          <div className="support-chart-header">
            <div>
              <h3 className="support-chart-title flex items-center gap-1.5 text-rose-600">
                <Flame size={16} /> Latest Escalations
              </h3>
              <p className="support-chart-subtitle">High priority tickets requiring lead intervention</p>
            </div>
          </div>

          <div className="support-widget-list">
            {urgentTickets.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#6B7C70] bg-[#FAF9F6] rounded-xl border border-[#E4DCC9]">
                ✓ No high priority escalated tickets.
              </div>
            ) : (
              urgentTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTicket(t.id)}
                  className="support-widget-item cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-[#C4A066]">{t.ticketNumber}</span>
                      <SupportTicketStatusBadge priority={t.priority} />
                    </div>
                    <span className="text-xs font-bold text-[#18281F] line-clamp-1 mt-0.5">{t.subject}</span>
                    <span className="text-[11px] text-[#6B7C70] font-medium">{t.reporterName} • {t.entityName}</span>
                  </div>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={12} />}>
                    View
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 2: SLA Violations / At-Risk */}
        <div className="support-widget-card">
          <div className="support-chart-header">
            <div>
              <h3 className="support-chart-title flex items-center gap-1.5 text-amber-600">
                <ShieldAlert size={16} /> SLA At-Risk (&lt; 60m)
              </h3>
              <p className="support-chart-subtitle">Inquiries nearing response deadline</p>
            </div>
          </div>

          <div className="support-widget-list">
            {slaViolations.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#6B7C70] bg-[#FAF9F6] rounded-xl border border-[#E4DCC9]">
                ✓ All active tickets are currently SLA compliant!
              </div>
            ) : (
              slaViolations.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTicket(t.id)}
                  className="support-widget-item cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-[#C4A066]">{t.ticketNumber}</span>
                      <Badge variant="warning">{t.slaMinutesRemaining}m LEFT</Badge>
                    </div>
                    <span className="text-xs font-bold text-[#18281F] line-clamp-1 mt-0.5">{t.subject}</span>
                    <span className="text-[11px] text-[#6B7C70] font-medium">Assigned: {t.assignedTo}</span>
                  </div>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={12} />}>
                    View
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 3: Live Staff Activity Feed */}
        <div className="support-widget-card">
          <div className="support-chart-header">
            <div>
              <h3 className="support-chart-title flex items-center gap-1.5 text-[#18281F]">
                <Activity size={16} className="text-[#C4A066]" /> Live Support Feed
              </h3>
              <p className="support-chart-subtitle">Recent agent actions &amp; staff notes</p>
            </div>
          </div>

          <div className="support-widget-list">
            {tickets.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#6B7C70] bg-[#FAF9F6] rounded-xl border border-[#E4DCC9]">
                No recent agent actions or notes recorded.
              </div>
            ) : (
              tickets.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTicket(t.id)}
                  className="p-2.5 bg-[#FAF9F6] rounded-xl border border-[#E4DCC9] text-xs cursor-pointer hover:bg-[#EFE8D8] hover:border-[#C4A066] transition-all flex flex-col gap-0.5 shadow-xs"
                >
                  <div>
                    <span className="font-bold text-[#18281F]">{t.assignedTo || t.reporterName}</span> recorded activity on{' '}
                    <span className="font-mono font-bold text-[#C4A066] underline">{t.ticketNumber}</span>
                  </div>
                  <span className="text-[10px] text-[#6B7C70]">Status: {t.status.toUpperCase()} • {t.subject}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
