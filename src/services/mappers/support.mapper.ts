import type { SupportTicket, TicketMessage } from '../../types/support.types';

export const mapRawTicketToDomain = (raw: any): SupportTicket => {
  if (!raw) {
    return {
      id: '',
      ticketNumber: '',
      subject: '',
      description: '',
      category: 'general',
      priority: 'medium',
      status: 'open',
      userType: 'user',
      source: 'landing_website',
      reporterName: '',
      reporterEmail: '',
      reporterPhone: '',
      entityName: '',
      assignedTo: 'Unassigned',
      slaMinutesRemaining: 120,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const userType = (raw.user_type === 'society_admin' ? 'user' : (raw.user_type || raw.userType)) || 'user';
  const source = userType === 'user' ? 'landing_website' : ((raw.source as any) || 'vendor_portal');

  // Real backend ID and Ticket Number mapping
  const realId = String(raw.id || raw.ticket_id || raw._id || raw.ticket_number || raw.ticketNumber || '');
  const realTicketNumber = String(raw.ticket_number || raw.ticketNumber || raw.id || raw.ticket_id || realId);

  const priority = (raw.priority as any) || 'medium';
  const createdAtStr = raw.created_at || raw.createdAt || new Date().toISOString();
  const createdAtMs = new Date(createdAtStr).getTime();

  // Dynamic SLA countdown calculated from ticket creation timestamp
  const targetSlaMins = priority === 'urgent' ? 15 : priority === 'high' ? 45 : priority === 'medium' ? 120 : 240;
  const elapsedMins = Math.floor((Date.now() - (isNaN(createdAtMs) ? Date.now() : createdAtMs)) / (60 * 1000));
  const dynamicSlaRemaining = raw.sla_minutes_remaining !== undefined && raw.sla_minutes_remaining !== null
    ? Number(raw.sla_minutes_remaining)
    : raw.sla_minutes !== undefined && raw.sla_minutes !== null
    ? Number(raw.sla_minutes)
    : Math.max(0, targetSlaMins - elapsedMins);

  const reporterName =
    raw.reporter_name ||
    raw.reporterName ||
    raw.user_name ||
    raw.userName ||
    raw.vendor_name ||
    raw.vendorName ||
    raw.name ||
    '';

  const reporterPhone =
    raw.reporter_phone ||
    raw.reporterPhone ||
    raw.phone_number ||
    raw.phoneNumber ||
    raw.phone ||
    raw.mobile ||
    '';

  const reporterEmail =
    raw.reporter_email ||
    raw.reporterEmail ||
    raw.email ||
    '';

  const reporterUserId =
    raw.reporter_user_id ||
    raw.reporterUserId ||
    raw.user_id ||
    raw.userId ||
    undefined;

  const targetResident =
    raw.target_resident ||
    raw.targetResident ||
    raw.target_user ||
    raw.targetUser ||
    raw.target_customer ||
    raw.targetCustomer ||
    raw.target_resident_phone ||
    raw.target_resident_name ||
    raw.reported_party_name ||
    raw.reportedPartyName ||
    undefined;

  const targetVendor =
    raw.target_vendor ||
    raw.targetVendor ||
    raw.target_shop_name ||
    raw.targetShopName ||
    undefined;

  const entityName =
    raw.entity_name ||
    raw.entityName ||
    raw.shop_name ||
    raw.store_name ||
    raw.vendor_store_name ||
    '';

  const orderAmount = raw.order_amount !== undefined && raw.order_amount !== null
    ? Number(raw.order_amount)
    : raw.orderAmount !== undefined && raw.orderAmount !== null
    ? Number(raw.orderAmount)
    : undefined;

  return {
    id: realId,
    ticketNumber: realTicketNumber,
    subject: raw.subject || '',
    description: raw.description || '',
    category: (raw.category as any) || 'general',
    priority,
    status: (raw.status as any) || 'open',
    userType,
    source,
    reporterName,
    reporterEmail,
    reporterPhone,
    reporterUserId,
    entityName,
    targetVendor,
    targetResident,
    reportedPartyName: targetResident || targetVendor || raw.reported_party_name || raw.reportedPartyName,
    orderId: raw.order_id || raw.orderId || undefined,
    orderAmount,
    assignedTo: raw.assigned_to || raw.assignedTo || 'Unassigned',
    slaMinutesRemaining: dynamicSlaRemaining,
    createdAt: createdAtStr,
    createdAtIst: raw.created_at_ist || raw.createdAtIst || undefined,
    createdAtReadable: raw.created_at_readable || raw.createdAtReadable || undefined,
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
  };
};

export const mapRawMessageToDomain = (raw: any): TicketMessage => {
  if (!raw) {
    return {
      id: '',
      ticketId: '',
      senderName: '',
      senderRole: 'admin',
      message: '',
      isInternalNote: false,
      createdAt: new Date().toISOString(),
    };
  }

  return {
    id: String(raw.id || raw.message_id || raw._id || ''),
    ticketId: String(raw.ticket_id || raw.ticketId || ''),
    senderName: raw.sender_name || raw.senderName || '',
    senderRole: (raw.sender_role || raw.senderRole as any) || 'admin',
    senderAvatar: raw.sender_avatar || raw.senderAvatar,
    message: raw.message || '',
    isInternalNote: Boolean(raw.is_internal_note || raw.isInternalNote),
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
};
