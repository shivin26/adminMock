import React from 'react';

export interface FAIconProps {
  name: string; // e.g. "fa-solid fa-store" or "fa-users"
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: string;
  style?: React.CSSProperties;
}

export const FAIcon: React.FC<FAIconProps> = ({
  name,
  className = '',
  size,
  color,
  style,
}) => {
  const iconClass = name.startsWith('fa-') ? name : `fa-solid fa-${name}`;
  const sizeClass = size ? `fa-${size}` : '';

  return (
    <i
      className={`${iconClass} ${sizeClass} ${className}`.trim()}
      style={{ color, ...style }}
      aria-hidden="true"
    />
  );
};
