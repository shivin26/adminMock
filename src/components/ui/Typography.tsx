import React from 'react';
import type { BaseProps } from '../../types/common.types';

export interface TypographyProps extends BaseProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'subtitle' | 'body' | 'caption';
  as?: React.ElementType;
  className?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  as,
  className = '',
  children,
  ...props
}) => {
  const Component = (as ||
    (variant === 'h1' || variant === 'h2' || variant === 'h3' || variant === 'h4'
      ? variant
      : variant === 'caption'
      ? 'span'
      : 'p')) as React.ElementType;



  const variantClasses: Record<string, string> = {
    h1: 'text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100',
    h2: 'text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100',
    h3: 'text-xl font-semibold text-slate-900 dark:text-slate-100',
    h4: 'text-lg font-medium text-slate-900 dark:text-slate-100',
    subtitle: 'text-sm font-medium text-slate-500 dark:text-slate-400',
    body: 'text-sm text-slate-700 dark:text-slate-300 leading-relaxed',
    caption: 'text-xs text-slate-500 dark:text-slate-400',
  };

  return (
    <Component className={`${variantClasses[variant] || ''} ${className}`} {...props}>
      {children}
    </Component>
  );
};
