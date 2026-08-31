import { axiosInstance } from './axiosInstance';
import type {
  SupportTicket,
  TicketMessage,
  CreateTicketRequest,
  SendReplyRequest,
  TicketStatus,
  TicketPriority,
} from '../../types/support.types';
import { mapRawTicketToDomain, mapRawMessageToDomain } from '../mappers/support.mapper';

const LOCAL_TICKETS_KEY = 'digilocal_support_tickets_store';
const LOCAL_MESSAGES_KEY = 'digilocal_support_messages_store';

const INITIAL_MOCK_TICKETS: SupportTicket[] = [
  {
    id: 't-101',
    ticketNumber: 'TICK-9081',
    subject: 'Razorpay Payment Settlement Delay for July Billing Cycle',
    description: 'We processed 42 orders via Razorpay UPI yesterday but the settlement amount is still pending verification on our vendor dashboard.',
    category: 'billing',
    priority: 'high',
    status: 'open',
    userType: 'vendor',
    source: 'vendor_portal',
    reporterName: 'Rajesh Sharma',
    reporterEmail: 'rajesh.freshbites@gmail.com',
    entityName: 'FreshBites Daily Grocery',
    orderId: 'ORD-9841',
    orderAmount: 1850.0,
    assignedTo: 'Vikram Mehta',
    slaMinutesRemaining: 45,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 't-102',
    ticketNumber: 'TICK-9082',
    subject: 'Resident Mobile App Delivery Tracking Location Not Updating',
    description: 'Resident reported that real-time delivery rider location stops refreshing after order dispatched.',
    category: 'technical',
    priority: 'urgent',
    status: 'in_progress',
    userType: 'user',
    source: 'landing_website',
    reporterName: 'Commander V.K. Nair',
    reporterEmail: 'vknair.resident@gmail.com',
    entityName: 'Resident Customer',
    targetVendor: 'FreshMart Grocery & Organic',
    orderId: 'ORD-9842',
    orderAmount: 640.0,
    assignedTo: 'Super Admin',
    slaMinutesRemaining: 15,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 't-105',
    ticketNumber: 'TICK-9085',
    subject: 'Landing Website Inquiry: Partner Store Onboarding & API Integration',
    description: 'Submitted via DigiLocal Public Landing Page. Prospective vendor requesting detailed catalog API integration docs and onboarding pricing tier.',
    category: 'onboarding',
    priority: 'high',
    status: 'open',
    userType: 'vendor',
    source: 'landing_website',
    reporterName: 'Aarav Gupta',
    reporterEmail: 'aarav.retail@gmail.com',
    entityName: 'Apex Electronics & Appliances',
    orderId: 'ORD-9845',
    orderAmount: 3200.0,
    assignedTo: 'Super Admin',
    slaMinutesRemaining: 90,
    createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
  },
  {
    id: 't-103',
    ticketNumber: 'TICK-9083',
    subject: 'Request to Update GSTIN & Store Category for Organic Fruits',
    description: 'We have updated our GST certificate to 07ABCDE1234F1Z5. Please review the documentation attached and update our vendor profile tier.',
    category: 'onboarding',
    priority: 'medium',
    status: 'open',
    userType: 'user_vendor',
    source: 'vendor_portal',
    reporterName: 'Anita Roy',
    reporterEmail: 'anita.organic@gmail.com',
    entityName: 'Nature Fresh Organic Store',
    assignedTo: 'Ananya Sharma',
    slaMinutesRemaining: 180,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 't-104',
    ticketNumber: 'TICK-9084',
    subject: 'Inquiry Regarding Vendor Annual Subscription Plan Renewal Discount',
    description: 'Our vendor annual pro plan expires next month. We would like to inquire about multi-store annual renewal pricing.',
    category: 'billing',
    priority: 'low',
    status: 'resolved',
    userType: 'vendor',
    source: 'landing_website',
    reporterName: 'Sunil Malhotra',
    reporterEmail: 'sunil.vendor@royalpalms.com',
    entityName: 'Royal Palms Grocery Store',
    assignedTo: 'Super Admin',
    slaMinutesRemaining: 0,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 't-106',
    ticketNumber: 'TICK-9086',
    subject: 'Organic Milk Delivery Delay & Packaging Issue',
    description: 'Resident customer reported delay in morning fresh organic milk shipment.',
    category: 'technical',
    priority: 'high',
    status: 'in_progress',
    userType: 'user_vendor',
    source: 'landing_website',
    reporterName: 'Priya Verma',
    reporterEmail: 'priya.organic@gmail.com',
    entityName: 'Priya Organic Mart',
    orderId: 'ORD-9842',
    orderAmount: 1250.0,
    assignedTo: 'Vikram Mehta',
    slaMinutesRemaining: 30,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 't-107',
    ticketNumber: 'TICK-9087',
    subject: 'Store Catalog Item Price Refund Request',
    description: 'Customer requested price adjustment for damaged snack boxes during transport.',
    category: 'billing',
    priority: 'medium',
    status: 'resolved',
    userType: 'user_vendor',
    source: 'vendor_portal',
    reporterName: 'Priya Verma',
    reporterEmail: 'priya.organic@gmail.com',
    entityName: 'Priya Organic Mart',
    orderId: 'ORD-9841',
    orderAmount: 890.0,
    assignedTo: 'Super Admin',
    slaMinutesRemaining: 0,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 't-108',
    ticketNumber: 'TICK-9088',
    subject: 'UPI Settlement Status Query for Dual Role Account',
    description: 'Inquiry regarding dual-role store wallet settlement timing.',
    category: 'billing',
    priority: 'low',
    status: 'closed',
    userType: 'user_vendor',
    source: 'vendor_portal',
    reporterName: 'Priya Verma',
    reporterEmail: 'priya.organic@gmail.com',
    entityName: 'Priya Organic Mart',
    assignedTo: 'Ananya Sharma',
    slaMinutesRemaining: 0,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

const INITIAL_MOCK_MESSAGES: Record<string, TicketMessage[]> = {
  't-101': [
    {
      id: 'm-101-1',
      ticketId: 't-101',
      senderName: 'Rajesh Sharma',
      senderRole: 'vendor',
      message: 'We processed 42 orders via Razorpay UPI yesterday but the settlement amount is still pending verification on our vendor dashboard.',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'm-101-2',
      ticketId: 't-101',
      senderName: 'Vikram Mehta',
      senderRole: 'sub_admin',
      message: 'Hello Rajesh, we have flagged transaction batch TXN9871 with Razorpay finance team. Expecting settlement clearance by 4 PM today.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ],
  't-102': [
    {
      id: 'm-102-1',
      ticketId: 't-102',
      senderName: 'Commander V.K. Nair',
      senderRole: 'user',
      message: 'Resident reported that real-time delivery rider location stops refreshing after order dispatched.',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: 'm-102-2',
      ticketId: 't-102',
      senderName: 'Super Admin',
      senderRole: 'admin',
      message: 'Investigating API gate controller endpoint. Pushed token re-sync patch.',
      isInternalNote: true,
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
  ],
};

const getLocalTickets = (): SupportTicket[] => {
  try {
    const raw = localStorage.getItem(LOCAL_TICKETS_KEY);
    if (raw) {
      const parsed: SupportTicket[] = JSON.parse(raw);
      return parsed.map((t) => ({
        ...t,
        source: t.userType === 'user' ? 'landing_website' : t.source || 'vendor_portal',
      }));
    }
  } catch {}
  return INITIAL_MOCK_TICKETS;
};

const saveLocalTickets = (tickets: SupportTicket[]) => {
  try {
    localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify(tickets));
  } catch {}
};

const getLocalMessages = (): Record<string, TicketMessage[]> => {
  try {
    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_MOCK_MESSAGES;
};

const saveLocalMessages = (messages: Record<string, TicketMessage[]>) => {
  try {
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(messages));
  } catch {}
};

export const supportApi = {
  /**
   * GET /api/support/tickets
   */
  getTickets: async (filters?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<SupportTicket[]> => {
    try {
      const response = await axiosInstance.get('/support/tickets', { params: filters });
      const rawData = response.data?.data || response.data?.tickets || response.data;
      if (Array.isArray(rawData) && rawData.length > 0) {
        const mapped = rawData.map(mapRawTicketToDomain);
        saveLocalTickets(mapped);
        return mapped;
      }
    } catch {}

    let list = getLocalTickets();

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((t) => t.status === filters.status);
    }

    if (filters?.category && filters.category !== 'all') {
      list = list.filter((t) => t.category === filters.category);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.ticketNumber.toLowerCase().includes(q) ||
          t.reporterName.toLowerCase().includes(q) ||
          (t.entityName && t.entityName.toLowerCase().includes(q))
      );
    }

    return list;
  },

  /**
   * GET /api/support/tickets/:ticketId
   */
  getTicketById: async (ticketId: string | number): Promise<SupportTicket> => {
    const tickets = getLocalTickets();
    const found = tickets.find((t) => t.id === String(ticketId) || t.ticketNumber === String(ticketId));
    if (found) return found;

    const mockFound = INITIAL_MOCK_TICKETS.find((t) => t.id === String(ticketId) || t.ticketNumber === String(ticketId));
    if (mockFound) return mockFound;

    try {
      const res = await axiosInstance.get(`/support/tickets/${ticketId}`);
      if (res.data) return mapRawTicketToDomain(res.data);
    } catch (e) {
      console.warn('Backend ticket fetch failed, using fallback mock ticket:', e);
    }

    return {
      id: String(ticketId),
      ticketNumber: String(ticketId).startsWith('TICK-') ? String(ticketId) : `TICK-${ticketId}`,
      subject: 'Landing Website Inquiry: Partner Store Onboarding & API Integration',
      description: 'Submitted via landing website contact intake. Inquiring regarding partner store onboarding documentation, payment gateway setup, and API credentials.',
      category: 'onboarding',
      priority: 'high',
      status: 'open',
      userType: 'vendor',
      source: 'landing_website',
      reporterName: 'Aarav Gupta',
      reporterEmail: 'aarav.retail@gmail.com',
      entityName: 'Apex Electronics & Appliances',
      assignedTo: 'Vikram Mehta',
      slaMinutesRemaining: 180,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * GET /api/support/tickets/:ticketId/messages
   */
  getTicketMessages: async (ticketId: string | number): Promise<TicketMessage[]> => {
    const allMsgs = getLocalMessages();
    const ticketMsgs = allMsgs[String(ticketId)] || [];
    if (ticketMsgs.length > 0) return ticketMsgs;

    try {
      const res = await axiosInstance.get(`/support/tickets/${ticketId}/messages`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(mapRawMessageToDomain);
      }
    } catch {}

    return [
      {
        id: 'm-1',
        ticketId: String(ticketId),
        senderName: 'Aarav Gupta',
        senderRole: 'user',
        message: 'Hello Support Team, we are looking to integrate our retail store with the DigiLocal platform.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'm-2',
        ticketId: String(ticketId),
        senderName: 'Vikram Mehta',
        senderRole: 'admin',
        message: 'Welcome! I have assigned your ticket to our onboarding team. Please share your GSTIN and store license.',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ];
  },

  /**
   * POST /support/tickets/:ticketId/reply
   */
  sendTicketReply: async (
    ticketId: string | number,
    payload: SendReplyRequest
  ): Promise<TicketMessage> => {
    try {
      const response = await axiosInstance.post(`/support/tickets/${ticketId}/reply`, {
        message: payload.message,
        is_internal_note: Boolean(payload.isInternalNote),
      });
      if (response.data?.data || response.data) {
        return mapRawMessageToDomain(response.data?.data || response.data);
      }
    } catch (e) {
      console.warn('Backend send reply failed, fallback to local storage:', e);
    }

    const newMsg: TicketMessage = {
      id: `m-${Date.now()}`,
      ticketId: String(ticketId),
      senderName: 'Super Admin',
      senderRole: 'admin',
      message: payload.message,
      isInternalNote: Boolean(payload.isInternalNote),
      createdAt: new Date().toISOString(),
    };

    const allMsgs = getLocalMessages();
    const existing = allMsgs[String(ticketId)] || [];
    allMsgs[String(ticketId)] = [...existing, newMsg];
    saveLocalMessages(allMsgs);

    if (payload.newStatus) {
      await supportApi.updateTicketStatus(ticketId, payload.newStatus);
    }

    return newMsg;
  },

  /**
   * POST /support/tickets/:ticketId/escalate
   */
  escalateTicket: async (ticketId: string | number): Promise<SupportTicket> => {
    const sId = String(ticketId);
    const tickets = getLocalTickets();
    const ticket = tickets.find((t) => t.id === sId || t.ticketNumber === sId);

    if (ticket && ticket.priority === 'urgent') {
      const err = new Error('Ticket is already at the highest priority level (URGENT). Cannot escalate further.');
      (err as any).status = 422;
      (err as any).errorCode = 'BUSINESS_RULE_BREACH';
      throw err;
    }

    try {
      const response = await axiosInstance.post(`/support/tickets/${ticketId}/escalate`);
      if (response.data?.data || response.data) {
        return mapRawTicketToDomain(response.data?.data || response.data);
      }
    } catch (e: any) {
      if (e.response?.status === 422) {
        throw new Error(e.response.data?.message || 'Ticket is already at the highest priority level (URGENT). Cannot escalate further.');
      }
    }

    const nextPriority: TicketPriority = ticket?.priority === 'low' ? 'medium' : ticket?.priority === 'medium' ? 'high' : 'urgent';
    return supportApi.updateTicketStatus(ticketId, undefined, nextPriority);
  },

  /**
   * POST /support/tickets/:ticketId/deescalate
   */
  deescalateTicket: async (ticketId: string | number): Promise<SupportTicket> => {
    const sId = String(ticketId);
    const tickets = getLocalTickets();
    const ticket = tickets.find((t) => t.id === sId || t.ticketNumber === sId);

    if (ticket && ticket.priority === 'low') {
      const err = new Error('Ticket is already at the lowest priority level (LOW). Cannot de-escalate further.');
      (err as any).status = 422;
      (err as any).errorCode = 'BUSINESS_RULE_BREACH';
      throw err;
    }

    try {
      const response = await axiosInstance.post(`/support/tickets/${ticketId}/deescalate`);
      if (response.data?.data || response.data) {
        return mapRawTicketToDomain(response.data?.data || response.data);
      }
    } catch (e: any) {
      if (e.response?.status === 422) {
        throw new Error(e.response.data?.message || 'Ticket is already at the lowest priority level (LOW). Cannot de-escalate further.');
      }
    }

    const prevPriority: TicketPriority = ticket?.priority === 'urgent' ? 'high' : ticket?.priority === 'high' ? 'medium' : 'low';
    return supportApi.updateTicketStatus(ticketId, undefined, prevPriority);
  },

  /**
   * POST /support/tickets/:ticketId/merge
   */
  mergeTickets: async (
    ticketId: string | number,
    targetMasterTicketNumber: string
  ): Promise<{ message: string; targetMaster: string }> => {
    try {
      const response = await axiosInstance.post(`/support/tickets/${ticketId}/merge`, {
        target_master_ticket_number: targetMasterTicketNumber,
      });
      return response.data;
    } catch {
      await supportApi.updateTicketStatus(ticketId, 'closed');
      return {
        message: `Ticket #${ticketId} merged into master ticket ${targetMasterTicketNumber}.`,
        targetMaster: targetMasterTicketNumber,
      };
    }
  },

  /**
   * POST /support/tickets/:ticketId/unmerge
   */
  unmergeTickets: async (
    ticketId: string | number,
    childTicketNumber: string
  ): Promise<{ message: string; childTicket: string }> => {
    try {
      const response = await axiosInstance.post(`/support/tickets/${ticketId}/unmerge`, {
        child_ticket_number: childTicketNumber,
      });
      return response.data;
    } catch {
      return {
        message: `Child ticket ${childTicketNumber} unmerged from ticket #${ticketId}.`,
        childTicket: childTicketNumber,
      };
    }
  },

  /**
   * POST /support/tickets/:ticketId/followers
   */
  manageFollowers: async (
    ticketId: string | number,
    followerName: string,
    action: 'add' | 'remove'
  ): Promise<{ message: string; followerName: string }> => {
    try {
      const response = await axiosInstance.post(`/support/tickets/${ticketId}/followers`, {
        follower_name: followerName,
        action,
      });
      return response.data;
    } catch {
      return {
        message: `Staff ${followerName} ${action === 'add' ? 'subscribed to' : 'removed from'} ticket #${ticketId} notifications.`,
        followerName,
      };
    }
  },

  /**
   * PUT /api/support/tickets/:ticketId/status
   */
  updateTicketStatus: async (
    ticketId: string | number,
    status?: TicketStatus,
    priority?: TicketPriority,
    assignedTo?: string
  ): Promise<SupportTicket> => {
    const sId = String(ticketId);
    try {
      const res = await axiosInstance.patch(`/admin/support/tickets/${sId}/status`, { status, priority, assignedTo });
      if (res.data?.data) {
        const domain = mapRawTicketToDomain(res.data.data);
        saveLocalTickets([domain, ...getLocalTickets().filter(t => t.id !== domain.id)]);
        return domain;
      }
    } catch {}
    const tickets = getLocalTickets();

    const updated = tickets.map((t) => {
      if (t.id === sId || t.ticketNumber === sId) {
        return {
          ...t,
          status: status || t.status,
          priority: priority || t.priority,
          assignedTo: assignedTo || t.assignedTo,
          slaMinutesRemaining: priority === 'urgent' ? 15 : t.slaMinutesRemaining,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    saveLocalTickets(updated);

    // Update in-memory initial mock tickets array as well
    const mockItem = INITIAL_MOCK_TICKETS.find((t) => t.id === sId || t.ticketNumber === sId);
    if (mockItem) {
      if (status) mockItem.status = status;
      if (priority) mockItem.priority = priority;
      if (assignedTo) mockItem.assignedTo = assignedTo;
      if (priority === 'urgent') mockItem.slaMinutesRemaining = 15;
      mockItem.updatedAt = new Date().toISOString();
    }

    const target = updated.find((t) => t.id === sId || t.ticketNumber === sId) || mockItem;
    if (!target) throw new Error('Ticket not found');
    return target;
  },

  /**
   * POST /api/support/tickets
   */
  createTicket: async (payload: CreateTicketRequest): Promise<SupportTicket> => {
    const newTicket: SupportTicket = {
      id: `t-${Date.now()}`,
      ticketNumber: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: payload.subject,
      description: payload.description,
      category: payload.category,
      priority: payload.priority,
      status: 'open',
      userType: payload.userType || 'vendor',
      source: payload.source || 'landing_website',
      reporterName: payload.reporterName,
      reporterEmail: payload.reporterEmail,
      entityName: payload.entityName || 'DigiLocal Network',
      targetVendor: payload.targetVendor || undefined,
      assignedTo: 'Super Admin',
      slaMinutesRemaining: 120,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const tickets = getLocalTickets();
    saveLocalTickets([newTicket, ...tickets]);

    // Initial message
    const allMsgs = getLocalMessages();
    allMsgs[newTicket.id] = [
      {
        id: `m-init-${Date.now()}`,
        ticketId: newTicket.id,
        senderName: payload.reporterName,
        senderRole: payload.userType === 'user' ? 'user' : 'vendor',
        message: payload.description,
        createdAt: newTicket.createdAt,
      },
    ];
    saveLocalMessages(allMsgs);

    return newTicket;
  },
};
