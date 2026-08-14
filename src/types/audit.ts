export type AuditActionType =
  | 'VENDOR_SUSPENDED'
  | 'VENDOR_ACTIVATED'
  | 'REFUND_ISSUED'
  | 'SOCIETY_CREATED'
  | 'SUBSCRIPTION_RENEWED'
  | 'SETTINGS_UPDATED';

export interface AuditLogEntry {
  id: string;
  adminName: string;
  adminEmail: string;
  action: AuditActionType;
  timestamp: string;
  ipAddress: string;
  browser: string;
  affectedResource: string;
  resourceId: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
}

export interface AuditQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: AuditActionType | 'all';
  adminName?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface AuditExportPayload {
  format: 'csv' | 'pdf';
  action?: string;
}
