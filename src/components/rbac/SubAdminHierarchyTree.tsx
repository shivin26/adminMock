import React, { useState } from 'react';
import type { SubAdminUser } from '../../types/rbac.types';
import { Badge } from '../common/Badge/Badge';
import { Button } from '../common/Button/Button';
import {
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  Edit3,
  Trash2,
  Lock,
  GitFork,
  UserPlus,
  Users,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters.utils';

export interface SubAdminHierarchyTreeProps {
  subAdmins: SubAdminUser[];
  currentUserId?: string;
  currentUserEmail?: string;
  currentUserName?: string;
  isSuperAdmin: boolean;
  onEditPowers: (subAdmin: SubAdminUser) => void;
  onRevoke: (subAdmin: SubAdminUser) => void;
}

interface TreeNodeProps {
  node: SubAdminUser;
  childrenNodes: SubAdminUser[];
  allSubAdmins: SubAdminUser[];
  currentUserId?: string;
  currentUserEmail?: string;
  currentUserName?: string;
  isSuperAdmin: boolean;
  onEditPowers: (subAdmin: SubAdminUser) => void;
  onRevoke: (subAdmin: SubAdminUser) => void;
  depth?: number;
}

const SubAdminTreeNode: React.FC<TreeNodeProps> = ({
  node,
  childrenNodes,
  allSubAdmins,
  currentUserId,
  currentUserEmail,
  currentUserName,
  isSuperAdmin,
  onEditPowers,
  onRevoke,
  depth = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Check if current logged-in user is allowed to delete/revoke this node
  // Rule: Only the parent creator OR Super Admin can delete a child sub-admin
  const isCreatedBySuper = node.createdRole === 'super_admin' || node.createdBy === 'Super Admin';
  
  const isDirectParent = React.useMemo(() => {
    if (isSuperAdmin) return true;
    if (!currentUserEmail && !currentUserId && !currentUserName) return false;

    if (node.creatorId && currentUserId && node.creatorId === currentUserId) {
      return true;
    }

    const createdByLower = (node.createdBy || '').toLowerCase();
    const cNameLower = (currentUserName || '').toLowerCase();
    const cEmailLower = (currentUserEmail || '').toLowerCase();

    return (
      (cNameLower && createdByLower.includes(cNameLower)) ||
      (cEmailLower && createdByLower.includes(cEmailLower))
    );
  }, [node, isSuperAdmin, currentUserId, currentUserEmail, currentUserName]);

  const canDelete = isSuperAdmin || isDirectParent;

  const isSelf = !isSuperAdmin && (
    node.id === currentUserId ||
    (currentUserEmail && node.email.toLowerCase() === currentUserEmail.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2 my-1.5 font-sans">
      <div
        className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 shadow-xs ${
          isSelf
            ? 'bg-amber-50/70 border-amber-300'
            : isCreatedBySuper
            ? 'bg-white border-[#E7DFD5] hover:border-[#C8A878]'
            : 'bg-[#FAF8F5] border-cyan-200 hover:border-cyan-400'
        }`}
        style={{ marginLeft: `${Math.min(depth * 24, 96)}px` }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            {childrenNodes.length > 0 && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-6 h-6 rounded-lg bg-[#EEE5DA] text-[#211A19] flex items-center justify-center cursor-pointer hover:bg-[#C8A878] hover:text-white transition-all"
                title={isExpanded ? 'Collapse children tree' : 'Expand children tree'}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            )}

            <div className="w-9 h-9 rounded-xl bg-[#211A19] text-[#C8A878] flex items-center justify-center shrink-0 font-serif font-bold">
              {node.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h5 className="font-bold text-sm text-[#211A19] leading-tight font-serif">
                  {node.name}
                </h5>
                {isSelf && (
                  <Badge variant="warning" className="text-[9px] font-mono font-bold">
                    YOUR ACCOUNT (YOU)
                  </Badge>
                )}
                <Badge variant={node.status === 'active' ? 'success' : 'danger'} className="text-[10px]">
                  {node.status.toUpperCase()}
                </Badge>
              </div>
              <span className="text-xs text-[#78716C] font-mono mt-0.5">{node.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Creator Attribution Badge */}
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono border uppercase tracking-wider flex items-center gap-1 ${
                isCreatedBySuper
                  ? 'bg-amber-100/80 text-amber-950 border-amber-300'
                  : 'bg-cyan-100/80 text-cyan-950 border-cyan-300'
              }`}
            >
              {isCreatedBySuper ? <ShieldCheck size={12} className="text-amber-700" /> : <UserCheck size={12} className="text-cyan-700" />}
              {isCreatedBySuper ? 'CREATED BY SUPER ADMIN' : `CREATED BY ${node.createdBy?.toUpperCase()}`}
            </span>

            {/* Actions */}
            {!isSelf && (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Edit3 size={13} />}
                onClick={() => onEditPowers(node)}
                className="text-xs"
              >
                Edit Powers
              </Button>
            )}

            {!isSelf && (
              <Button
                size="sm"
                variant="danger"
                leftIcon={canDelete ? <Trash2 size={13} /> : <Lock size={13} />}
                disabled={!canDelete}
                onClick={() => canDelete && onRevoke(node)}
                title={
                  !canDelete
                    ? 'REVOKE RESTRICTED: Only the Parent Sub-Admin Creator or Super Admin can delete this child sub-admin'
                    : 'Revoke Sub-Admin Account Access'
                }
                className="text-xs"
              >
                {canDelete ? 'Revoke' : 'Locked'}
              </Button>
            )}
          </div>
        </div>

        {/* Powers Pills List */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-black/5 text-xs">
          <span className="text-[10px] font-bold text-[#78716C] uppercase font-mono mr-1">
            Delegated Powers ({node.powers.length}):
          </span>
          {node.powers.map((pw) => (
            <span
              key={pw}
              className="px-2 py-0.5 bg-[#FAF8F5] text-[#211A19] border border-[#E7DFD5] rounded-md font-mono text-[10px] font-bold uppercase"
            >
              {pw}
            </span>
          ))}
          {node.allowedDelegationPowers && node.allowedDelegationPowers.length > 0 && (
            <span className="ml-auto text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300 font-mono" title="Super Admin permitted delegation powers list">
              Delegation Permitted: {node.allowedDelegationPowers.join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Child Hierarchy Nodes */}
      {isExpanded && childrenNodes.length > 0 && (
        <div className="flex flex-col gap-1 pl-4 border-l-2 border-dashed border-[#C8A878]/40 ml-4">
          {childrenNodes.map((childNode) => {
            const grandChildren = allSubAdmins.filter(
              (s) =>
                (childNode.id && s.creatorId === childNode.id) ||
                (s.createdBy && s.createdBy.toLowerCase().includes(childNode.name.toLowerCase()))
            );
            return (
              <SubAdminTreeNode
                key={childNode.id}
                node={childNode}
                childrenNodes={grandChildren}
                allSubAdmins={allSubAdmins}
                currentUserId={currentUserId}
                currentUserEmail={currentUserEmail}
                currentUserName={currentUserName}
                isSuperAdmin={isSuperAdmin}
                onEditPowers={onEditPowers}
                onRevoke={onRevoke}
                depth={depth + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const SubAdminHierarchyTree: React.FC<SubAdminHierarchyTreeProps> = ({
  subAdmins,
  currentUserId,
  currentUserEmail,
  currentUserName,
  isSuperAdmin,
  onEditPowers,
  onRevoke,
}) => {
  // Find top level nodes created directly by Super Admin
  const rootNodes = subAdmins.filter(
    (s) =>
      s.createdRole === 'super_admin' ||
      s.createdBy === 'Super Admin' ||
      s.creatorId === 'super-admin' ||
      !s.createdBy
  );

  // Sub-admins created by other sub-admins that didn't match top level
  const orphanedOrChildNodes = subAdmins.filter((s) => !rootNodes.includes(s));

  return (
    <div className="p-5 bg-white border border-[#E7DFD5] rounded-2xl shadow-xs flex flex-col gap-5 font-sans">
      <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-3 flex-wrap gap-2">
        <div>
          <h4 className="text-base font-bold text-[#211A19] font-serif uppercase tracking-wider flex items-center gap-2">
            <GitFork size={18} className="text-[#C8A878]" /> Sub-Admin Creator Hierarchy Tree 🌳
          </h4>
          <p className="text-xs text-[#78716C] mt-0.5">
            Interactive organizational tree showing parent sub-admin creators and child delegation relationships.
          </p>
        </div>
        <Badge variant="primary" className="font-mono text-xs">
          Total Nodes: {subAdmins.length}
        </Badge>
      </div>

      {/* Super Admin Master Root Node Banner */}
      <div className="p-4 bg-[#211A19] text-[#F8F6F0] rounded-2xl flex items-center justify-between flex-wrap gap-3 shadow-sm border border-[#E7DFD5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6B2732] text-[#A88B58] flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h5 className="font-bold text-sm text-[#F8F6F0] font-serif flex items-center gap-2">
              Super Admin Root Control Node
              <span className="px-2 py-0.5 text-[9px] font-mono bg-[#A88B58] text-[#211A19] rounded font-bold uppercase">
                MASTER PARENT
              </span>
            </h5>
            <p className="text-xs text-[#EEE5DA]/80 mt-0.5">
              Top of hierarchy. Can create, edit powers, and revoke any sub-admin account across the platform.
            </p>
          </div>
        </div>
      </div>

      {/* Tree Nodes List */}
      <div className="flex flex-col gap-3 pt-1">
        {rootNodes.map((rootNode) => {
          const directChildren = subAdmins.filter(
            (s) =>
              (rootNode.id && s.creatorId === rootNode.id) ||
              (s.createdBy && s.createdBy.toLowerCase().includes(rootNode.name.toLowerCase()))
          );

          return (
            <SubAdminTreeNode
              key={rootNode.id}
              node={rootNode}
              childrenNodes={directChildren}
              allSubAdmins={subAdmins}
              currentUserId={currentUserId}
              currentUserEmail={currentUserEmail}
              currentUserName={currentUserName}
              isSuperAdmin={isSuperAdmin}
              onEditPowers={onEditPowers}
              onRevoke={onRevoke}
            />
          );
        })}
      </div>
    </div>
  );
};
