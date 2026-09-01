import React from 'react';
import { Loader2 } from 'lucide-react';
import type { Size } from '../../types/common.types';

export interface LoadingSpinnerProps {
  size?: Size;
  className?: string;
  label?: string;
}

const sizeMap: Record<Size, number> = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 32,
  xl: 48,
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  label,
}) => {
  return (
    <div className={`inline-flex items-center justify-center gap-2 text-[#211A19] ${className}`}>

      <Loader2 size={sizeMap[size]} className="animate-spin" />
      {label && <span className="text-xs font-medium text-slate-400">{label}</span>}
    </div>
  );
};
