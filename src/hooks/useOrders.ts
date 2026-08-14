import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../services/api/orders.api';

export const ORDER_CACHE_KEYS = {
  all: ['orders'] as const,
  list: (params?: Record<string, any>) => ['orders', 'list', params] as const,
  detail: (orderId: string) => ['orders', 'detail', orderId] as const,
};

export const useOrders = (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ORDER_CACHE_KEYS.list(params),
    queryFn: () => ordersApi.getOrders(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useOrderDetails = (orderId?: string) => {
  return useQuery({
    queryKey: ORDER_CACHE_KEYS.detail(orderId || ''),
    queryFn: () => ordersApi.getOrderById(orderId!),
    enabled: Boolean(orderId),
    staleTime: 1 * 60 * 1000,
  });
};

export const useIssueOrderRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, amount }: { orderId: string; amount: number }) =>
      ordersApi.issueRefund(orderId, amount),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ORDER_CACHE_KEYS.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ORDER_CACHE_KEYS.all });
    },
  });
};

export const useFlagOrderAudit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.flagForAudit(orderId),
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ORDER_CACHE_KEYS.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: ORDER_CACHE_KEYS.all });
    },
  });
};
