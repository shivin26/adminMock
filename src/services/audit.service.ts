import { storage } from '../utils/storage.utils';
import type { User } from '../types/auth.types';
import { axiosInstance } from './api/axiosInstance';

export type AuditModule =
  | 'VENDORS'
  | 'SOCIETIES'
  | 'USERS'
  | 'SUB_ADMINS'
  | 'SUPPORT'
  | 'SUBSCRIPTIONS'
  | 'SETTINGS';

export type AuditActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'STATUS_CHANGE'
  | 'REPLY'
  | 'ESCALATION';

export interface BackendAuditLog {
  id: string;
  timestamp: string;
  timestampReadable: string;
  userEmail: string;
  userName: string;
  userRole: 'super_admin' | 'sub_admin' | 'guest';
  module: AuditModule;
  actionType: AuditActionType;
  summary: string;
  details: string;
  entityId?: string;
  pagePath: string;
}

const BACKEND_AUDIT_LOGS_STORAGE_KEY = 'digilocal_backend_mutation_audit_logs';

export const getBackendAuditLogs = (): BackendAuditLog[] => {
  try {
    const raw = localStorage.getItem(BACKEND_AUDIT_LOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

export const saveLocalBackendAuditLogs = (logs: BackendAuditLog[]) => {
  try {
    localStorage.setItem(BACKEND_AUDIT_LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch {}
};

/**
 * GET /api/admin/audit-logs
 * Fetch audit logs from backend HTTP server
 */
export const fetchBackendAuditLogsAsync = async (): Promise<BackendAuditLog[]> => {
  try {
    const response = await axiosInstance.get<any>('/admin/audit-logs');
    const resData = response.data?.data || response.data?.logs || response.data;
    if (Array.isArray(resData)) {
      const mapped = resData.map((item: any) => ({
        id: String(item.id || `audit-${Date.now()}`),
        timestamp: item.timestamp || item.created_at || new Date().toISOString(),
        timestampReadable: item.timestamp_readable || item.timestampReadable || new Date().toLocaleString(),
        userEmail: item.user_email || item.userEmail || 'admin@digilocal.com',
        userName: item.user_name || item.userName || 'Super Admin',
        userRole: item.user_role || item.userRole || 'super_admin',
        module: item.module || 'SETTINGS',
        actionType: item.action_type || item.actionType || 'UPDATE',
        summary: item.summary || item.action || 'Backend Mutation',
        details: item.details || item.summary || 'Mutation details',
        entityId: item.entity_id ? String(item.entity_id) : undefined,
        pagePath: item.page_path || item.pagePath || '/dashboard',
      }));
      saveLocalBackendAuditLogs(mapped);
      return mapped;
    }
  } catch {}
  return getBackendAuditLogs();
};

/**
 * POST /api/admin/audit-logs
 * Send backend mutation audit entry to backend API server
 */
export const logBackendMutation = (
  module: AuditModule,
  actionType: AuditActionType,
  summary: string,
  details?: string,
  entityId?: string
): BackendAuditLog => {
  const user = storage.getUserData<User>();
  const pagePath = window.location.pathname;

  const now = new Date();
  const timestampReadable = now.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const logItem: BackendAuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: now.toISOString(),
    timestampReadable,
    userEmail: user?.email || 'superadmin@digilocal.com',
    userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Super Administrator',
    userRole: (user?.role as any) || 'super_admin',
    module,
    actionType,
    summary,
    details: details || summary,
    entityId: entityId ? String(entityId) : undefined,
    pagePath,
  };

  // Save in append-only storage
  try {
    const currentLogs = getBackendAuditLogs();
    const updated = [logItem, ...currentLogs].slice(0, 1000);
    saveLocalBackendAuditLogs(updated);
  } catch {}

  // HTTP POST request to backend API /api/admin/audit-logs
  const apiPayload = {
    user_email: logItem.userEmail,
    user_name: logItem.userName,
    user_role: logItem.userRole,
    module: logItem.module,
    action_type: logItem.actionType,
    summary: logItem.summary,
    details: logItem.details,
    entity_id: logItem.entityId,
    page_path: logItem.pagePath,
    timestamp: logItem.timestamp,
  };

  axiosInstance.post('/admin/audit-logs', apiPayload).catch(() => {
    // Graceful fallback to persistent storage
  });

  return logItem;
};
