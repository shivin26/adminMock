import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorService } from '../api/services/vendor.service';
import type {
  VendorQueryParams,
  CreateVendorPayload,
  UpdateVendorPayload,
  BulkVendorActionPayload,
  Vendor,
  VendorStatus,
} from '../types/vendor';
import type { PaginatedResponse } from '../types/api';
import { toast } from '../components/feedback/ToastSystem';

export const VENDORS_QUERY_KEY = 'vendors';

export function useVendors(params?: VendorQueryParams) {
  return useQuery<PaginatedResponse<Vendor>>({
    queryKey: [VENDORS_QUERY_KEY, params],
    queryFn: () => vendorService.getVendors(params),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

export function useVendorDetails(id: string) {
  return useQuery<Vendor>({
    queryKey: [VENDORS_QUERY_KEY, 'detail', id],
    queryFn: () => vendorService.getVendorById(id),
    enabled: Boolean(id),
  });
}

export function useVendorPayments(id: string) {
  return useQuery({
    queryKey: [VENDORS_QUERY_KEY, 'payments', id],
    queryFn: () => vendorService.getVendorPayments(id),
    enabled: Boolean(id),
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVendorPayload) => vendorService.createVendor(payload),
    onSuccess: (newVendor) => {
      queryClient.invalidateQueries({ queryKey: [VENDORS_QUERY_KEY] });
      toast.success('Vendor Onboarded', `Successfully created ${newVendor.storeName}`);
    },
    onError: (error: Error) => {
      toast.error('Onboarding failed', error.message || 'Could not register vendor.');
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVendorPayload }) =>
      vendorService.updateVendor(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: [VENDORS_QUERY_KEY] });
      const previousData = queryClient.getQueryData<PaginatedResponse<Vendor>>([
        VENDORS_QUERY_KEY,
      ]);

      if (previousData) {
        queryClient.setQueriesData<PaginatedResponse<Vendor>>(
          { queryKey: [VENDORS_QUERY_KEY] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.map((v) => (v.id === id ? { ...v, ...payload } : v)),
            };
          }
        );
      }

      return { previousData };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: [VENDORS_QUERY_KEY] }, context.previousData);
      }
      toast.error('Update failed', error.message || 'Could not update vendor.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [VENDORS_QUERY_KEY] });
    },
    onSuccess: () => {
      toast.success('Vendor Updated', 'Changes saved successfully.');
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vendorService.deleteVendor(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: [VENDORS_QUERY_KEY] });
      const previousData = queryClient.getQueryData<PaginatedResponse<Vendor>>([
        VENDORS_QUERY_KEY,
      ]);

      if (previousData) {
        queryClient.setQueriesData<PaginatedResponse<Vendor>>(
          { queryKey: [VENDORS_QUERY_KEY] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.filter((v) => v.id !== deletedId),
            };
          }
        );
      }

      return { previousData };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: [VENDORS_QUERY_KEY] }, context.previousData);
      }
      toast.error('Deletion failed', error.message || 'Could not delete vendor.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [VENDORS_QUERY_KEY] });
    },
    onSuccess: () => {
      toast.success('Vendor Removed', 'Vendor account deleted successfully.');
    },
  });
}

export function useToggleVendorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: VendorStatus }) =>
      vendorService.toggleVendorStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: [VENDORS_QUERY_KEY] });
      const previousData = queryClient.getQueryData<PaginatedResponse<Vendor>>([
        VENDORS_QUERY_KEY,
      ]);

      if (previousData) {
        queryClient.setQueriesData<PaginatedResponse<Vendor>>(
          { queryKey: [VENDORS_QUERY_KEY] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.map((v) => (v.id === id ? { ...v, status } : v)),
            };
          }
        );
      }

      return { previousData };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: [VENDORS_QUERY_KEY] }, context.previousData);
      }
      toast.error('Status change failed', error.message || 'Could not toggle status.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [VENDORS_QUERY_KEY] });
    },
    onSuccess: (_data, variables) => {
      toast.success(
        'Status Changed',
        `Vendor has been ${
          variables.status === 'active'
            ? 'activated'
            : variables.status === 'suspended'
            ? 'suspended'
            : 'set to pending'
        }.`
      );
    },
  });
}

export function useBulkVendorAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkVendorActionPayload) => vendorService.bulkVendorAction(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: [VENDORS_QUERY_KEY] });
      const previousData = queryClient.getQueryData<PaginatedResponse<Vendor>>([
        VENDORS_QUERY_KEY,
      ]);

      if (previousData) {
        queryClient.setQueriesData<PaginatedResponse<Vendor>>(
          { queryKey: [VENDORS_QUERY_KEY] },
          (old) => {
            if (!old) return old;
            if (payload.action === 'delete') {
              return {
                ...old,
                items: old.items.filter((v) => !payload.ids.includes(v.id)),
              };
            }
            const newStatus: VendorStatus = payload.action === 'activate' ? 'active' : 'suspended';
            return {
              ...old,
              items: old.items.map((v) => (payload.ids.includes(v.id) ? { ...v, status: newStatus } : v)),
            };
          }
        );
      }

      return { previousData };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: [VENDORS_QUERY_KEY] }, context.previousData);
      }
      toast.error('Bulk action failed', error.message || 'Could not execute operation.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [VENDORS_QUERY_KEY] });
    },
    onSuccess: (_data, variables) => {
      toast.success('Bulk Operation Complete', `Executed ${variables.action} on ${variables.ids.length} vendors.`);
    },
  });
}
