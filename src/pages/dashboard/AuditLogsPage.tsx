import React, { useState, useEffect, useMemo } from 'react';
import './AuditLogsPage.css';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { StatCard } from '../../components/common/StatCard/StatCard';
import { Input } from '../../components/common/Input/Input';
import { Badge } from '../../components/common/Badge/Badge';
import { Button } from '../../components/common/Button/Button';
import { Modal } from '../../components/common/Modal/Modal';
import {
  fetchBackendAuditLogsAsync,
  getBackendAuditLogs,
  type BackendAuditLog,
  type AuditModule,
  type AuditActionType,
} from '../../services/audit.service';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatters.utils';
import {
  Activity,
  Search,
  ShieldCheck,
  UserCheck,
  Building2,
  Users,
  CreditCard,
  Headphones,
  Settings,
  ShieldAlert,
  Clock,
  Filter,
  Download,
  Eye,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

const MODULE_ICONS: Record<string, React.ReactNode> = {
  SOCIETIES: <Building2 size={14} />,
  VENDORS: <Users size={14} />,
  SUBSCRIPTIONS: <CreditCard size={14} />,
  SUPPORT: <Headphones size={14} />,
  SETTINGS: <Settings size={14} />,
  SUB_ADMINS: <ShieldAlert size={14} />,
  USERS: <UserCheck size={14} />,
};

const MODULE_STYLES: Record<string, string> = {
  SOCIETIES: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  VENDORS: 'bg-sky-50 text-sky-800 border-sky-200/80',
  SUBSCRIPTIONS: 'bg-purple-50 text-purple-800 border-purple-200/80',
  SUPPORT: 'bg-amber-50 text-amber-800 border-amber-200/80',
  SETTINGS: 'bg-stone-100 text-stone-800 border-stone-200/80',
  SUB_ADMINS: 'bg-rose-50 text-rose-800 border-rose-200/80',
  USERS: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
};

const ACTION_STYLES: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold',
  UPDATE: 'bg-sky-100 text-sky-950 border-sky-300 font-bold',
  DELETE: 'bg-rose-100 text-rose-950 border-rose-300 font-bold',
  STATUS_CHANGE: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
  REPLY: 'bg-purple-100 text-purple-950 border-purple-300 font-bold',
  ESCALATION: 'bg-red-100 text-red-950 border-red-300 font-bold',
};

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<BackendAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [inspectingLog, setInspectingLog] = useState<BackendAuditLog | null>(null);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const fetched = await fetchBackendAuditLogsAsync();
      setLogs(fetched);
    } catch {
      setLogs(getBackendAuditLogs());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedModule !== 'ALL' && log.module !== selectedModule) return false;
      if (selectedAction !== 'ALL' && log.actionType !== selectedAction) return false;

      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase();
        const matchSummary = (log.summary || '').toLowerCase().includes(query);
        const matchDetails = (log.details || '').toLowerCase().includes(query);
        const matchActor = (log.userName || '').toLowerCase().includes(query) || (log.userEmail || '').toLowerCase().includes(query);
        const matchEntity = (log.entityId || '').toLowerCase().includes(query);
        return matchSummary || matchDetails || matchActor || matchEntity;
      }
      return true;
    });
  }, [logs, selectedModule, selectedAction, debouncedSearch]);

  const subAdminCount = logs.filter((l) => l.module === 'SUB_ADMINS').length;
  const vendorCount = logs.filter((l) => l.module === 'VENDORS').length;
  const supportCount = logs.filter((l) => l.module === 'SUPPORT').length;

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Actor Name', 'Actor Email', 'Role', 'Module', 'Action Type', 'Summary', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestampReadable || l.timestamp,
      `"${l.userName}"`,
      `"${l.userEmail}"`,
      l.userRole,
      l.module,
      l.actionType,
      `"${(l.summary || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `digilocal_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="audit-logs-page font-sans">
      <PageHeader
        title="Audit Logs & System Trail"
        description="Immutable administrative mutation records, sub-admin delegations, and backend operation logs."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              leftIcon={<RefreshCw size={15} />}
              onClick={loadLogs}
              isLoading={isLoading}
            >
              Refresh Logs
            </Button>
            <Button
              variant="primary"
              leftIcon={<Download size={15} />}
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="kpi-grid">
        <StatCard
          title="Total Logged Audit Events"
          value={logs.length}
          change="Real-time Mutation Trail"
          isPositive={true}
          icon={<Activity size={22} />}
        />
        <StatCard
          title="Sub-Admin Delegations"
          value={subAdminCount}
          change="RBAC & Permission Events"
          isPositive={true}
          icon={<ShieldAlert size={22} />}
        />
        <StatCard
          title="Vendor & Shop Mutations"
          value={vendorCount}
          change="Onboarding & Hold Events"
          isPositive={true}
          icon={<Users size={22} />}
        />
        <StatCard
          title="Support Desk Mutations"
          value={supportCount}
          change="Ticket & SLA Actions"
          isPositive={true}
          icon={<Headphones size={22} />}
        />
      </div>

      {/* Controls Bar: Search & Module Filters */}
      <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search audit logs by actor, summary..."
              leftIcon={<Search size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#78716C] uppercase font-mono flex items-center gap-1">
              <Filter size={14} /> Action Type:
            </span>
            {['ALL', 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'REPLY'].map((act) => (
              <button
                key={act}
                type="button"
                onClick={() => setSelectedAction(act)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedAction === act
                    ? 'bg-[#211A19] text-[#F8F6F0]'
                    : 'bg-[#FAF8F5] text-[#78716C] border border-[#E7DFD5] hover:border-[#C8A878]'
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        </div>

        {/* Module Filter Pills */}
        <div className="flex items-center gap-2 border-t border-[#E7DFD5]/60 pt-3 flex-wrap">
          <span className="text-xs font-bold text-[#78716C] uppercase font-mono">Module Filter:</span>
          {['ALL', 'SUB_ADMINS', 'VENDORS', 'SOCIETIES', 'SUBSCRIPTIONS', 'SUPPORT', 'SETTINGS'].map((mod) => {
            const isSelected = selectedModule === mod;
            return (
              <button
                key={mod}
                type="button"
                onClick={() => setSelectedModule(mod)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#541D26] text-[#F8F6F0] border-[#541D26] shadow-2xs font-bold'
                    : 'bg-white text-[#524B47] border-[#E7DFD5] hover:border-[#C8A878]'
                }`}
              >
                {MODULE_ICONS[mod] || <Sparkles size={13} />}
                <span>{mod === 'ALL' ? 'All Modules' : mod}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="w-full bg-white border border-[#E7DFD5] rounded-2xl shadow-xs overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans border-collapse">
            <thead className="bg-[#FAF8F5] border-b border-[#E7DFD5] text-xs font-semibold uppercase tracking-wider text-[#524B47]">
              <tr>
                <th className="py-4 px-4 w-12 text-center">#</th>
                <th className="py-4 px-4">Timestamp</th>
                <th className="py-4 px-4">Actor Profile</th>
                <th className="py-4 px-4">Target Module</th>
                <th className="py-4 px-4">Action Type</th>
                <th className="py-4 px-4">Mutation Summary</th>
                <th className="py-4 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7DFD5]/60 text-xs text-[#211A19]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#78716C]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#C8A878] border-t-transparent rounded-full animate-spin" />
                      <span>Loading backend mutation audit logs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#78716C]">
                    <p className="font-semibold text-sm">No audit logs match your search criteria.</p>
                    <p className="text-xs mt-1">Try clearing filters or performing mutations in the admin panel.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => {
                  const modMetaStyle = MODULE_STYLES[log.module] || 'bg-gray-50 text-gray-800 border-gray-200';
                  const actionStyle = ACTION_STYLES[log.actionType] || 'bg-slate-100 text-slate-800 border-slate-200';
                  const isSuper = log.userRole === 'super_admin' || log.userName.toLowerCase().includes('super');

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-[#FAF8F5]/80 transition-colors cursor-pointer"
                      onClick={() => setInspectingLog(log)}
                    >
                      <td className="py-4 px-4 font-mono font-bold text-[#78716C] text-center">
                        {index + 1}
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-4 font-mono text-xs text-[#78716C] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-[#C8A878] shrink-0" />
                          <span>{log.timestampReadable || formatDate(log.timestamp)}</span>
                        </div>
                      </td>

                      {/* Actor Profile */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-serif font-bold text-xs shrink-0 shadow-2xs ${
                            isSuper ? 'bg-[#211A19] text-[#C8A878] border border-[#3B2D2B]' : 'bg-[#541D26] text-white border border-[#C8A878]'
                          }`}>
                            {log.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-[#211A19]">
                                {log.userName}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold font-mono uppercase ${
                                isSuper ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-indigo-100 text-indigo-950 border border-indigo-300'
                              }`}>
                                {isSuper ? 'SUPER' : 'SUB ADMIN'}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#78716C] font-mono block">{log.userEmail}</span>
                          </div>
                        </div>
                      </td>

                      {/* Target Module */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border shadow-2xs ${modMetaStyle}`}>
                          {MODULE_ICONS[log.module]}
                          <span>{log.module}</span>
                        </span>
                      </td>

                      {/* Action Type */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono border ${actionStyle}`}>
                          {log.actionType}
                        </span>
                      </td>

                      {/* Mutation Summary */}
                      <td className="py-4 px-4 max-w-md">
                        <span className="font-semibold text-xs text-[#211A19] block truncate" title={log.summary}>
                          {log.summary}
                        </span>
                        {log.details && (
                          <span className="text-[11px] text-[#78716C] block truncate mt-0.5" title={log.details}>
                            {log.details}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectingLog(log);
                          }}
                          leftIcon={<Eye size={14} />}
                        >
                          View Log
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Payload Modal */}
      {inspectingLog && (
        <Modal
          isOpen={!!inspectingLog}
          onClose={() => setInspectingLog(null)}
          title="Audit Event Payload Details"
          subtitle={`Log ID: ${inspectingLog.id} • Timestamp: ${inspectingLog.timestampReadable || inspectingLog.timestamp}`}
          size="lg"
        >
          <div className="flex flex-col gap-4 font-sans text-xs">
            <div className="p-4 bg-[#FAF8F5] border border-[#E7DFD5] rounded-2xl flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#211A19] text-[#C8A878] flex items-center justify-center font-bold text-sm font-serif">
                  {inspectingLog.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#211A19]">{inspectingLog.userName}</h4>
                  <p className="text-xs text-[#78716C] font-mono">{inspectingLog.userEmail} ({inspectingLog.userRole.toUpperCase()})</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${MODULE_STYLES[inspectingLog.module]}`}>
                  {MODULE_ICONS[inspectingLog.module]}
                  <span>{inspectingLog.module}</span>
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-mono border ${ACTION_STYLES[inspectingLog.actionType]}`}>
                  {inspectingLog.actionType}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#78716C] uppercase font-mono">Mutation Summary</label>
              <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl font-bold text-[#211A19]">
                {inspectingLog.summary}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#78716C] uppercase font-mono">Raw Event Log JSON Payload</label>
              <pre className="p-4 bg-[#211A19] text-[#F8F6F0] rounded-xl font-mono text-xs overflow-x-auto border border-[#3B2D2B]">
                {JSON.stringify(inspectingLog, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E7DFD5]">
              <Button variant="primary" onClick={() => setInspectingLog(null)}>
                Close Viewer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
