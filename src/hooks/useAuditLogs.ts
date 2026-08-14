import { useQuery, useMutation } from '@tanstack/react-query';
import { auditService } from '../api/services/audit.service';
import { AuditQueryParams, AuditExportPayload, AuditLogEntry } from '../types/audit';
import { PaginatedResponse } from '../types/api';
import { toast } from '../components/feedback/ToastSystem';

export const AUDIT_LOGS_QUERY_KEY = 'audit-logs';

export function useAuditLogs(params?: AuditQueryParams) {
  return useQuery<PaginatedResponse<AuditLogEntry>>({
    queryKey: [AUDIT_LOGS_QUERY_KEY, params],
    queryFn: () => auditService.getAuditLogs(params),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

export function useAuditLogDetails(id: string) {
  return useQuery<AuditLogEntry>({
    queryKey: [AUDIT_LOGS_QUERY_KEY, 'detail', id],
    queryFn: () => auditService.getAuditLogById(id),
    enabled: Boolean(id),
  });
}

export function useExportAuditLog() {
  return useMutation({
    mutationFn: (payload: AuditExportPayload) => auditService.exportAuditLog(payload),
    onSuccess: (data, variables) => {
      toast.success(
        'Audit Export Generated',
        `Generated ${variables.format.toUpperCase()} report: ${data.filename}`
      );
    },
    onError: (error: Error) => {
      toast.error('Export failed', error.message || 'Could not export audit log file.');
    },
  });
}
