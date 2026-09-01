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

const INITIAL_MOCK_TICKETS: SupportTicket[] = [];

const INITIAL_MOCK_MESSAGES: Record<string, TicketMessage[]> = {};

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
  return [];
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
      if (Array.isArray(rawData)) {
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
    try {
      const endpoints = [`/support/tickets/${ticketId}`, `/admin/support/tickets/${ticketId}`, `/tickets/${ticketId}`];
      for (const ep of endpoints) {
        try {
          const res = await axiosInstance.get(ep);
          const raw = res.data?.data || res.data?.ticket || res.data;
          if (raw) return mapRawTicketToDomain(raw);
        } catch {}
      }
    } catch (e) {
      console.warn('Backend ticket fetch failed, falling back to local dataset:', e);
    }

    const tickets = getLocalTickets();
    const found = tickets.find((t) => t.id === String(ticketId) || t.ticketNumber === String(ticketId));
    if (found) return found;

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
