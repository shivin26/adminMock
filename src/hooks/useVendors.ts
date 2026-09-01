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
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const usePendingVendors = () => {
  return useQuery({
    queryKey: CACHE_KEYS.vendors.pending,
    queryFn: () => vendorsApi.getPendingRequests(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useOnHoldVendors = () => {
  return useQuery({
    queryKey: ['vendors', 'on_hold'],
    queryFn: () => vendorsApi.getOnHoldVendors(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

import { logBackendMutation } from '../services/audit.service';

export const useApproveVendor = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (vendorId: string | number) => vendorsApi.approveVendor(vendorId),
    onSuccess: (data, vendorId) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.vendors.all });
      logBackendMutation('VENDORS', 'STATUS_CHANGE', `Approved vendor application #${vendorId}`, data.message, String(vendorId));
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

export const useHoldVendor = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({
      vendorId,
      subject,
      email_content,
    }: {
      vendorId: string | number;
      subject: string;
      email_content: string;
    }) => vendorsApi.holdVendor(vendorId, { subject, email_content }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.vendors.all });
      logBackendMutation('VENDORS', 'STATUS_CHANGE', `Placed vendor #${variables.vendorId} on hold`, `Subject: ${variables.subject}`, String(variables.vendorId));
      addToast({
        type: 'warning',
        title: 'Application Placed On Hold',
        description: data.message || 'Merchant application placed on hold. SMTP email notice sent to vendor.',
      });
    },
    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Hold Action Failed',
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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.vendors.all });
      logBackendMutation('VENDORS', 'STATUS_CHANGE', `Rejected vendor #${variables.vendorId} application`, `Reason: ${variables.reason || 'Unspecified'}`, String(variables.vendorId));
      addToast({
        type: 'info',
        title: 'Vendor Application Rejected',
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
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.vendors.all });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.vendors.pending });
      queryClient.invalidateQueries({ queryKey: ['vendors', 'on_hold'] });

      const isBlocking = variables.status === 'suspended';
      logBackendMutation('VENDORS', 'STATUS_CHANGE', `${isBlocking ? 'Blocked' : 'Unblocked'} vendor #${variables.vendorId}`, `Status changed to ${variables.status.toUpperCase()}`, String(variables.vendorId));

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

export const useUpdateVendorDetails = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({
      vendorId,
      payload,
    }: {
      vendorId: string | number;
      payload: Partial<Vendor> & Record<string, any>;
    }) => vendorsApi.updateVendorDetails(vendorId, payload),

    onSuccess: (updatedVendor) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.vendors.all });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.vendors.pending });
      queryClient.invalidateQueries({ queryKey: ['vendors', 'on_hold'] });

      logBackendMutation('VENDORS', 'UPDATE', `Updated backend parameters for vendor "${updatedVendor.storeName}" (#${updatedVendor.id})`, `Updated store name, owner, contact, address, or tax details.`, String(updatedVendor.id));

      addToast({
        type: 'success',
        title: 'Vendor Parameters Updated',
        description: `Vendor profile for "${updatedVendor.storeName}" saved successfully.`,
      });
    },
    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Vendor Update Failed',
        description: appErr.message,
      });
    },
  });
};

export const useVendorOrders = (vendorId?: string | number) => {
  return useQuery({
    queryKey: ['vendors', 'orders', vendorId],
    queryFn: () => vendorsApi.getVendorOrders(vendorId!),
    enabled: Boolean(vendorId),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};
