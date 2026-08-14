import type { ReactNode } from 'react';

export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'ghost';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
