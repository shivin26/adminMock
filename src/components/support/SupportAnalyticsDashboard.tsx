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

  const vendorComplaints = tickets.filter((t) => t.userType === 'vendor' || t.userType === 'user_vendor').length;
  const userComplaints = tickets.filter((t) => t.userType === 'user').length;

  const resolutionRate = totalCount > 0 
    ? `${((resolvedCount / totalCount) * 100).toFixed(1)}%` 
    : '100%';

  const urgentTickets = tickets.filter((t) => t.priority === 'urgent' || t.status === 'open').slice(0, 4);
  const slaViolations = tickets.filter((t) => (t.slaMinutesRemaining || 0) < 60 && t.status !== 'resolved').slice(0, 4);

  const handleExportAnalyticsCSV = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Tickets', totalCount],
      ['Open Tickets', openCount],
      ['In Progress', inProgressCount],
      ['Resolved', resolvedCount],
      ['CSAT Rating', '96.8%'],
      ['Avg Resolution Time', '2.4 hrs'],
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

      {/* 10 KPI Dashboard Cards with Clickable Navigation Destinations */}
      <div className="support-kpi-grid-10">
        <StatCard
          title="Total Tickets"
          value={totalCount}
          change="Real-time Platform Volume"
          isPositive={true}
          icon={<Headphones size={20} />}
          onClick={() => onNavigateToQueue && onNavigateToQueue('all')}
        />
        <StatCard
          title="Open Tickets"
          value={openCount}
          change={openCount > 0 ? "Needs Staff Action" : "Zero Pending Action"}
          isPositive={openCount === 0}
          icon={<AlertTriangle size={20} />}
          onClick={() => onNavigateToQueue && onNavigateToQueue('open')}
        />
        <StatCard
          title="Pending Queue"
          value={inProgressCount}
          change="Customer Investigation"
          isPositive={true}
          icon={<Clock size={20} />}
          onClick={() => onNavigateToQueue && onNavigateToQueue('in_progress')}
        />
        <StatCard
          title="Urgent Tickets"
          value={urgentCount}
          change={urgentCount > 0 ? "SLA Alert Active" : "No Urgent Breaches"}
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
          change="Archived Tickets"
          isPositive={true}
          icon={<XCircle size={20} />}
          onClick={() => onNavigateToQueue && onNavigateToQueue('closed')}
        />
        <StatCard
          title="Avg Resolution Time"
          value="2.4 hrs"
          change="Target: < 4 hrs"
          isPositive={true}
          icon={<TrendingUp size={20} />}
          onClick={onOpenSLA}
        />
        <StatCard
          title="Customer Satisfaction"
          value="96.8%"
          change="4.8 / 5.0 Rating"
          isPositive={true}
          icon={<Smile size={20} />}
          onClick={onOpenSettings}
        />
        <StatCard
          title="Vendor Complaints"
          value={vendorComplaints}
          change="Payout & Billing"
          isPositive={false}
          icon={<Store size={20} />}
          onClick={() => navigate('/dashboard/vendors')}
        />
        <StatCard
          title="User Complaints"
          value={userComplaints}
          change="App & Delivery Issues"
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
              <AreaChart data={DAILY_TICKETS_DATA}>
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
            <Badge variant="success">96.8% SLA Target Met</Badge>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={MONTHLY_TICKETS_DATA}>
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
            {AGENT_PERFORMANCE.map((ag) => (
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
            ))}
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
            {TOP_RECURRING_ISSUES.map((issue, idx) => (
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
            ))}
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
                <Pie data={CATEGORY_DISTRIBUTION} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {CATEGORY_DISTRIBUTION.map((entry, index) => (
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
              <BarChart data={PRIORITY_DISTRIBUTION} layout="vertical">
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
            {HEATMAP_LOAD_DATA.map((h) => (
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
            {urgentTickets.map((t) => (
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
            ))}
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
            <div
              onClick={() => onSelectTicket('t-101')}
              className="p-2.5 bg-[#FAF9F6] rounded-xl border border-[#E4DCC9] text-xs cursor-pointer hover:bg-[#EFE8D8] hover:border-[#C4A066] transition-all flex flex-col gap-0.5 shadow-xs"
            >
              <div>
                <span className="font-bold text-[#18281F]">Vikram Mehta</span> replied to ticket{' '}
                <span className="font-mono font-bold text-[#C4A066] underline">TICK-9081</span>
              </div>
              <span className="text-[10px] text-[#6B7C70]">2 hours ago • Payment settlement clearance confirmed</span>
            </div>

            <div
              onClick={() => onSelectTicket('t-102')}
              className="p-2.5 bg-[#FAF9F6] rounded-xl border border-[#E4DCC9] text-xs cursor-pointer hover:bg-[#EFE8D8] hover:border-[#C4A066] transition-all flex flex-col gap-0.5 shadow-xs"
            >
              <div>
                <span className="font-bold text-[#18281F]">Super Admin</span> added internal note on{' '}
                <span className="font-mono font-bold text-[#C4A066] underline">TICK-9082</span>
              </div>
              <span className="text-[10px] text-[#6B7C70]">1 hour ago • Security controller patch deployed</span>
            </div>

            <div
              onClick={() => onSelectTicket('t-103')}
              className="p-2.5 bg-[#FAF9F6] rounded-xl border border-[#E4DCC9] text-xs cursor-pointer hover:bg-[#EFE8D8] hover:border-[#C4A066] transition-all flex flex-col gap-0.5 shadow-xs"
            >
              <div>
                <span className="font-bold text-[#18281F]">Ananya Sharma</span> updated status of{' '}
                <span className="font-mono font-bold text-[#C4A066] underline">TICK-9083</span>
              </div>
              <span className="text-[10px] text-[#6B7C70]">3 hours ago • Marked as In Progress</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
