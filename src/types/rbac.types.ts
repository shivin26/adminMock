export type PowerSection =
  | 'SOCIETIES'
  | 'VENDORS'
  | 'SUBSCRIPTIONS'
  | 'SUPPORT'
  | 'SETTINGS'
  | 'SUB_ADMINS';

export interface PowerSectionMetadata {
  id: PowerSection;
  label: string;
  description: string;
  iconName: string;
}

export const POWER_SECTIONS_LIST: PowerSectionMetadata[] = [
  {
    id: 'SOCIETIES',
    label: 'Societies Management',
    description: 'Register, edit, delete residential societies and view society active vendors.',
    iconName: 'Building2',
  },
  {
    id: 'VENDORS',
    label: 'Vendors',
    description: 'Review vendor onboarding requests, approve or reject applications.',
    iconName: 'Users',
  },
  {
    id: 'SUBSCRIPTIONS',
    label: 'Subscriptions & Financials',
    description: 'Monitor active subscriptions, execute plan renewals, and issue GST tax invoices.',
    iconName: 'CreditCard',
  },
  {
    id: 'SUPPORT',
    label: 'Support Desk',
    description: 'Resolve vendor & society support tickets, reply to inquiries, and track response SLAs.',
    iconName: 'Headphones',
  },
  {
    id: 'SETTINGS',
    label: 'Platform Settings',
    description: 'Update platform branding, logo URLs, and administrator credentials.',
    iconName: 'Settings',
  },
  {
    id: 'SUB_ADMINS',
    label: 'Sub-Admin Administration',
    description: 'Create sub-admin accounts and delegate granular section powers (Super Admin Only).',
    iconName: 'ShieldAlert',
  },
];

export interface SubAdminUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'super_admin' | 'sub_admin';
  powers: PowerSection[];
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface CreateSubAdminRequest {
  name: string;
  email: string;
  password?: string;
  powers: PowerSection[];
}

export interface UpdateSubAdminPowersRequest {
  powers: PowerSection[];
  status?: 'active' | 'suspended';
}
