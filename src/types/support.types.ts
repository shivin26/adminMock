export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketCategory = 'technical' | 'billing' | 'onboarding' | 'general';
export type TicketUserType = 'user' | 'vendor' | 'user_vendor';
export type TicketSource = 'landing_website' | 'mobile_app' | 'vendor_portal';

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderName: string;
  senderRole: 'admin' | 'sub_admin' | 'vendor' | 'user';
  senderAvatar?: string;
  message: string;
  isInternalNote?: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string; // e.g. "TICK-9082"
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  userType: TicketUserType;
  source?: TicketSource;
  reporterName: string;
  reporterEmail: string;
  entityName?: string; // Society or Vendor Store name
  targetVendor?: string; // Target Vendor Store name if complaint against a vendor
  orderId?: string; // Associated Order ID e.g. "ORD-9842"
  orderAmount?: number;
  assignedTo?: string; // Admin name
  slaMinutesRemaining?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  reporterName: string;
  reporterEmail: string;
  entityName?: string;
  targetVendor?: string;
  userType?: TicketUserType;
  source?: TicketSource;
}

export interface SendReplyRequest {
  message: string;
  isInternalNote?: boolean;
  newStatus?: TicketStatus;
}
