export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketCategory =
  | 'vendor_vs_user'
  | 'vendor_vs_vendor'
  | 'user_vs_vendor'
  | 'technical'
  | 'billing'
  | 'onboarding'
  | 'general';
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
  complainantRole?: 'vendor_and_resident' | 'vendor' | 'resident';
  reportedPartyType?: 'user_resident' | 'vendor';
  reportedPartyName?: string;
  source?: TicketSource;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  reporterUserId?: string;
  entityName?: string; // Society or Vendor Store name
  targetVendor?: string; // Target Vendor Store name if complaint against a vendor
  targetResident?: string; // Target Resident Customer if vendor complaint against resident
  orderId?: string; // Associated Order ID e.g. "ORD-9842"
  orderAmount?: number;
  assignedTo?: string; // Admin name
  slaMinutesRemaining?: number;
  createdAt: string;
  createdAtIst?: string;
  createdAtReadable?: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
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
