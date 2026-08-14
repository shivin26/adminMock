import React from 'react';
import { FileSpreadsheet, FileText, FileCode } from 'lucide-react';
import { Button } from '../ui/Button';
import { TimeframeGranularity, ExportFormat } from '../../types/report';

export interface ReportExportBarProps {
  timeframe: TimeframeGranularity;
  onTimeframeChange: (tf: TimeframeGranularity) => void;
  onExport: (format: ExportFormat) => void;
  isExporting?: boolean;
}

export const ReportExportBar: React.FC<ReportExportBarProps> = ({
  timeframe,
  onTimeframeChange,
  onExport,
  isExporting = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
      {/* Timeframe Granularity Tabs */}
      <div className="flex items-center gap-1 bg-[var(--secondary)] p-1 rounded-md border border-[var(--border)]">
        {[
          { id: 'daily', label: 'Daily View' },
          { id: 'monthly', label: 'Monthly View' },
          { id: 'yearly', label: 'Yearly View' },
        ].map((tf) => (
          <button
            key={tf.id}
            onClick={() => onTimeframeChange(tf.id as TimeframeGranularity)}
            className={`px-3.5 py-1.5 rounded text-xs font-mono-meta font-semibold transition cursor-pointer ${
              timeframe === tf.id
                ? 'bg-[var(--gold)] text-black shadow-xs font-bold'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Export Action Controls */}
      <div className="flex items-center gap-2">
        <span className="font-mono-meta text-[10px] text-[var(--muted-foreground)] mr-1 hidden sm:inline">
          EXPORT DATA:
        </span>

        <Button
          variant="outline"
          size="sm"
          isLoading={isExporting}
          leftIcon={<FileCode className="h-3.5 w-3.5 text-emerald-600" />}
          onClick={() => onExport('csv')}
        >
          CSV
        </Button>

        <Button
          variant="outline"
          size="sm"
          isLoading={isExporting}
          leftIcon={<FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />}
          onClick={() => onExport('excel')}
        >
          Excel
        </Button>

        <Button
          variant="default"
          size="sm"
          isLoading={isExporting}
          leftIcon={<FileText className="h-3.5 w-3.5 text-[var(--gold)]" />}
          onClick={() => onExport('pdf')}
        >
          Export PDF
        </Button>
      </div>
    </div>
  );
};
