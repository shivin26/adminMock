import { useQuery, useMutation } from '@tanstack/react-query';
import { reportService } from '../api/services/report.service';
import { TimeframeGranularity, ExportReportPayload, ReportsTelemetryData } from '../types/report';
import { toast } from '../components/feedback/ToastSystem';

export const REPORTS_QUERY_KEY = 'reports';

export function useReportsTelemetry(timeframe: TimeframeGranularity = 'monthly') {
  return useQuery<ReportsTelemetryData>({
    queryKey: [REPORTS_QUERY_KEY, 'telemetry', timeframe],
    queryFn: () => reportService.getReportsTelemetry(timeframe),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: (payload: ExportReportPayload) => reportService.exportReport(payload),
    onSuccess: (data, variables) => {
      toast.success(
        'Export Generated',
        `Successfully generated ${variables.format.toUpperCase()} report: ${data.filename}`
      );
    },
    onError: (error: Error) => {
      toast.error('Export failed', error.message || 'Could not export report file.');
    },
  });
}
