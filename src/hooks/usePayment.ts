import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../api/services/payment.service';
import {
  PaymentQueryParams,
  IssueRefundPayload,
  PaymentTransaction,
  RevenueDashboardData,
} from '../types/payment';
import { PaginatedResponse } from '../types/api';
import { toast } from '../components/feedback/ToastSystem';

export const PAYMENTS_QUERY_KEY = 'payments';

export function usePayments(params?: PaymentQueryParams) {
  return useQuery<PaginatedResponse<PaymentTransaction>>({
    queryKey: [PAYMENTS_QUERY_KEY, params],
    queryFn: () => paymentService.getPayments(params),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

export function usePaymentDetails(id: string) {
  return useQuery<PaymentTransaction>({
    queryKey: [PAYMENTS_QUERY_KEY, 'detail', id],
    queryFn: () => paymentService.getPaymentById(id),
    enabled: Boolean(id),
  });
}

export function useRevenueDashboard() {
  return useQuery<RevenueDashboardData>({
    queryKey: [PAYMENTS_QUERY_KEY, 'revenue-dashboard'],
    queryFn: () => paymentService.getRevenueDashboard(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useIssueRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IssueRefundPayload) => paymentService.issueRefund(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: [PAYMENTS_QUERY_KEY] });
      const previousData = queryClient.getQueryData<PaginatedResponse<PaymentTransaction>>([
        PAYMENTS_QUERY_KEY,
      ]);

      if (previousData) {
        queryClient.setQueriesData<PaginatedResponse<PaymentTransaction>>(
          { queryKey: [PAYMENTS_QUERY_KEY] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.map((p) =>
                p.id === payload.transactionId
                  ? { ...p, status: 'refunded', refundReason: payload.reason }
                  : p
              ),
            };
          }
        );
      }

      return { previousData };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: [PAYMENTS_QUERY_KEY] }, context.previousData);
      }
      toast.error('Refund processing failed', error.message || 'Could not issue refund.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY] });
    },
    onSuccess: (updatedTxn) => {
      toast.success(
        'Refund Processed',
        `Issued $${updatedTxn.amount} refund for transaction ${updatedTxn.id} via payment gateway.`
      );
    },
  });
}

export function useDownloadReceipt() {
  return useMutation({
    mutationFn: (id: string) => paymentService.downloadReceipt(id),
    onSuccess: (_url, id) => {
      toast.success('Receipt Downloaded', `Generated payment receipt PDF for transaction ${id}.`);
    },
    onError: (error: Error) => {
      toast.error('Download failed', error.message || 'Unable to generate receipt PDF.');
    },
  });
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: (id: string) => paymentService.downloadInvoice(id),
    onSuccess: (_url, id) => {
      toast.success('Tax Invoice Downloaded', `Generated tax invoice PDF for transaction ${id}.`);
    },
    onError: (error: Error) => {
      toast.error('Download failed', error.message || 'Unable to generate invoice PDF.');
    },
  });
}
