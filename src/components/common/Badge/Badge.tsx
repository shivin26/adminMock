import React, { memo } from 'react';
import './Badge.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = memo(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  return (
    <span
      className={`custom-badge badge-${variant} size-${size} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';
