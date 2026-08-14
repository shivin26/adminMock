import React from 'react';
import './EmptyState.css';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  description = 'There are no records to display at the moment.',
  action,
  icon = <Inbox size={36} />,
}) => {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">{icon}</div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-desc">{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};
