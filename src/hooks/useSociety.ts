import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { societyService } from '../api/services/society.service';
import {
  SocietyQueryParams,
  CreateSocietyPayload,
  UpdateSocietyPayload,
  BulkSocietyActionPayload,
  Society,
} from '../types/society';
import { PaginatedResponse } from '../types/api';
import { toast } from '../components/feedback/ToastSystem';

export const SOCIETIES_QUERY_KEY = 'societies';

export function useSocieties(params?: SocietyQueryParams) {
  return useQuery<PaginatedResponse<Society>>({
    queryKey: [SOCIETIES_QUERY_KEY, params],
    queryFn: () => societyService.getSocieties(params),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

export function useSocietyDetails(id: string) {
  return useQuery<Society>({
    queryKey: [SOCIETIES_QUERY_KEY, 'detail', id],
    queryFn: () => societyService.getSocietyById(id),
    enabled: Boolean(id),
  });
}

export function useSocietyVendors(id: string) {
  return useQuery({
    queryKey: [SOCIETIES_QUERY_KEY, 'vendors', id],
    queryFn: () => societyService.getSocietyVendors(id),
    enabled: Boolean(id),
  });
}

export function useCreateSociety() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSocietyPayload) => societyService.createSociety(payload),
    onSuccess: (newSoc) => {
      queryClient.invalidateQueries({ queryKey: [SOCIETIES_QUERY_KEY] });
      toast.success('Society Created', `Successfully added ${newSoc.name}`);
    },
    onError: (error: Error) => {
      toast.error('Creation failed', error.message || 'Could not create society.');
    },
  });
}

export function useUpdateSociety() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSocietyPayload }) =>
      societyService.updateSociety(id, payload),
    onMutate: async ({ id, payload }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [SOCIETIES_QUERY_KEY] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<PaginatedResponse<Society>>([
        SOCIETIES_QUERY_KEY,
      ]);

      // Optimistically update cache
      if (previousData) {
        queryClient.setQueriesData<PaginatedResponse<Society>>(
          { queryKey: [SOCIETIES_QUERY_KEY] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.map((s) => (s.id === id ? { ...s, ...payload } : s)),
            };
          }
        );
      }

      return { previousData };
    },
    onError: (error: Error, _vars, context) => {
      // Rollback to previous state on failure
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: [SOCIETIES_QUERY_KEY] }, context.previousData);
      }
      toast.error('Update failed', error.message || 'Could not update society.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [SOCIETIES_QUERY_KEY] });
    },
    onSuccess: () => {
      toast.success('Society Updated', 'Changes saved successfully.');
    },
  });
}

export function useDeleteSociety() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => societyService.deleteSociety(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: [SOCIETIES_QUERY_KEY] });
      const previousData = queryClient.getQueryData<PaginatedResponse<Society>>([
        SOCIETIES_QUERY_KEY,
      ]);

      if (previousData) {
        queryClient.setQueriesData<PaginatedResponse<Society>>(
          { queryKey: [SOCIETIES_QUERY_KEY] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.filter((s) => s.id !== deletedId),
            };
          }
        );
      }

      return { previousData };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: [SOCIETIES_QUERY_KEY] }, context.previousData);
      }
      toast.error('Deletion failed', error.message || 'Could not delete society.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [SOCIETIES_QUERY_KEY] });
    },
    onSuccess: () => {
      toast.success('Society Deleted', 'The society has been removed from the platform.');
    },
  });
}

export function useToggleSocietyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      societyService.toggleSocietyStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: [SOCIETIES_QUERY_KEY] });
      const previousData = queryClient.getQueryData<PaginatedResponse<Society>>([
        SOCIETIES_QUERY_KEY,
      ]);

      if (previousData) {
        queryClient.setQueriesData<PaginatedResponse<Society>>(
          { queryKey: [SOCIETIES_QUERY_KEY] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.map((s) => (s.id === id ? { ...s, status } : s)),
            };
          }
        );
      }

      return { previousData };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: [SOCIETIES_QUERY_KEY] }, context.previousData);
      }
      toast.error('Status toggle failed', error.message || 'Could not change society status.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [SOCIETIES_QUERY_KEY] });
    },
    onSuccess: (_data, variables) => {
      toast.success(
        'Status Changed',
        `Society has been ${variables.status === 'active' ? 'activated' : 'deactivated'}.`
      );
    },
  });
}

export function useBulkSocietyAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkSocietyActionPayload) => societyService.bulkSocietyAction(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: [SOCIETIES_QUERY_KEY] });
      const previousData = queryClient.getQueryData<PaginatedResponse<Society>>([
        SOCIETIES_QUERY_KEY,
      ]);

      if (previousData) {
        queryClient.setQueriesData<PaginatedResponse<Society>>(
          { queryKey: [SOCIETIES_QUERY_KEY] },
          (old) => {
            if (!old) return old;
            if (payload.action === 'delete') {
              return {
                ...old,
                items: old.items.filter((s) => !payload.ids.includes(s.id)),
              };
            }
            const newStatus = payload.action === 'activate' ? 'active' : 'inactive';
            return {
              ...old,
              items: old.items.map((s) => (payload.ids.includes(s.id) ? { ...s, status: newStatus } : s)),
            };
          }
        );
      }

      return { previousData };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: [SOCIETIES_QUERY_KEY] }, context.previousData);
      }
      toast.error('Bulk action failed', error.message || 'Could not complete bulk operation.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [SOCIETIES_QUERY_KEY] });
    },
    onSuccess: (_data, variables) => {
      toast.success('Bulk Operation Complete', `Executed ${variables.action} on ${variables.ids.length} societies.`);
    },
  });
}
