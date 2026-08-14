import type { SupportTicket, TicketMessage } from '../../types/support.types';

export const mapRawTicketToDomain = (raw: any): SupportTicket => {
  const userType = (raw.user_type === 'society_admin' ? 'user' : (raw.user_type || raw.userType)) || 'user';
  const source = userType === 'user' ? 'landing_website' : ((raw.source as any) || 'vendor_portal');

  return {
    id: String(raw.id || raw.ticket_id || `t-${Math.random()}`),
    ticketNumber: raw.ticket_number || raw.ticketNumber || `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
    subject: raw.subject || 'General Inquiry',
    description: raw.description || 'No detailed description provided.',
    category: (raw.category as any) || 'general',
    priority: (raw.priority as any) || 'medium',
    status: (raw.status as any) || 'open',
    userType,
    source,
    reporterName: raw.reporter_name || raw.reporterName || 'Registered User',
    reporterEmail: raw.reporter_email || raw.reporterEmail || 'user@digilocal.com',
    entityName: raw.entity_name || raw.entityName || 'DigiLocal Network',
    targetVendor: raw.target_vendor || raw.targetVendor || undefined,
    assignedTo: raw.assigned_to || raw.assignedTo || 'Unassigned',
    slaMinutesRemaining: raw.sla_minutes || raw.slaMinutesRemaining || 120,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
  };
};

export const mapRawMessageToDomain = (raw: any): TicketMessage => {
  return {
    id: String(raw.id || raw.message_id || `m-${Math.random()}`),
    ticketId: String(raw.ticket_id || raw.ticketId || ''),
    senderName: raw.sender_name || raw.senderName || 'Support Representative',
    senderRole: (raw.sender_role || raw.senderRole as any) || 'admin',
    senderAvatar: raw.sender_avatar || raw.senderAvatar,
    message: raw.message || '',
    isInternalNote: Boolean(raw.is_internal_note || raw.isInternalNote),
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
};
