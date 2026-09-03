import React, { useState } from 'react';
import type { SubAdminUser, PowerSection } from '../../types/rbac.types';
import { Badge } from '../common/Badge/Badge';
import {
  ShieldCheck,
  UserCheck,
  Edit3,
  Trash2,
  Lock,
  ChevronDown,
  ChevronRight,
  Building2,
  Users,
  CreditCard,
  Headphones,
  Settings,
  ShieldAlert,
  CornerDownRight,
  Sparkles,
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

const POWER_META: Record<string, { label: string; icon: React.ReactNode; style: string }> = {
  SOCIETIES: {
    label: 'Societies',
    icon: <Building2 size={12} />,
    style: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/70',
  },
  VENDORS: {
    label: 'Vendors',
    icon: <Users size={12} />,
    style: 'bg-sky-50 text-sky-800 border-sky-200/80 hover:bg-sky-100/70',
  },
  SUBSCRIPTIONS: {
    label: 'Financials',
    icon: <CreditCard size={12} />,
    style: 'bg-purple-50 text-purple-800 border-purple-200/80 hover:bg-purple-100/70',
  },
  SUPPORT: {
    label: 'Support Desk',
    icon: <Headphones size={12} />,
    style: 'bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/70',
  },
  SETTINGS: {
    label: 'Platform Settings',
    icon: <Settings size={12} />,
    style: 'bg-stone-100 text-stone-800 border-stone-200/80 hover:bg-stone-200/60',
  },
  SUB_ADMINS: {
    label: 'Sub-Admins',
    icon: <ShieldAlert size={12} />,
    style: 'bg-rose-50 text-rose-800 border-rose-200/80 hover:bg-rose-100/70',
  },
};

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
  // Store expanded parent IDs (default expanded so user sees hierarchy immediately)
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

  const renderPowerPills = (powers: PowerSection[]) => {
    return (
      <div className="flex flex-wrap gap-1.5 items-center">
        {powers.map((power) => {
          const meta = POWER_META[power] || {
            label: power,
            icon: <Sparkles size={11} />,
            style: 'bg-gray-100 text-gray-800 border-gray-200',
          };

          return (
            <span
              key={power}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all shadow-2xs ${meta.style}`}
            >
              {meta.icon}
              <span>{meta.label}</span>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full bg-white border border-[#E7DFD5] rounded-2xl shadow-xs overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans border-collapse">
          <thead className="bg-[#FAF8F5] border-b border-[#E7DFD5] text-xs font-semibold uppercase tracking-wider text-[#524B47]">
            <tr>
              <th className="py-4 px-4 w-14 text-center">S.NO.</th>
              <th className="py-4 px-4">Sub-Admin Profile</th>
              <th className="py-4 px-4">Attribution & Creator</th>
              <th className="py-4 px-4">Privilege Role</th>
              <th className="py-4 px-4">Delegated Operational Powers</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4">Created Date</th>
              <th className="py-4 px-4 text-right">Actions</th>
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
                    className={`hover:bg-[#FAF8F5]/80 transition-colors cursor-pointer group ${
                      isSelfParent ? 'bg-amber-50/40' : ''
                    }`}
                    onClick={() => onSelectSubAdmin(parent)}
                  >
                    <td className="py-4 px-4 font-mono font-bold text-[#78716C] text-center text-xs">
                      {pIdx + 1}
                    </td>

                    {/* Sub-Admin User Profile */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#211A19] to-[#3B2D2B] text-[#C8A878] flex items-center justify-center shrink-0 font-serif font-bold text-sm shadow-2xs border border-[#3B2D2B]">
                          {parent.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#211A19] font-serif group-hover:text-[#C8A878] transition-colors leading-tight">
                              {parent.name}
                            </span>
                            {isSelfParent && (
                              <span className="px-2 py-0.5 bg-[#211A19] text-[#C8A878] text-[9px] font-bold font-mono rounded-full uppercase tracking-wider shadow-2xs">
                                YOU (ACTIVE)
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#78716C] font-mono mt-0.5">{parent.email}</span>

                          {/* Dropdown Toggle Trigger Button for Created Sub-Admins */}
                          {hasChildren && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(parent.id);
                              }}
                              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-amber-900 bg-amber-100/80 border border-amber-300/80 hover:bg-amber-200/90 transition-all shadow-2xs cursor-pointer w-fit"
                              title={isExpanded ? 'Hide child sub-admins list' : 'Show child sub-admins list'}
                            >
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              <span>{children.length} Sub-Admin{children.length > 1 ? 's' : ''} Created Below</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Created By Attribution Tag */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#211A19] to-[#3B2D2B] text-[#F8F6F0] border border-[#541D26] shadow-2xs">
                        <ShieldCheck size={13} className="text-[#C8A878] shrink-0" />
                        <span>SUPER ADMIN</span>
                      </span>
                    </td>

                    {/* Role Privilege */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-[#541D26] text-[#F8F6F0] shadow-2xs uppercase">
                        SUB-ADMIN
                      </span>
                    </td>

                    {/* Delegated Power Sections */}
                    <td className="py-4 px-4">
                      {renderPowerPills(parent.powers)}
                    </td>

                    {/* Account Status */}
                    <td className="py-4 px-4">
                      <Badge variant={parent.status === 'active' ? 'success' : 'danger'} size="md">
                        {parent.status.toUpperCase()}
                      </Badge>
                    </td>

                    {/* Created Date */}
                    <td className="py-4 px-4 font-mono text-xs text-[#78716C]">
                      {formatDate(parent.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={isSelfParent}
                          title={isSelfParent ? 'Self-power escalation restricted.' : 'Edit Sub-Admin Delegated Powers'}
                          onClick={() => !isSelfParent && onEditPowers(parent)}
                          className={`w-8 h-8 rounded-xl border border-[#E7DFD5] flex items-center justify-center transition-all ${
                            isSelfParent
                              ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400'
                              : 'bg-white text-[#211A19] hover:border-[#C8A878] hover:bg-[#FAF8F5] shadow-2xs cursor-pointer'
                          }`}
                        >
                          {isSelfParent ? <Lock size={14} className="text-amber-600" /> : <Edit3 size={14} />}
                        </button>

                        <button
                          type="button"
                          disabled={!canRevokeParent}
                          title={
                            !canRevokeParent
                              ? 'REVOKE RESTRICTED: Only Super Admin or direct creator can delete this sub-admin'
                              : 'Revoke Sub-Admin Access'
                          }
                          onClick={() => canRevokeParent && onRevoke(parent)}
                          className={`w-8 h-8 rounded-xl border border-[#E7DFD5] flex items-center justify-center transition-all ${
                            !canRevokeParent
                              ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400'
                              : 'bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50 shadow-2xs cursor-pointer'
                          }`}
                        >
                          {!canRevokeParent && !isSelfParent ? (
                            <Lock size={14} className="text-amber-600" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Dropdown Menu Row for Child Sub-Admins */}
                  {hasChildren && isExpanded && (
                    <tr>
                      <td colSpan={8} className="p-0 border-b border-[#E7DFD5]">
                        <div className="p-4 bg-gradient-to-b from-amber-50/60 via-[#FAF8F5]/80 to-amber-50/30 border-l-4 border-amber-400/90 shadow-inner">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase font-mono tracking-wider mb-3">
                            <CornerDownRight size={15} className="text-amber-700" />
                            <span>Child Sub-Admins Created by {parent.name} ({children.length})</span>
                          </div>

                          <div className="w-full bg-white border border-amber-200/80 rounded-2xl overflow-hidden shadow-xs">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-amber-100/60 border-b border-amber-200 text-xs font-semibold text-amber-950 uppercase tracking-wider">
                                  <th className="py-3 px-4">Child Sub-Admin</th>
                                  <th className="py-3 px-4">Creator Attribution</th>
                                  <th className="py-3 px-4">Delegated Powers</th>
                                  <th className="py-3 px-4">Status</th>
                                  <th className="py-3 px-4">Created Date</th>
                                  <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-amber-100/70 text-xs text-[#211A19]">
                                {children.map((child) => {
                                  const isSelfChild = !isSuperAdmin && (
                                    child.id === currentUserId ||
                                    (currentUserEmail && child.email.toLowerCase() === currentUserEmail.toLowerCase())
                                  );
                                  const canRevokeChild = !isSelfChild && checkCanRevoke(child);

                                  return (
                                    <tr
                                      key={child.id}
                                      className="hover:bg-amber-50/80 transition-colors cursor-pointer group"
                                      onClick={() => onSelectSubAdmin(child)}
                                    >
                                      {/* Child Sub-Admin Name & Email */}
                                      <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-2.5">
                                          <CornerDownRight size={14} className="text-amber-600 shrink-0" />
                                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 text-white flex items-center justify-center font-bold text-xs shrink-0 font-serif shadow-2xs">
                                            {child.name.charAt(0).toUpperCase()}
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-1.5">
                                              <span className="font-bold text-xs text-[#211A19] group-hover:text-amber-800 transition-colors">
                                                {child.name}
                                              </span>
                                              {isSelfChild && (
                                                <span className="px-1.5 py-0.2 bg-[#211A19] text-white text-[8px] font-bold font-mono rounded-full uppercase">
                                                  YOU
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-[11px] text-[#78716C] font-mono block">{child.email}</span>
                                          </div>
                                        </div>
                                      </td>

                                      {/* Creator Attribution */}
                                      <td className="py-3.5 px-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                                          <UserCheck size={12} className="shrink-0 text-indigo-600" />
                                          <span>Created by Sub-Admin {parent.name}</span>
                                        </span>
                                      </td>

                                      {/* Delegated Powers */}
                                      <td className="py-3.5 px-4">
                                        {renderPowerPills(child.powers)}
                                      </td>

                                      {/* Status */}
                                      <td className="py-3.5 px-4">
                                        <Badge variant={child.status === 'active' ? 'success' : 'danger'} size="sm">
                                          {child.status.toUpperCase()}
                                        </Badge>
                                      </td>

                                      {/* Created Date */}
                                      <td className="py-3.5 px-4 font-mono text-xs text-[#78716C]">
                                        {formatDate(child.createdAt)}
                                      </td>

                                      {/* Actions */}
                                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1.5">
                                          <button
                                            type="button"
                                            disabled={isSelfChild}
                                            title={isSelfChild ? 'Self-power escalation restricted.' : 'Edit Sub-Admin Powers'}
                                            onClick={() => !isSelfChild && onEditPowers(child)}
                                            className={`w-7 h-7 rounded-lg border border-[#E7DFD5] flex items-center justify-center transition-all ${
                                              isSelfChild
                                                ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400'
                                                : 'bg-white text-[#211A19] hover:border-[#C8A878] hover:bg-[#FAF8F5] shadow-2xs cursor-pointer'
                                            }`}
                                          >
                                            <Edit3 size={13} />
                                          </button>

                                          <button
                                            type="button"
                                            disabled={!canRevokeChild}
                                            title={
                                              !canRevokeChild
                                                ? 'REVOKE RESTRICTED: Only Parent Sub-Admin Creator or Super Admin can delete this child'
                                                : 'Revoke Child Sub-Admin Access'
                                            }
                                            onClick={() => canRevokeChild && onRevoke(child)}
                                            className={`w-7 h-7 rounded-lg border border-[#E7DFD5] flex items-center justify-center transition-all ${
                                              !canRevokeChild
                                                ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400'
                                                : 'bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50 shadow-2xs cursor-pointer'
                                            }`}
                                          >
                                            {!canRevokeChild && !isSelfChild ? (
                                              <Lock size={13} className="text-amber-600" />
                                            ) : (
                                              <Trash2 size={13} />
                                            )}
                                          </button>
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
