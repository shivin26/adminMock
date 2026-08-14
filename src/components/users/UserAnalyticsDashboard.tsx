import React, { useState } from 'react';
import { StatCard } from '../common/StatCard/StatCard';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import { useToast } from '../../context/ToastContext';
import { usePeopleList } from '../../hooks/usePeopleList';
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Activity,
  IndianRupee,
  ShoppingBag,
  AlertTriangle,
  RotateCcw,
  Download,
  FileSpreadsheet,
  Printer,
  Award,
  Building2,
  Percent,
} from 'lucide-react';

// Registration Growth Chart Data
const REGISTRATION_GROWTH_DATA = [
  { month: 'Jan', newUsers: 120, totalUsers: 450 },
  { month: 'Feb', newUsers: 180, totalUsers: 630 },
  { month: 'Mar', newUsers: 240, totalUsers: 870 },
  { month: 'Apr', newUsers: 310, totalUsers: 1180 },
  { month: 'May', newUsers: 420, totalUsers: 1600 },
  { month: 'Jun', newUsers: 590, totalUsers: 2190 },
  { month: 'Jul', newUsers: 730, totalUsers: 2920 },
];

// Daily Active Users (DAU) 14-day Data
const DAU_DATA = [
  { day: 'Jul 25', dau: 420 },
  { day: 'Jul 26', dau: 480 },
  { day: 'Jul 27', dau: 510 },
  { day: 'Jul 28', dau: 490 },
  { day: 'Jul 29', dau: 560 },
  { day: 'Jul 30', dau: 630 },
  { day: 'Jul 31', dau: 680 },
  { day: 'Aug 01', dau: 710 },
  { day: 'Aug 02', dau: 690 },
  { day: 'Aug 03', dau: 750 },
  { day: 'Aug 04', dau: 820 },
  { day: 'Aug 05', dau: 890 },
  { day: 'Aug 06', dau: 940 },
  { day: 'Aug 07', dau: 1020 },
];

// Monthly Active Users (MAU) 6-month Data
const MAU_DATA = [
  { month: 'Feb', mau: 580, activePercentage: 92 },
  { month: 'Mar', mau: 810, activePercentage: 93 },
  { month: 'Apr', mau: 1090, activePercentage: 92 },
  { month: 'May', mau: 1480, activePercentage: 92 },
  { month: 'Jun', mau: 2010, activePercentage: 91 },
  { month: 'Jul', mau: 2680, activePercentage: 91 },
];

// Top Societies Distribution Data
const TOP_SOCIETIES_DATA = [
  { society: 'Anupam Society', users: 840, orders: 3420, fill: '#18281F' },
  { society: 'Greenwood Heights', users: 650, orders: 2890, fill: '#C4A066' },
  { society: 'Prestige Heights', users: 510, orders: 2150, fill: '#D97706' },
  { society: 'Sunrise Apartments', users: 430, orders: 1780, fill: '#059669' },
  { society: 'Others', users: 490, orders: 1940, fill: '#6B7C70' },
];

// Top Customers Leaderboard
const TOP_CUSTOMERS_DATA = [
  { rank: 1, name: 'Priya Verma', email: 'priya.verma@gmail.com', society: 'Greenwood Heights', orders: 65, totalSpend: 42300 },
  { rank: 2, name: 'Aarav Gupta', email: 'aarav.retail@gmail.com', society: 'Anupam Society', orders: 42, totalSpend: 28900 },
  { rank: 3, name: 'Commander V.K. Nair', email: 'vknair.resident@gmail.com', society: 'Anupam Society', orders: 28, totalSpend: 14500 },
  { rank: 4, name: 'Rajesh Sharma', email: 'rajesh.freshbites@gmail.com', society: 'Prestige Heights', orders: 15, totalSpend: 8400 },
  { rank: 5, name: 'Siddharth Rao', email: 'siddharth@gmail.com', society: 'Sunrise Apartments', orders: 14, totalSpend: 7800 },
];

// Retention & Engagement Pie
const RETENTION_PIE_DATA = [
  { name: 'Retained Users (Repeat Buyers)', value: 88.5, color: '#059669' },
  { name: 'New Users (1st Month)', value: 8.2, color: '#C4A066' },
  { name: 'Churn Risk Users', value: 3.3, color: '#E11D48' },
];

export const UserAnalyticsDashboard: React.FC = () => {
  const { addToast } = useToast();
  const { data: people = [] } = usePeopleList();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const totalRegistered = people.length || 15;

  // Export CSV
  const handleExportCSV = () => {
    const csvRows = [
      ['Metric / Dimension', 'Value', 'Benchmark / Target'],
      ['Average Spend per User', '₹3,450', '₹3,000 Target'],
      ['Average Orders per User', '4.2 orders/mo', '4.0 Target'],
      ['Complaint Rate', '2.4%', '< 3.0% SLA'],
      ['Refund Rate', '1.1%', '< 2.0% SLA'],
      ['30-Day User Retention', '88.5%', '> 85.0% Target'],
      ['Daily Active Users (DAU)', '1,020', 'Peak High'],
      ['Monthly Active Users (MAU)', String(totalRegistered), 'Live Backend Users'],
      ['Total Registered Directory Users', String(totalRegistered), 'All Time'],
    ];

    const csvContent = csvRows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user_analytics_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    addToast({
      type: 'success',
      title: 'Analytics CSV Downloaded',
      description: 'Exported User Analytics metrics summary to CSV.',
    });
  };

  // Export Excel
  const handleExportExcel = () => {
    let html = `<table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>`;
    html += `<tr><td>Average Spend</td><td>₹3,450</td></tr>`;
    html += `<tr><td>Average Orders</td><td>4.2 orders/mo</td></tr>`;
    html += `<tr><td>Complaint Rate</td><td>2.4%</td></tr>`;
    html += `<tr><td>Refund Rate</td><td>1.1%</td></tr>`;
    html += `<tr><td>Retention Rate</td><td>88.5%</td></tr>`;
    html += `</tbody></table>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user_analytics_excel_${Date.now()}.xls`;
    link.click();

    addToast({
      type: 'success',
      title: 'Analytics Excel Downloaded',
      description: 'Exported User Analytics report to Excel spreadsheet.',
    });
  };

  // Export PDF / Print
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Analytics Toolbar Header */}
      <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-[#C4A066]" />
          <div>
            <h2 className="font-bold text-[#18281F] text-base font-serif">Enterprise User Analytics Dashboard</h2>
            <p className="text-xs text-[#6B7C70]">Live telemetry on growth, active user retention, spending patterns &amp; complaint ratios.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-xs">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  timeRange === range ? 'bg-[#18281F] text-white shadow-2xs' : 'text-[#6B7C70] hover:text-[#18281F]'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Export Toolbar */}
          <Button variant="outline" size="sm" leftIcon={<Download size={13} />} onClick={handleExportCSV}>
            CSV
          </Button>
          <Button variant="outline" size="sm" leftIcon={<FileSpreadsheet size={13} className="text-emerald-600" />} onClick={handleExportExcel}>
            Excel
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Printer size={13} className="text-indigo-600" />} onClick={handleExportPDF}>
            PDF
          </Button>
        </div>
      </div>

      {/* 5 Key Metric Cards (Average Spend, Average Orders, Complaint Rate, Refund Rate, Retention) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Average Spend / User"
          value="₹3,450"
          subtitle="Monthly GMV per active user"
          icon={<IndianRupee size={20} className="text-emerald-700" />}
          change="+14.2%"
          isPositive={true}
        />

        <StatCard
          title="Average Orders / User"
          value="4.2"
          subtitle="Orders placed per month"
          icon={<ShoppingBag size={20} className="text-[#C4A066]" />}
          change="+8.6%"
          isPositive={true}
        />

        <StatCard
          title="Complaint Rate"
          value="2.4%"
          subtitle="Support tickets per 100 orders"
          icon={<AlertTriangle size={20} className="text-amber-500" />}
          change="-0.8%"
          isPositive={true}
        />

        <StatCard
          title="Refund Rate"
          value="1.1%"
          subtitle="Refund claims / total GMV"
          icon={<Percent size={20} className="text-rose-500" />}
          change="-0.3%"
          isPositive={true}
        />

        <StatCard
          title="30-Day Retention"
          value="88.5%"
          subtitle="Repeat purchasing cohort"
          icon={<RotateCcw size={20} className="text-indigo-600" />}
          change="+3.4%"
          isPositive={true}
        />
      </div>

      {/* Row 1: Registration Growth & Daily Active Users (DAU) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Registration Growth */}
        <div className="p-5 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#C4A066]" />
              <h3 className="font-bold text-[#18281F] text-sm">Registration Growth Curve</h3>
            </div>
            <Badge variant="primary">MONTHLY TREND</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REGISTRATION_GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C4A066" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C4A066" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC9" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7C70' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7C70' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18281F', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="totalUsers" stroke="#C4A066" strokeWidth={2.5} fillOpacity={1} fill="url(#userGrad)" name="Total Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Daily Active Users (DAU) */}
        <div className="p-5 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-[#D97706]" />
              <h3 className="font-bold text-[#18281F] text-sm">Daily Active Users (DAU - 14 Days)</h3>
            </div>
            <Badge variant="success">1,020 PEAK DAU</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DAU_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC9" opacity={0.6} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6B7C70' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7C70' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18281F', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="dau" fill="#18281F" radius={[6, 6, 0, 0]} name="Active Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Monthly Active Users (MAU) & Top Societies Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 3: Monthly Active Users (MAU) - 7 Cols */}
        <div className="lg:col-span-7 p-5 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-emerald-700" />
              <h3 className="font-bold text-[#18281F] text-sm">Monthly Active Users (MAU Trend)</h3>
            </div>
            <span className="text-xs text-[#6B7C70] font-semibold">91% Monthly Active Engagement</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MAU_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC9" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7C70' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7C70' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18281F', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="mau" fill="#059669" radius={[6, 6, 0, 0]} name="MAU Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Top Societies Breakdown - 5 Cols */}
        <div className="lg:col-span-5 p-5 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-[#C4A066]" />
              <h3 className="font-bold text-[#18281F] text-sm">Top Societies by User Volume</h3>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            {TOP_SOCIETIES_DATA.map((soc) => (
              <div key={soc.society} className="flex flex-col gap-1">
                <div className="flex items-center justify-between font-semibold text-[#18281F]">
                  <span>{soc.society}</span>
                  <span>{soc.users} users ({soc.orders} orders)</span>
                </div>
                <div className="w-full bg-[#FAF9F6] h-2.5 rounded-full overflow-hidden border border-[#E4DCC9]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(soc.users / 840) * 100}%`,
                      backgroundColor: soc.fill,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Top Customers Leaderboard & User Retention Cohort Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table/Leaderboard: Top Customers - 7 Cols */}
        <div className="lg:col-span-7 p-5 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              <h3 className="font-bold text-[#18281F] text-sm">Top Customer Leaderboard (Highest GMV)</h3>
            </div>
            <Badge variant="warning">VIP RESIDENTS</Badge>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#FAF9F6] border-b border-[#E4DCC9] text-[#6B7C70] uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-2.5 w-8">Rank</th>
                  <th className="p-2.5">Resident Customer</th>
                  <th className="p-2.5">Society</th>
                  <th className="p-2.5 text-center">Orders</th>
                  <th className="p-2.5 text-right">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DCC9]/60">
                {TOP_CUSTOMERS_DATA.map((cust) => (
                  <tr key={cust.rank} className="hover:bg-[#FAF9F6]">
                    <td className="p-2.5 font-bold font-mono text-[#C4A066]">#{cust.rank}</td>
                    <td className="p-2.5 font-bold text-[#18281F]">
                      <div className="flex flex-col">
                        <span>{cust.name}</span>
                        <span className="text-[10px] text-[#6B7C70] font-normal">{cust.email}</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-[#6B7C70] font-medium">{cust.society}</td>
                    <td className="p-2.5 text-center font-bold text-[#18281F]">{cust.orders}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                      ₹{cust.totalSpend.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart 5: User Retention Cohorts - 5 Cols */}
        <div className="lg:col-span-5 p-5 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw size={18} className="text-indigo-600" />
              <h3 className="font-bold text-[#18281F] text-sm">User Retention &amp; Cohorts</h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 font-mono">88.5% Retained</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RETENTION_PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {RETENTION_PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18281F', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => `${val}%`}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
