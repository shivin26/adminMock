import React, { memo } from 'react';
import './StatCard.css';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = memo(({
  title,
  value,
  change,
  isPositive = true,
  icon,
  subtitle,
  onClick,
}) => {
  return (
    <div
      className="stat-card glass-panel animate-fade-in"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {icon && <div className="stat-card-icon">{icon}</div>}
      </div>

      <div className="stat-card-body">
        <span className="stat-card-value">{value}</span>
        {change && (
          <div className={`stat-card-change ${isPositive ? 'positive' : 'negative'}`}>
            <span>{isPositive ? '↑' : '↓'}</span>
            <span>{change}</span>
          </div>
        )}
        {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';
