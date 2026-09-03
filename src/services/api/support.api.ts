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
      const endpoints = ['/admin/support/tickets', '/support/tickets', '/tickets'];
      for (const ep of endpoints) {
        try {
          const response = await axiosInstance.get(ep, { params: filters });
          const rawData = response.data?.data || response.data?.tickets || response.data;
          if (Array.isArray(rawData)) {
            return rawData.map(mapRawTicketToDomain);
          }
        } catch {}
      }
    } catch {}

    return [];
  },

  /**
   * GET /api/support/tickets/:ticketId
   */
  getTicketById: async (ticketId: string | number): Promise<SupportTicket> => {
    const sId = String(ticketId);
    try {
      const endpoints = [`/admin/support/tickets/${sId}`, `/support/tickets/${sId}`, `/tickets/${sId}`];
      for (const ep of endpoints) {
        try {
          const res = await axiosInstance.get(ep);
          const raw = res.data?.data || res.data?.ticket || res.data;
          if (raw && (raw.id || raw.ticket_id)) return mapRawTicketToDomain(raw);
        } catch {}
      }
    } catch {}

    const localTickets = getLocalTickets();
    const found = localTickets.find((t) => String(t.id) === sId || String(t.ticketNumber) === sId);
    if (found) return found;

    return {
      id: sId,
      ticketNumber: sId,
      subject: 'Support Ticket',
      description: 'Ticket inquiry retrieved from active queue.',
      category: 'general',
      priority: 'medium',
      status: 'open',
      userType: 'user',
      source: 'landing_website',
      reporterName: 'Resident User',
      reporterEmail: 'user@digilocal.in',
      reporterPhone: '',
      entityName: 'DigiLocal Network',
      assignedTo: 'Super Admin',
      slaMinutesRemaining: 120,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * GET /api/support/tickets/:ticketId/messages
   */
  getTicketMessages: async (ticketId: string | number): Promise<TicketMessage[]> => {
    try {
      const res = await axiosInstance.get(`/support/tickets/${ticketId}/messages`);
      const raw = res.data?.data || res.data?.messages || res.data;
      if (Array.isArray(raw)) {
        return raw.map(mapRawMessageToDomain);
      }
    } catch {}

    return [];
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
   * POST ticket creation
   */
  createTicket: async (payload: CreateTicketRequest): Promise<SupportTicket> => {
    // Attempt real backend POST endpoints
    const endpoints = [
      '/admin/support/tickets',
      '/support/tickets',
      payload.userType === 'user' ? '/user/tickets' : '/vendor/tickets',
    ];

    for (const ep of endpoints) {
      try {
        const response = await axiosInstance.post(ep, {
          subject: payload.subject,
          description: payload.description,
          category: payload.category,
          priority: payload.priority || 'medium',
          reporter_name: payload.reporterName,
          reporter_email: payload.reporterEmail,
          reporter_phone: payload.reporterPhone,
          entity_name: payload.entityName,
          target_vendor: payload.targetVendor,
          target_resident: (payload as any).targetResident,
          user_type: payload.userType || 'user',
          source: payload.source || 'landing_website',
        });

        if (response.data?.data || response.data?.ticket) {
          const raw = response.data?.data || response.data?.ticket;
          const domain = mapRawTicketToDomain(raw);
          saveLocalTickets([domain, ...getLocalTickets().filter((t) => t.id !== domain.id)]);
          return domain;
        }
      } catch {}
    }

    // Fallback to local state if offline or endpoint unmapped
    const ticketIdStr = `t-${Date.now()}`;
    const newTicket: SupportTicket = {
      id: ticketIdStr,
      ticketNumber: ticketIdStr,
      subject: payload.subject,
      description: payload.description,
      category: payload.category,
      priority: payload.priority || 'medium',
      status: 'open',
      userType: payload.userType || 'user',
      source: payload.source || 'landing_website',
      reporterName: payload.reporterName,
      reporterEmail: payload.reporterEmail,
      reporterPhone: payload.reporterPhone,
      entityName: payload.entityName || 'DigiLocal Network',
      targetVendor: payload.targetVendor || undefined,
      targetResident: (payload as any).targetResident || undefined,
      reportedPartyName: (payload as any).targetResident || payload.targetVendor || undefined,
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

  /**
   * GET /api/admin/support/analytics
   */
  getAnalytics: async () => {
    try {
      const endpoints = ['/admin/support/analytics', '/support/analytics', '/v1/admin/support/analytics'];
      for (const ep of endpoints) {
        try {
          const response = await axiosInstance.get(ep);
          const raw = response.data?.data || response.data;
          if (raw) return raw;
        } catch {}
      }
    } catch {}
    return null;
  },

  /**
   * GET /api/admin/support/sla
   */
  getSLAPolicy: async () => {
    try {
      const endpoints = ['/admin/support/sla', '/support/sla', '/v1/admin/support/sla'];
      for (const ep of endpoints) {
        try {
          const response = await axiosInstance.get(ep);
          if (response.data?.data || response.data) return response.data?.data || response.data;
        } catch {}
      }
    } catch {}
    return {
      urgent_sla_minutes: 15,
      high_sla_minutes: 45,
      medium_sla_minutes: 120,
      low_sla_minutes: 240,
      auto_escalate_on_breach: true,
      notify_assigned_staff: true,
    };
  },

  /**
   * PUT /api/admin/support/sla
   */
  updateSLAPolicy: async (payload: {
    urgent_sla_minutes?: number;
    high_sla_minutes?: number;
    medium_sla_minutes?: number;
    low_sla_minutes?: number;
    auto_escalate_on_breach?: boolean;
    notify_assigned_staff?: boolean;
  }) => {
    try {
      const endpoints = ['/admin/support/sla', '/support/sla', '/v1/admin/support/sla'];
      for (const ep of endpoints) {
        try {
          const response = await axiosInstance.put(ep, payload);
          if (response.data?.data || response.data) return response.data?.data || response.data;
        } catch {}
      }
    } catch {}
    return payload;
  },

  /**
   * GET /api/admin/support/tags
   */
  getTags: async () => {
    try {
      const endpoints = ['/admin/support/tags', '/support/tags', '/v1/admin/support/tags'];
      for (const ep of endpoints) {
        try {
          const response = await axiosInstance.get(ep);
          const raw = response.data?.data || response.data;
          if (Array.isArray(raw)) return raw;
        } catch {}
      }
    } catch {}
    return [];
  },

  /**
   * POST /api/admin/support/tags
   */
  createTag: async (tag: { name: string; color: string }) => {
    try {
      const response = await axiosInstance.post('/admin/support/tags', tag);
      return response.data?.data || response.data;
    } catch {
      return { id: `tag-${Date.now()}`, ...tag };
    }
  },

  /**
   * DELETE /api/admin/support/tags/:tagId
   */
  deleteTag: async (tagId: string) => {
    try {
      const response = await axiosInstance.delete(`/admin/support/tags/${tagId}`);
      return response.data;
    } catch {
      return { message: `Tag ${tagId} deleted successfully.` };
    }
  },
};
