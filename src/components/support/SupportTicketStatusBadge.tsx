import React from 'react';
import { Badge } from '../common/Badge/Badge';
import type { TicketStatus, TicketPriority } from '../../types/support.types';

export interface SupportTicketStatusBadgeProps {
  status?: TicketStatus;
  priority?: TicketPriority;
}

export const SupportTicketStatusBadge: React.FC<SupportTicketStatusBadgeProps> = ({
  status,
  priority,
}) => {
  if (status) {
    switch (status) {
      case 'open':
        return <Badge variant="warning">OPEN</Badge>;
      case 'in_progress':
        return <Badge variant="primary">IN PROGRESS</Badge>;
      case 'resolved':
        return <Badge variant="success">RESOLVED</Badge>;
      case 'closed':
        return <Badge variant="neutral">CLOSED</Badge>;
      default:
        return <Badge variant="neutral">{String(status).toUpperCase()}</Badge>;
    }
  }

  if (priority) {
    switch (priority) {
      case 'urgent':
        return <Badge variant="danger">URGENT SLA</Badge>;
      case 'high':
        return <Badge variant="warning">HIGH PRIORITY</Badge>;
      case 'medium':
        return <Badge variant="primary">MEDIUM</Badge>;
      case 'low':
        return <Badge variant="neutral">LOW</Badge>;
      default:
        return <Badge variant="neutral">{String(priority).toUpperCase()}</Badge>;
    }
  }

  return null;
};
