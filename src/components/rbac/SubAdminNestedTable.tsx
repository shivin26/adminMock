import React, { useState } from 'react';
import type { SubAdminUser } from '../../types/rbac.types';
import { Badge } from '../common/Badge/Badge';
import { Button } from '../common/Button/Button';
import {
  ShieldCheck,
  UserCheck,
  Edit3,
  Trash2,
  Lock,
  ChevronDown,
  ChevronRight,
  Users,
  CornerDownRight,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters.utils';

export interface SubAdminNestedTableProps {
  subAdmins: SubAdminUser[];
  currentUserId?: string;
  currentUserEmail?: string;
  currentUserName?: string;
  isSuperAdmin: boolean;
  onEditPowers: (subAdmin: SubAdminUser) => void;
  onRevoke: (subAdmin: SubAdminUser) => void;
  onSelectSubAdmin: (subAdmin: SubAdminUser) => void;
}

export const SubAdminNestedTable: React.FC<SubAdminNestedTableProps> = ({
  subAdmins,
  currentUserId,
  currentUserEmail,
  currentUserName,
  isSuperAdmin,
  onEditPowers,
  onRevoke,
  onSelectSubAdmin,
}) => {
  // Store expanded parent IDs (default all expanded so user sees hierarchy immediately)
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({
    'sub-aarushi': true,
    'sub-1': true,
  });

  const toggleExpand = (id: string) => {
    setExpandedParents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Helper to check if current logged-in user can revoke a given sub-admin
  const checkCanRevoke = (sub: SubAdminUser) => {
    if (isSuperAdmin) return true;
    if (!currentUserId && !currentUserEmail && !currentUserName) return false;

    if (sub.creatorId && currentUserId && sub.creatorId === currentUserId) return true;

    const createdByLower = (sub.createdBy || '').toLowerCase();
    const uNameLower = (currentUserName || '').toLowerCase();
    const uEmailLower = (currentUserEmail || '').toLowerCase();

    return (
      (uNameLower && createdByLower.length > 0 && createdByLower.includes(uNameLower)) ||
      (uEmailLower && createdByLower.length > 0 && createdByLower.includes(uEmailLower))
    );
  };

  // Separate top-level sub-admins created by Super Admin vs child sub-admins created by sub-admins
  const topLevelAdmins = subAdmins.filter(
    (s) =>
      s.createdRole === 'super_admin' ||
      s.createdBy === 'Super Admin' ||
      s.creatorId === 'super-admin' ||
      !s.createdBy ||
      !s.creatorId
  );

  // Map children for each parent
  const getChildrenForParent = (parent: SubAdminUser) => {
    const parentNameLower = parent.name.toLowerCase();
    return subAdmins.filter(
      (s) =>
        (s.creatorId && s.creatorId === parent.id) ||
        (s.createdBy && s.createdBy.toLowerCase().includes(parentNameLower) && s.id !== parent.id)
    );
  };

  return (
    <div className="w-full bg-white border border-[#E7DFD5] rounded-2xl shadow-xs overflow-hidden font-sans">
      <div className="datatable-scroll-area">
        <table className="w-full text-left font-sans">
          <thead className="bg-[#FAF8F5] border-b border-[#E7DFD5] text-[11px] font-bold font-mono uppercase tracking-wider text-[#211A19]">
            <tr>
              <th className="py-3.5 px-4 w-14">S.NO.</th>
              <th className="py-3.5 px-4">SUB-ADMIN USER</th>
              <th className="py-3.5 px-4">CREATED BY (ATTRIBUTION TAG)</th>
              <th className="py-3.5 px-4">ROLE TITLE</th>
              <th className="py-3.5 px-4">DELEGATED POWER SECTIONS</th>
              <th className="py-3.5 px-4">ACCOUNT STATUS</th>
              <th className="py-3.5 px-4">CREATED DATE</th>
              <th className="py-3.5 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7DFD5]/60 text-xs text-[#211A19]">
            {topLevelAdmins.map((parent, pIdx) => {
              const children = getChildrenForParent(parent);
              const hasChildren = children.length > 0;
              const isExpanded = expandedParents[parent.id] ?? true;

              const isSelfParent = !isSuperAdmin && (
                parent.id === currentUserId ||
                (currentUserEmail && parent.email.toLowerCase() === currentUserEmail.toLowerCase())
              );
              const canRevokeParent = !isSelfParent && checkCanRevoke(parent);

              return (
                <React.Fragment key={parent.id}>
                  {/* Top-Level Super Admin Created Sub-Admin Row */}
                  <tr
                    className={`hover:bg-[#FAF8F5] transition-colors cursor-pointer ${isSelfParent ? 'bg-amber-50/50' : ''}`}
                    onClick={() => onSelectSubAdmin(parent)}
                  >
                    <td className="py-4 px-4 font-mono font-bold text-[#211A19]">
                      {pIdx + 1}
                    </td>

                    {/* Sub-Admin User Column with Dropdown Toggle */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#211A19] text-[#C8A878] flex items-center justify-center shrink-0 font-serif font-bold text-xs">
                          {parent.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-[#211A19] font-serif hover:text-[#C8A878] transition-colors">
                              {parent.name}
                            </span>
                            {isSelfParent && (
                              <span className="px-1.5 py-0.2 bg-[#211A19] text-white text-[9px] font-bold font-mono rounded">
                                YOU (ACTIVE)
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#78716C] font-mono">{parent.email}</span>

                          {/* Dropdown Toggle Trigger Button for Created Sub-Admins */}
                          {hasChildren && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(parent.id);
                              }}
                              className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono bg-amber-100/80 text-amber-950 border border-amber-300 hover:bg-amber-200 transition-all cursor-pointer w-fit"
                              title={isExpanded ? 'Hide child sub-admins dropdown' : 'Expand child sub-admins dropdown'}
                            >
                              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                              <span>{children.length} Sub-Admin{children.length > 1 ? 's' : ''} Created Below</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Created By Attribution Tag */}
                    <td className="py-4 px-4">
                      <Badge variant="primary" className="text-[10px] font-mono tracking-tight">
                        <span className="flex items-center gap-1">
                          <ShieldCheck size={11} className="shrink-0" />
                          SUPER ADMIN
                        </span>
                      </Badge>
                    </td>

                    {/* Role Title */}
                    <td className="py-4 px-4">
                      <Badge variant="primary">SUB-ADMIN</Badge>
                    </td>

                    {/* Delegated Power Sections */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {parent.powers.map((power) => (
                          <Badge key={power} variant="info" size="sm">
                            {power}
                          </Badge>
                        ))}
                      </div>
                    </td>

                    {/* Account Status */}
                    <td className="py-4 px-4">
                      <Badge variant={parent.status === 'active' ? 'success' : 'danger'}>
                        {parent.status.toUpperCase()}
                      </Badge>
                    </td>

                    {/* Created Date */}
                    <td className="py-4 px-4 font-mono text-xs text-[#78716C]">
                      {formatDate(parent.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSelfParent}
                          title={isSelfParent ? 'Self-power escalation restricted.' : 'Edit Sub-Admin Delegated Power Sections'}
                          onClick={() => !isSelfParent && onEditPowers(parent)}
                        >
                          {isSelfParent ? <Lock size={14} className="text-amber-600" /> : <Edit3 size={15} />}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!canRevokeParent}
                          className={!canRevokeParent ? 'opacity-40 cursor-not-allowed text-slate-400' : 'text-rose-500 hover:bg-rose-500/10'}
                          title={!canRevokeParent ? 'REVOKE RESTRICTED: Only Super Admin can delete top-level sub-admin' : 'Revoke Sub-Admin Access'}
                          onClick={() => canRevokeParent && onRevoke(parent)}
                        >
                          {!canRevokeParent && !isSelfParent ? <Lock size={14} className="text-amber-600" /> : <Trash2 size={15} />}
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Dropdown Menu Row for Child Sub-Admins */}
                  {hasChildren && isExpanded && (
                    <tr className="bg-amber-50/30">
                      <td colSpan={8} className="p-0">
                        <div className="pl-12 pr-4 py-3 bg-[#FAF8F5] border-y border-amber-200/60 shadow-inner flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-amber-950 uppercase font-mono tracking-wider">
                            <CornerDownRight size={14} className="text-amber-700" />
                            <span>Child Sub-Admins Created by {parent.name} ({children.length})</span>
                          </div>

                          <div className="w-full bg-white border border-amber-200 rounded-xl overflow-hidden shadow-xs">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-amber-100/50 border-b border-amber-200 text-[10px] font-bold text-amber-900 font-mono uppercase">
                                  <th className="py-2.5 px-3">CHILD SUB-ADMIN</th>
                                  <th className="py-2.5 px-3">CREATOR ATTRIBUTION</th>
                                  <th className="py-2.5 px-3">DELEGATED POWERS</th>
                                  <th className="py-2.5 px-3">STATUS</th>
                                  <th className="py-2.5 px-3">CREATED DATE</th>
                                  <th className="py-2.5 px-3 text-right">ACTIONS</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-amber-100 text-xs">
                                {children.map((child) => {
                                  const isSelfChild = !isSuperAdmin && (
                                    child.id === currentUserId ||
                                    (currentUserEmail && child.email.toLowerCase() === currentUserEmail.toLowerCase())
                                  );
                                  const canRevokeChild = !isSelfChild && checkCanRevoke(child);

                                  return (
                                    <tr
                                      key={child.id}
                                      className="hover:bg-amber-100/60 transition-colors cursor-pointer"
                                      onClick={() => onSelectSubAdmin(child)}
                                    >
                                      {/* Child Sub-Admin Name & Email */}
                                      <td className="py-3 px-3">
                                        <div className="flex items-center gap-2">
                                          <CornerDownRight size={14} className="text-amber-600 shrink-0" />
                                          <div className="w-7 h-7 rounded-lg bg-amber-800 text-white flex items-center justify-center font-bold text-xs shrink-0 font-serif">
                                            {child.name.charAt(0).toUpperCase()}
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-1.5">
                                              <span className="font-bold text-xs text-[#211A19]">
                                                {child.name}
                                              </span>
                                              {isSelfChild && (
                                                <span className="px-1.5 py-0.2 bg-[#211A19] text-white text-[8px] font-bold font-mono rounded">
                                                  YOU
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-[11px] text-[#78716C] font-mono block">{child.email}</span>
                                          </div>
                                        </div>
                                      </td>

                                      {/* Creator Attribution */}
                                      <td className="py-3 px-3">
                                        <Badge variant="info" className="text-[9px] font-mono tracking-tight bg-cyan-100 text-cyan-950 border border-cyan-300">
                                          <span className="flex items-center gap-1">
                                            <UserCheck size={10} className="shrink-0" />
                                            CREATED BY SUB-ADMIN {parent.name.toUpperCase()}
                                          </span>
                                        </Badge>
                                      </td>

                                      {/* Delegated Powers */}
                                      <td className="py-3 px-3">
                                        <div className="flex flex-wrap gap-1">
                                          {child.powers.map((pw) => (
                                            <span
                                              key={pw}
                                              className="px-1.5 py-0.5 bg-white border border-amber-300 rounded font-mono text-[9px] font-bold uppercase text-amber-950"
                                            >
                                              {pw}
                                            </span>
                                          ))}
                                        </div>
                                      </td>

                                      {/* Status */}
                                      <td className="py-3 px-3">
                                        <Badge variant={child.status === 'active' ? 'success' : 'danger'} size="sm">
                                          {child.status.toUpperCase()}
                                        </Badge>
                                      </td>

                                      {/* Created Date */}
                                      <td className="py-3 px-3 font-mono text-[11px] text-[#78716C]">
                                        {formatDate(child.createdAt)}
                                      </td>

                                      {/* Actions */}
                                      <td className="py-3 px-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={isSelfChild}
                                            title={isSelfChild ? 'Self-power escalation restricted.' : 'Edit Sub-Admin Powers'}
                                            onClick={() => !isSelfChild && onEditPowers(child)}
                                            className="text-xs px-2 py-1"
                                          >
                                            <Edit3 size={13} />
                                          </Button>

                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={!canRevokeChild}
                                            className={!canRevokeChild ? 'opacity-40 cursor-not-allowed text-slate-400' : 'text-rose-500 hover:bg-rose-500/10'}
                                            title={
                                              !canRevokeChild
                                                ? 'REVOKE RESTRICTED: Only Parent Sub-Admin Creator or Super Admin can delete this child'
                                                : 'Revoke Child Sub-Admin Access'
                                            }
                                            onClick={() => canRevokeChild && onRevoke(child)}
                                          >
                                            {!canRevokeChild && !isSelfChild ? (
                                              <Lock size={13} className="text-amber-600" />
                                            ) : (
                                              <Trash2 size={13} />
                                            )}
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
