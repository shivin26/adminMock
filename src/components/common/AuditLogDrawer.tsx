import React, { useState } from 'react';
import { Drawer } from './Drawer/Drawer';
import { Badge } from './Badge/Badge';
import { Input } from './Input/Input';
import { getBackendAuditLogs, type BackendAuditLog, type AuditModule } from '../../services/audit.service';
import { usePermission } from '../../hooks/usePermission';
import { ShieldCheck, Search, Lock, UserCheck, Activity, Database } from 'lucide-react';

export interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({ isOpen, onClose }) => {
  const { isSuperAdmin } = usePermission();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');

  if (!isSuperAdmin) {
    return null;
  }

  const logs = getBackendAuditLogs();

  const filteredLogs = logs.filter((item) => {
    const matchesModule = selectedModule === 'ALL' || item.module === selectedModule;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      item.userName.toLowerCase().includes(searchLower) ||
      item.userEmail.toLowerCase().includes(searchLower) ||
      item.summary.toLowerCase().includes(searchLower) ||
      item.details.toLowerCase().includes(searchLower) ||
      item.module.toLowerCase().includes(searchLower);

    return matchesModule && matchesSearch;
  });

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Backend Audit & Mutation Ledger"
      subtitle="Exclusive Super Admin view for tracking all backend mutations, creations, updates, & Support Desk changes."
      size="xl"
    >
      <div className="flex flex-col gap-5 p-1 font-sans">
        {/* Banner Notice */}
        <div className="p-4 bg-[#211A19] text-[#F8F6F0] rounded-2xl flex items-center justify-between flex-wrap gap-3 shadow-sm border border-[#E7DFD5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6B2732] text-[#A88B58] flex items-center justify-center shrink-0">
              <Database size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F8F6F0] font-serif flex items-center gap-2">
                Super Admin Backend Audit Log
                <span className="px-2 py-0.5 text-[9px] font-mono bg-[#A88B58] text-[#211A19] rounded font-bold uppercase flex items-center gap-1">
                  <Lock size={10} /> SUPER ADMIN EXCLUSIVE
                </span>
              </h4>
              <p className="text-xs text-[#EEE5DA]/80 mt-0.5">
                Tracks all backend data creations, updates, deletions, status changes, and support desk tickets.
              </p>
            </div>
          </div>
          <Badge variant="primary" className="font-mono text-xs">
            Total Mutations Logged: {logs.length}
          </Badge>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-[240px]">
            <Input
              placeholder="Search by action summary, user email, entity ID, or support ticket details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#78716C] font-bold">Filter Module:</span>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="p-2 border border-[#E7DFD5] rounded-xl bg-white text-[#211A19] font-bold"
            >
              <option value="ALL">ALL MODULES ({logs.length})</option>
              <option value="VENDORS">VENDORS</option>
              <option value="SOCIETIES">SOCIETIES &amp; AREA</option>
              <option value="USERS">USERS &amp; PEOPLE</option>
              <option value="SUB_ADMINS">SUB-ADMINS</option>
              <option value="SUPPORT">SUPPORT PANEL &amp; TICKETS</option>
              <option value="SETTINGS">SETTINGS &amp; BRANDING</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="border border-[#E7DFD5] rounded-2xl overflow-hidden bg-white shadow-xs">
          {filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#E7DFD5] font-mono text-[10px] text-[#78716C] uppercase">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Module</th>
                    <th className="p-3">Action Type</th>
                    <th className="p-3">Actor / Admin User</th>
                    <th className="p-3">Backend Mutation Summary</th>
                    <th className="p-3">Route / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7DFD5]">
                  {filteredLogs.map((log: BackendAuditLog) => {
                    const isSuper = log.userRole === 'super_admin';
                    return (
                      <tr key={log.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="p-3 font-mono text-[#78716C] whitespace-nowrap">
                          {log.timestampReadable}
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-1 rounded bg-[#EEE5DA] text-[#211A19] font-mono font-bold text-[10px]">
                            {log.module}
                          </span>
                        </td>

                        <td className="p-3">
                          <Badge
                            variant={
                              log.actionType === 'CREATE'
                                ? 'success'
                                : log.actionType === 'DELETE'
                                ? 'danger'
                                : log.actionType === 'STATUS_CHANGE'
                                ? 'warning'
                                : 'info'
                            }
                            className="text-[10px] uppercase font-mono"
                          >
                            {log.actionType}
                          </Badge>
                        </td>

                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#211A19] flex items-center gap-1">
                              {isSuper ? <ShieldCheck size={12} className="text-[#C8A878]" /> : <UserCheck size={12} className="text-cyan-700" />}
                              {log.userName}
                            </span>
                            <span className="text-[10px] text-[#78716C] font-mono">{log.userEmail}</span>
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="font-bold text-[#211A19] block">{log.summary}</span>
                          {log.details !== log.summary && (
                            <span className="text-[11px] text-[#78716C] font-mono block mt-0.5">{log.details}</span>
                          )}
                        </td>

                        <td className="p-3 font-mono text-[#C8A878] font-semibold whitespace-nowrap text-[11px]">
                          {log.pagePath}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#78716C] font-medium bg-[#FAF8F5]">
              No backend mutation logs matching current filter criteria.
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
