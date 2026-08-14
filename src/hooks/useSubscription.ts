import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../api/services/subscription.service';
import {
  SubscriptionQueryParams,
  RenewSubscriptionPayload,
  CancelSubscriptionPayload,
  Subscription,
  SubscriptionAnalyticsData,
} from '../types/subscription';
import { PaginatedResponse } from '../types/api';
import { toast } from '../components/feedback/ToastSystem';

export const SUBSCRIPTIONS_QUERY_KEY = 'subscriptions';

export function useSubscriptions(params?: SubscriptionQueryParams) {
  return useQuery<PaginatedResponse<Subscription>>({
    queryKey: [SUBSCRIPTIONS_QUERY_KEY, params],
    queryFn: () => subscriptionService.getSubscriptions(params),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

export function useSubscriptionDetails(id: string) {
  return useQuery<Subscription>({
    queryKey: [SUBSCRIPTIONS_QUERY_KEY, 'detail', id],
    queryFn: () => subscriptionService.getSubscriptionById(id),
    enabled: Boolean(id),
  });
}

export function useSubscriptionAnalytics() {
  return useQuery<SubscriptionAnalyticsData>({
    queryKey: [SUBSCRIPTIONS_QUERY_KEY, 'analytics'],
    queryFn: () => subscriptionService.getSubscriptionAnalytics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRenewSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RenewSubscriptionPayload) =>
      subscriptionService.renewSubscription(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: [SUBSCRIPTIONS_QUERY_KEY] });
      const previousData = queryClient.getQueryData<PaginatedResponse<Subscription>>([
        SUBSCRIPTIONS_QUERY_KEY,
      ]);

      if (previousData) {
        queryClient.setQueriesData<PaginatedResponse<Subscription>>(
          { queryKey: [SUBSCRIPTIONS_QUERY_KEY] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.map((s) =>
                s.id === payload.subscriptionId
                  ? { ...s, plan: payload.plan, status: 'active', remainingDays: 30 }
                  : s
              ),
            };
          }
        );
      }

      return { previousData };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: [SUBSCRIPTIONS_QUERY_KEY] }, context.previousData);
      }
      toast.error('Renewal failed', error.message || 'Could not renew subscription.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTIONS_QUERY_KEY] });
    },
    onSuccess: (updatedSub) => {
      toast.success(
        'Subscription Renewed',
        `Successfully updated plan for ${updatedSub.storeName} to ${updatedSub.plan}.`
      );
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CancelSubscriptionPayload) =>
      subscriptionService.cancelSubscription(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: [SUBSCRIPTIONS_QUERY_KEY] });
      const previousData = queryClient.getQueryData<PaginatedResponse<Subscription>>([
        SUBSCRIPTIONS_QUERY_KEY,
      ]);

      if (previousData) {
        queryClient.setQueriesData<PaginatedResponse<Subscription>>(
          { queryKey: [SUBSCRIPTIONS_QUERY_KEY] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.map((s) =>
                s.id === payload.subscriptionId ? { ...s, status: 'cancelled', autoRenew: false } : s
              ),
            };
          }
        );
      }

      return { previousData };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: [SUBSCRIPTIONS_QUERY_KEY] }, context.previousData);
      }
      toast.error('Cancellation failed', error.message || 'Could not cancel subscription.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTIONS_QUERY_KEY] });
    },
    onSuccess: () => {
      toast.warning('Subscription Cancelled', 'The subscription plan has been set to cancelled.');
    },
  });
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: (id: string) => subscriptionService.downloadInvoice(id),
    onSuccess: (url, id) => {
      toast.success('Invoice Downloaded', `Invoice PDF generated for transaction ${id}.`);
      console.log(`Simulating file download from URL: ${url}`);
    },
    onError: (error: Error) => {
      toast.error('Download failed', error.message || 'Unable to generate PDF invoice.');
    },
  });
}
