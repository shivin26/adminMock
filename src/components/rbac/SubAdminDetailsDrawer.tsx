import React from 'react';
import type { SubAdminUser } from '../../types/rbac.types';
import { POWER_SECTIONS_LIST } from '../../types/rbac.types';
import { Badge } from '../common/Badge/Badge';
import { Button } from '../common/Button/Button';
import {
  X,
  ShieldCheck,
  UserCheck,
  Mail,
  Calendar,
  Key,
  Edit3,
  Trash2,
  Lock,
  Building2,
  Users,
  CreditCard,
  Headphones,
  Settings,
  ShieldAlert,
  UsersRound,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters.utils';

export interface SubAdminDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subAdmin: SubAdminUser | null;
  allSubAdmins: SubAdminUser[];
  currentUserId?: string;
  currentUserEmail?: string;
  currentUserName?: string;
  isSuperAdmin: boolean;
  onEditPowers: (subAdmin: SubAdminUser) => void;
  onRevoke: (subAdmin: SubAdminUser) => void;
  onToggleStatus: (subAdmin: SubAdminUser) => void;
}

const POWER_ICON_MAP: Record<string, React.ReactNode> = {
  Building2: <Building2 size={16} />,
  Users: <Users size={16} />,
  CreditCard: <CreditCard size={16} />,
  Headphones: <Headphones size={16} />,
  Settings: <Settings size={16} />,
  ShieldAlert: <ShieldAlert size={16} />,
};

export const SubAdminDetailsDrawer: React.FC<SubAdminDetailsDrawerProps> = ({
  isOpen,
  onClose,
  subAdmin,
  allSubAdmins,
  currentUserId,
  currentUserEmail,
  currentUserName,
  isSuperAdmin,
  onEditPowers,
  onRevoke,
  onToggleStatus,
}) => {
  if (!isOpen || !subAdmin) return null;

  const isSelf = !isSuperAdmin && (
    subAdmin.id === currentUserId ||
    (currentUserEmail && subAdmin.email.toLowerCase() === currentUserEmail.toLowerCase())
  );

  const isCreatedBySuper = subAdmin.createdRole === 'super_admin' || subAdmin.createdBy === 'Super Admin';

  // Check parent revocation permission
  const checkCanRevoke = () => {
    if (isSuperAdmin) return true;
    if (!currentUserId && !currentUserEmail && !currentUserName) return false;

    if (subAdmin.creatorId && currentUserId && subAdmin.creatorId === currentUserId) return true;

    const createdByLower = (subAdmin.createdBy || '').toLowerCase();
    const uNameLower = (currentUserName || '').toLowerCase();
    const uEmailLower = (currentUserEmail || '').toLowerCase();

    return (
      (uNameLower && createdByLower.length > 0 && createdByLower.includes(uNameLower)) ||
      (uEmailLower && createdByLower.length > 0 && createdByLower.includes(uEmailLower))
    );
  };

  const canRevoke = !isSelf && checkCanRevoke();

  // Find child sub-admins created by this sub-admin
  const childrenAdmins = allSubAdmins.filter(
    (s) =>
      (s.creatorId && s.creatorId === subAdmin.id) ||
      (s.createdBy && s.createdBy.toLowerCase().includes(subAdmin.name.toLowerCase()) && s.id !== subAdmin.id)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-[#E7DFD5]">
          {/* Header */}
          <div className="p-6 bg-[#211A19] text-[#F8F6F0] flex items-center justify-between border-b border-[#2D2322]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#541D26] text-[#C8A878] flex items-center justify-center font-bold text-lg font-serif shrink-0">
                {subAdmin.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-[#F8F6F0] font-serif leading-tight">
                    {subAdmin.name}
                  </h3>
                  {isSelf && (
                    <span className="px-2 py-0.5 bg-[#C8A878] text-[#211A19] text-[9px] font-bold font-mono rounded uppercase">
                      ACTIVE YOU
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#FAF8F5]/80 font-mono mt-0.5">{subAdmin.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status & Attribution Card */}
            <div className="p-4 bg-[#FAF8F5] border border-[#E7DFD5] rounded-2xl flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#78716C] uppercase font-mono">Status:</span>
                <Badge variant={subAdmin.status === 'active' ? 'success' : 'danger'} size="lg">
                  {subAdmin.status.toUpperCase()}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#78716C] uppercase font-mono">Attribution:</span>
                <Badge
                  variant={isCreatedBySuper ? 'primary' : 'info'}
                  className="text-xs font-mono"
                >
                  {isCreatedBySuper ? (
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={13} /> CREATED BY SUPER ADMIN
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <UserCheck size={13} /> CREATED BY {subAdmin.createdBy?.toUpperCase()}
                    </span>
                  )}
                </Badge>
              </div>
            </div>

            {/* Account Information Parameters */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#211A19] uppercase font-mono tracking-wider border-b border-[#E7DFD5] pb-2">
                Account Information Parameters
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center gap-2.5">
                  <Mail size={16} className="text-[#C8A878] shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#78716C] font-mono block uppercase font-bold">Email Address</span>
                    <span className="font-mono font-bold text-[#211A19]">{subAdmin.email}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center gap-2.5">
                  <Calendar size={16} className="text-[#C8A878] shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#78716C] font-mono block uppercase font-bold">Creation Date</span>
                    <span className="font-mono font-bold text-[#211A19]">{formatDate(subAdmin.createdAt)}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center gap-2.5">
                  <Key size={16} className="text-[#C8A878] shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#78716C] font-mono block uppercase font-bold">Role Privilege Level</span>
                    <span className="font-mono font-bold text-[#211A19]">Sub-Admin Account</span>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-[#C8A878] shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#78716C] font-mono block uppercase font-bold">Account ID</span>
                    <span className="font-mono font-bold text-[#211A19]">{subAdmin.id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delegated Power Sections */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-2">
                <h4 className="text-xs font-bold text-[#211A19] uppercase font-mono tracking-wider">
                  Delegated Power Sections ({subAdmin.powers.length})
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Edit3 size={13} />}
                  disabled={isSelf}
                  onClick={() => !isSelf && onEditPowers(subAdmin)}
                  className="text-xs py-1 px-2.5"
                >
                  Edit Powers
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {POWER_SECTIONS_LIST.map((item) => {
                  const isAssigned = subAdmin.powers.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all ${
                        isAssigned
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${isAssigned ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                        {POWER_ICON_MAP[item.iconName] || <ShieldAlert size={16} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs font-serif">{item.label}</span>
                          {isAssigned ? (
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle size={14} className="text-slate-300 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-sans">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Allowed Sub-Admin Delegation Powers (If Manager Sub-Admin) */}
            {subAdmin.powers.includes('SUB_ADMINS') && (
              <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl space-y-2 font-sans">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-xs font-bold text-amber-950 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-amber-700" /> Super Admin Allowed Delegation Powers
                  </span>
                  <span className="text-[9px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded font-mono">
                    SUPER ADMIN RULE
                  </span>
                </div>
                <p className="text-xs text-[#211A19]">
                  This Sub-Admin has Manage Sub-Admins power. Permitted powers they can delegate when creating child sub-admins:
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(subAdmin.allowedDelegationPowers || subAdmin.powers.filter((p) => p !== 'SUB_ADMINS')).map((pw) => (
                    <span
                      key={pw}
                      className="px-2.5 py-1 bg-white border border-amber-300 text-amber-950 rounded-lg text-xs font-bold font-mono uppercase"
                    >
                      {pw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Child Sub-Admins Created List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-2">
                <h4 className="text-xs font-bold text-[#211A19] uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <UsersRound size={15} className="text-[#C8A878]" /> Child Sub-Admins Created ({childrenAdmins.length})
                </h4>
              </div>

              {childrenAdmins.length > 0 ? (
                <div className="space-y-2">
                  {childrenAdmins.map((child) => (
                    <div
                      key={child.id}
                      className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center justify-between gap-3 hover:border-[#C8A878] transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#541D26] text-white flex items-center justify-center font-bold text-xs shrink-0 font-serif">
                          {child.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-[#211A19] block font-serif">
                            {child.name}
                          </span>
                          <span className="text-[11px] text-[#78716C] font-mono block">{child.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={child.status === 'active' ? 'success' : 'danger'} size="sm">
                          {child.status.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] text-[#78716C] font-mono">
                          {formatDate(child.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[#FAF8F5] border border-dashed border-[#E7DFD5] rounded-xl text-center text-xs text-[#78716C]">
                  No child sub-admins have been created by {subAdmin.name} yet.
                </div>
              )}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 bg-[#FAF8F5] border-t border-[#E7DFD5] flex items-center justify-between gap-3">
            <Button variant="secondary" onClick={onClose}>
              Close Details
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                leftIcon={canRevoke ? <Trash2 size={14} /> : <Lock size={14} />}
                disabled={!canRevoke}
                onClick={() => canRevoke && onRevoke(subAdmin)}
                title={!canRevoke ? 'REVOKE RESTRICTED: Only Parent Sub-Admin Creator or Super Admin can delete' : 'Revoke Account'}
              >
                {canRevoke ? 'Revoke Account' : 'Locked'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
