import React from 'react';
import { Plus, Download, RefreshCw, Sliders } from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from '../feedback/ToastSystem';

export interface QuickActionsBarProps {
  onRefresh?: () => void;
  onOpenAddVendorModal?: () => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onRefresh,
  onOpenAddVendorModal,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="ink"
        size="sm"
        leftIcon={<Plus className="h-4 w-4" />}
        onClick={onOpenAddVendorModal || (() => toast.info('Action Triggered', 'Onboard Vendor modal initiated.'))}
      >
        Onboard Vendor
      </Button>

      <Button
        variant="default"
        size="sm"
        leftIcon={<Download className="h-4 w-4" />}
        onClick={() => toast.success('Report Export', 'Generating CSV export for quarterly metrics...')}
      >
        Export Report
      </Button>

      <Button
        variant="outline"
        size="sm"
        leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        onClick={onRefresh || (() => toast.info('Refreshed', 'Dashboard data synchronized.'))}
      >
        Refresh Feed
      </Button>

      <Button
        variant="secondary"
        size="sm"
        leftIcon={<Sliders className="h-3.5 w-3.5" />}
        onClick={() => toast.info('Settings', 'Opening system configuration preferences.')}
      >
        Platform Settings
      </Button>
    </div>
  );
};
