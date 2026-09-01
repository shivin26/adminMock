import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subAdminsApi } from '../services/api/subadmins.api';
import type {
  CreateSubAdminRequest,
  UpdateSubAdminPowersRequest,
} from '../types/rbac.types';
import { useToast } from '../context/ToastContext';
import { ErrorHandler } from '../services/handlers/errorHandler';

export const SUBADMIN_QUERY_KEYS = {
  all: ['subadmins'] as const,
  list: ['subadmins', 'list'] as const,
};

export const useSubAdmins = () => {
  return useQuery({
    queryKey: SUBADMIN_QUERY_KEYS.list,
    queryFn: () => subAdminsApi.getSubAdmins(),
    staleTime: 2 * 60 * 1000,
  });
};

import { logBackendMutation } from '../services/audit.service';

export const useCreateSubAdmin = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateSubAdminRequest) => subAdminsApi.createSubAdmin(payload),

    onSuccess: (newSubAdmin) => {
      queryClient.invalidateQueries({ queryKey: SUBADMIN_QUERY_KEYS.all });
      logBackendMutation('SUB_ADMINS', 'CREATE', `Created Sub-Admin account "${newSubAdmin.name}" (${newSubAdmin.email})`, `Assigned powers: ${newSubAdmin.powers.join(', ')}`, String(newSubAdmin.id));
      addToast({
        type: 'success',
        title: 'Sub-Admin Account Created',
        description: `Created sub-admin account for ${newSubAdmin.name} with ${newSubAdmin.powers.length} power section(s).`,
      });
    },

    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Creation Error',
        description: appErr.message,
      });
    },
  });
};

export const useUpdateSubAdminPowers = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSubAdminPowersRequest }) =>
      subAdminsApi.updateSubAdminPowers(id, payload),

    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: SUBADMIN_QUERY_KEYS.all });
      logBackendMutation('SUB_ADMINS', 'UPDATE', `Updated power permissions for Sub-Admin "${updated.name}"`, `New powers: ${updated.powers.join(', ')}`, String(updated.id));
      addToast({
        type: 'success',
        title: 'Powers Updated',
        description: `Updated power permissions for ${updated.name}.`,
      });
    },

    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Update Error',
        description: appErr.message,
      });
    },
  });
};

export const useDeleteSubAdmin = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => subAdminsApi.deleteSubAdmin(id),

    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: SUBADMIN_QUERY_KEYS.all });
      logBackendMutation('SUB_ADMINS', 'DELETE', `Revoked access for Sub-Admin #${id}`, 'Account deleted or access revoked.', String(id));
      addToast({
        type: 'info',
        title: 'Sub-Admin Revoked',
        description: 'Sub-admin account access has been revoked.',
      });
    },
    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Revocation Error',
        description: appErr.message,
      });
    },
  });
};

export const useToggleSubAdminStatus = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status?: 'active' | 'suspended' | 'blocked' }) =>
      subAdminsApi.toggleSubAdminStatus(id, status),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SUBADMIN_QUERY_KEYS.all });
      addToast({
        type: 'success',
        title: 'Status Updated',
        description: data.message,
      });
    },

    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Status Update Error',
        description: appErr.message,
      });
    },
  });
};
