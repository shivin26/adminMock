import React from 'react';
import type { BaseProps } from '../../types/common.types';

export interface LoadingSkeletonProps extends BaseProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = '0.375rem',
  className = '',
}) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700/60 ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  );
};
