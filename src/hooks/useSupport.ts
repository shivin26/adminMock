import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportApi } from '../services/api/support.api';
import type {
  TicketStatus,
  TicketPriority,
  CreateTicketRequest,
  SendReplyRequest,
} from '../types/support.types';
import { useToast } from '../context/ToastContext';
import { ErrorHandler } from '../services/handlers/errorHandler';
import { CACHE_KEYS } from '../constants/cache.keys';

export interface TicketFilterParams {
  status?: string;
  category?: string;
  search?: string;
}

export const useTickets = (filters?: TicketFilterParams) => {
  return useQuery({
    queryKey: CACHE_KEYS.support.list(filters),
    queryFn: () => supportApi.getTickets(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useTicketDetails = (ticketId?: string | number) => {
  return useQuery({
    queryKey: CACHE_KEYS.support.detail(ticketId || ''),
    queryFn: () => supportApi.getTicketById(ticketId!),
    enabled: !!ticketId,
    staleTime: 1 * 60 * 1000,
  });
};

export const useTicketMessages = (ticketId?: string | number) => {
  return useQuery({
    queryKey: CACHE_KEYS.support.messages(ticketId || ''),
    queryFn: () => supportApi.getTicketMessages(ticketId!),
    enabled: !!ticketId,
    staleTime: 30 * 1000,
  });
};

export const useSendTicketReply = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({
      ticketId,
      payload,
    }: {
      ticketId: string | number;
      payload: SendReplyRequest;
    }) => supportApi.sendTicketReply(ticketId, payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.support.all });
      addToast({
        type: 'success',
        title: 'Response Dispatched',
        description: variables.payload.isInternalNote
          ? 'Internal staff note added to ticket history.'
          : 'Support response sent to user.',
      });
    },

    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Failed to Send Response',
        description: appErr.message,
      });
    },
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      status,
      priority,
      assignedTo,
    }: {
      ticketId: string | number;
      status?: TicketStatus;
      priority?: TicketPriority;
      assignedTo?: string;
    }) => supportApi.updateTicketStatus(ticketId, status, priority, assignedTo),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.support.all });
    },
  });
};

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateTicketRequest) => supportApi.createTicket(payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.support.all });
      addToast({
        type: 'success',
        title: 'Ticket Created',
        description: `Support Ticket ${data.ticketNumber} logged successfully.`,
      });
    },
    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Ticket Creation Failed',
        description: appErr.message,
      });
    },
  });
};

export const useEscalateTicket = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (ticketId: string | number) => supportApi.escalateTicket(ticketId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.support.all });
      addToast({
        type: 'warning',
        title: 'Priority Escalated',
        description: `Ticket ${data.ticketNumber} priority escalated to ${data.priority.toUpperCase()}`,
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Escalation Blocked',
        description: error.message || 'Ticket is already at highest priority level (URGENT).',
      });
    },
  });
};

export const useDeescalateTicket = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (ticketId: string | number) => supportApi.deescalateTicket(ticketId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.support.all });
      addToast({
        type: 'info',
        title: 'Priority De-escalated',
        description: `Ticket ${data.ticketNumber} priority lowered to ${data.priority.toUpperCase()}`,
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'De-escalation Blocked',
        description: error.message || 'Ticket is already at lowest priority level (LOW).',
      });
    },
  });
};

export const useMergeTickets = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ ticketId, targetMaster }: { ticketId: string | number; targetMaster: string }) =>
      supportApi.mergeTickets(ticketId, targetMaster),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.support.all });
      addToast({
        type: 'success',
        title: 'Tickets Merged',
        description: data.message || `Merged ticket into ${data.targetMaster}`,
      });
    },
    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Merge Failed',
        description: appErr.message,
      });
    },
  });
};

export const useUnmergeTickets = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ ticketId, childTicket }: { ticketId: string | number; childTicket: string }) =>
      supportApi.unmergeTickets(ticketId, childTicket),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.support.all });
      addToast({
        type: 'info',
        title: 'Ticket Unmerged',
        description: data.message || `Unmerged child ticket ${data.childTicket}`,
      });
    },
    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Unmerge Failed',
        description: appErr.message,
      });
    },
  });
};

export const useManageFollowers = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({
      ticketId,
      followerName,
      action,
    }: {
      ticketId: string | number;
      followerName: string;
      action: 'add' | 'remove';
    }) => supportApi.manageFollowers(ticketId, followerName, action),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.support.all });
      addToast({
        type: 'success',
        title: 'Followers Updated',
        description: data.message,
      });
    },
    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Follower Update Failed',
        description: appErr.message,
      });
    },
  });
};
