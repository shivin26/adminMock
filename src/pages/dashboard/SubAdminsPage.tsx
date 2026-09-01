import React, { useState } from 'react';
import './SubAdminsPage.css';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { Button } from '../../components/common/Button/Button';
import {
  useSubAdmins,
  useCreateSubAdmin,
  useUpdateSubAdminPowers,
  useDeleteSubAdmin,
  useToggleSubAdminStatus,
} from '../../hooks/useSubAdmins';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import { useToast } from '../../context/ToastContext';
import { CreateSubAdminModal } from '../../components/rbac/CreateSubAdminModal';
import { EditSubAdminPowersModal } from '../../components/rbac/EditSubAdminPowersModal';
import { SubAdminNestedTable } from '../../components/rbac/SubAdminNestedTable';
import { SubAdminDetailsDrawer } from '../../components/rbac/SubAdminDetailsDrawer';
import { RevokeSubAdminModal } from '../../components/rbac/RevokeSubAdminModal';
import type { SubAdminUser, PowerSection, CreateSubAdminRequest } from '../../types/rbac.types';
import { Plus, ShieldAlert } from 'lucide-react';

export const SubAdminsPage: React.FC = () => {
  const { data: subAdmins = [], isLoading } = useSubAdmins();
  const createSubAdminMutation = useCreateSubAdmin();
  const updatePowersMutation = useUpdateSubAdminPowers();
  const deleteSubAdminMutation = useDeleteSubAdmin();
  const toggleStatusMutation = useToggleSubAdminStatus();

  const { user } = useAuth();
  const { isSuperAdmin } = usePermission();
  const { addToast } = useToast();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSubAdmin, setEditingSubAdmin] = useState<SubAdminUser | null>(null);
  const [revokingSubAdmin, setRevokingSubAdmin] = useState<SubAdminUser | null>(null);
  const [selectedSubAdminDetails, setSelectedSubAdminDetails] = useState<SubAdminUser | null>(null);

  // Check if logged-in user is direct parent creator or Super Admin
  const checkCanRevoke = (sub: SubAdminUser) => {
    if (isSuperAdmin) return true;
    if (!user) return false;

    if (sub.creatorId && user.id && sub.creatorId === user.id) return true;

    const createdByLower = (sub.createdBy || '').toLowerCase();
    const uNameLower = `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase();
    const uEmailLower = (user.email || '').toLowerCase();

    return (
      (uNameLower && createdByLower.length > 0 && createdByLower.includes(uNameLower)) ||
      (uEmailLower && createdByLower.length > 0 && createdByLower.includes(uEmailLower))
    );
  };

  const handleCreate = (payload: CreateSubAdminRequest) => {
    createSubAdminMutation.mutate(payload, {
      onSuccess: () => setIsCreateModalOpen(false),
    });
  };

  const handleUpdatePowers = (subAdminId: string, powers: PowerSection[], allowedDelegationPowers?: PowerSection[]) => {
    // Self-power escalation prevention check for sub-admins
    if (!isSuperAdmin && (user?.id === subAdminId || user?.email.toLowerCase() === editingSubAdmin?.email.toLowerCase())) {
      addToast({
        type: 'error',
        title: 'Power Escalation Restricted',
        description: 'Sub-admins cannot modify or escalate their own delegated section permissions.',
      });
      setEditingSubAdmin(null);
      return;
    }

    updatePowersMutation.mutate(
      { id: subAdminId, payload: { powers, allowedDelegationPowers } },
      {
        onSuccess: () => setEditingSubAdmin(null),
      }
    );
  };

  const handleConfirmRevoke = (id: string) => {
    const target = subAdmins.find((s) => s.id === id);
    if (target && !checkCanRevoke(target)) {
      addToast({
        type: 'error',
        title: 'Revocation Restricted',
        description: 'Only the Parent Sub-Admin Creator or Super Admin can delete this child sub-admin.',
      });
      setRevokingSubAdmin(null);
      return;
    }

    deleteSubAdminMutation.mutate(id, {
      onSuccess: () => {
        setRevokingSubAdmin(null);
        setSelectedSubAdminDetails(null);
      },
    });
  };

  const handleToggleStatus = (sub: SubAdminUser) => {
    const nextStatus = sub.status === 'active' ? 'suspended' : 'active';
    toggleStatusMutation.mutate({ id: sub.id, status: nextStatus });
  };

  return (
    <div className="subadmins-page font-sans">
      <PageHeader
        title="Sub-Admin Power Management"
        description="Delegate specific power sections (Societies, Vendors, Financials, Settings) to company sub-admin accounts."
        action={
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Sub-Admin
          </Button>
        }
      />

      <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-xs flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#541D26] text-[#C8A878] flex items-center justify-center shrink-0">
          <ShieldAlert size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#211A19]">Super Admin Control Center & Hierarchy Security</h4>
          <p className="text-xs text-[#78716C]">
            Sub-admins can only grant powers permitted by Super Admin. Sub-admin account revocation is strictly guarded: only the parent sub-admin creator or Super Admin can delete child accounts.
          </p>
        </div>
      </div>

      <SubAdminNestedTable
        subAdmins={subAdmins}
        currentUserId={user?.id}
        currentUserEmail={user?.email}
        currentUserName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
        isSuperAdmin={isSuperAdmin}
        onSelectSubAdmin={(sub) => setSelectedSubAdminDetails(sub)}
        onEditPowers={(sub) => setEditingSubAdmin(sub)}
        onRevoke={(sub) => {
          if (!checkCanRevoke(sub)) {
            addToast({
              type: 'error',
              title: 'Revocation Restricted',
              description: 'Only the Parent Sub-Admin Creator or Super Admin can delete this child sub-admin account.',
            });
            return;
          }
          setRevokingSubAdmin(sub);
        }}
      />

      {/* Sub-Admin Details Drawer */}
      <SubAdminDetailsDrawer
        isOpen={!!selectedSubAdminDetails}
        onClose={() => setSelectedSubAdminDetails(null)}
        subAdmin={selectedSubAdminDetails}
        allSubAdmins={subAdmins}
        currentUserId={user?.id}
        currentUserEmail={user?.email}
        currentUserName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
        isSuperAdmin={isSuperAdmin}
        onEditPowers={(sub) => {
          setSelectedSubAdminDetails(null);
          setEditingSubAdmin(sub);
        }}
        onRevoke={(sub) => {
          if (!checkCanRevoke(sub)) {
            addToast({
              type: 'error',
              title: 'Revocation Restricted',
              description: 'Only the Parent Sub-Admin Creator or Super Admin can delete this child sub-admin account.',
            });
            return;
          }
          setRevokingSubAdmin(sub);
        }}
        onToggleStatus={handleToggleStatus}
      />

      {/* Create Sub-Admin Modal */}
      <CreateSubAdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        isLoading={createSubAdminMutation.isPending}
      />

      {/* Edit Powers Modal */}
      <EditSubAdminPowersModal
        isOpen={!!editingSubAdmin}
        onClose={() => setEditingSubAdmin(null)}
        onConfirm={handleUpdatePowers}
        subAdmin={editingSubAdmin}
        isLoading={updatePowersMutation.isPending}
      />

      {/* Revoke Sub-Admin Warning Modal */}
      <RevokeSubAdminModal
        isOpen={!!revokingSubAdmin}
        onClose={() => setRevokingSubAdmin(null)}
        onConfirm={handleConfirmRevoke}
        subAdmin={revokingSubAdmin}
        isLoading={deleteSubAdminMutation.isPending}
      />
    </div>
  );
};
