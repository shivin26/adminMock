import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../services/api/subscriptions.api';
import type { SubscriptionListParams } from '../services/api/subscriptions.api';
import type { SubscriptionRenewalRequest } from '../types/subscription.types';
import { useToast } from '../context/ToastContext';
import { ErrorHandler } from '../services/handlers/errorHandler';
import { CACHE_KEYS } from '../constants/cache.keys';

export const useSubscriptions = (params?: SubscriptionListParams) => {
  return useQuery({
    queryKey: CACHE_KEYS.subscriptions.list(params),
    queryFn: () => subscriptionsApi.getSubscriptions(params),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useSubscriptionStats = () => {
  return useQuery({
    queryKey: CACHE_KEYS.subscriptions.stats,
    queryFn: () => subscriptionsApi.getStats(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useRenewSubscription = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: SubscriptionRenewalRequest }) =>
      subscriptionsApi.renewSubscription(id, payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.subscriptions.all });
      addToast({
        type: 'success',
        title: 'Subscription Extended',
        description: data.message || 'Subscription extended successfully.',
      });
    },
    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Renewal Error',
        description: appErr.message,
      });
    },
  });
};

export const useDownloadInvoice = () => {
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (id: string | number) => subscriptionsApi.getInvoice(id),
    onSuccess: (invoice) => {
      addToast({
        type: 'info',
        title: 'Invoice Ready',
        description: `Downloaded tax invoice ${invoice.invoiceId} for ${invoice.storeName}.`,
      });
    },
    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Download Error',
        description: appErr.message,
      });
    },
  });
};
