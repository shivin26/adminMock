export const CACHE_KEYS = {
  auth: {
    user: ['auth', 'user'] as const,
  },
  societies: {
    all: ['societies'] as const,
    list: (search?: string) => ['societies', { search }] as const,
    detail: (id: string | number) => ['societies', id] as const,
    vendors: (societyId: string | number) => ['societies', societyId, 'vendors'] as const,
  },
  vendors: {
    all: ['vendors'] as const,
    list: (params?: unknown) => ['vendors', params] as const,
    pending: ['vendors', 'pending'] as const,
    detail: (id: string | number) => ['vendors', id] as const,
  },
  subscriptions: {
    all: ['subscriptions'] as const,
    list: (params?: unknown) => ['subscriptions', params] as const,
    stats: ['subscriptions', 'stats'] as const,
    invoice: (id: string | number) => ['subscriptions', id, 'invoice'] as const,
  },
  config: {
    main: ['config', 'main'] as const,
  },
  support: {
    all: ['support'] as const,
    list: (filters?: unknown) => ['support', 'tickets', filters] as const,
    detail: (ticketId: string | number) => ['support', 'tickets', ticketId] as const,
    messages: (ticketId: string | number) => ['support', 'tickets', ticketId, 'messages'] as const,
    stats: ['support', 'stats'] as const,
  },
} as const;
