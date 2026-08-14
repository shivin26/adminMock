import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorsApi } from '../services/api/vendors.api';
import type { VendorListParams } from '../services/api/vendors.api';
import { useToast } from '../context/ToastContext';
import { ErrorHandler } from '../services/handlers/errorHandler';
import { CACHE_KEYS } from '../constants/cache.keys';

export const useVendors = (params?: VendorListParams) => {
  return useQuery({
    queryKey: CACHE_KEYS.vendors.list(params),
    queryFn: () => vendorsApi.getAllVendors(params),
    staleTime: 3 * 60 * 1000,
  });
};

export const usePendingVendors = () => {
  return useQuery({
    queryKey: CACHE_KEYS.vendors.pending,
    queryFn: () => vendorsApi.getPendingRequests(),
    staleTime: 1 * 60 * 1000,
  });
};

export const useApproveVendor = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (vendorId: string | number) => vendorsApi.approveVendor(vendorId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.vendors.all });
      addToast({
        type: 'success',
        title: 'Vendor Approved',
        description: data.message || 'Vendor onboarding application approved successfully.',
      });
    },
    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Approval Failed',
        description: appErr.message,
      });
    },
  });
};

export const useRejectVendor = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ vendorId, reason }: { vendorId: string | number; reason?: string }) =>
      vendorsApi.rejectVendor(vendorId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.vendors.all });
      addToast({
        type: 'info',
        title: 'Vendor Rejected',
        description: data.message || 'Vendor onboarding application has been rejected.',
      });
    },
    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Rejection Failed',
        description: appErr.message,
      });
    },
  });
};

export const useToggleVendorStatus = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({
      vendorId,
      status,
    }: {
      vendorId: string | number;
      status: 'active' | 'suspended';
    }) => vendorsApi.toggleVendorStatus(vendorId, status),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.vendors.all });
      const isBlocking = variables.status === 'suspended';
      addToast({
        type: isBlocking ? 'warning' : 'success',
        title: isBlocking ? 'Vendor Account Blocked' : 'Vendor Account Activated',
        description: isBlocking
          ? 'Vendor account suspended and access blocked.'
          : 'Vendor account reactivated successfully.',
      });
    },
    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Status Update Failed',
        description: appErr.message,
      });
    },
  });
};
