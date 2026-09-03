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
    label: 'Societies & Area Management',
    description: 'Register, edit, delete residential societies and view society active vendors.',
    iconName: 'Building2',
  },
  {
    id: 'VENDORS',
    label: 'User & Vendor',
    description: 'Review vendor onboarding requests, approve or reject applications, and manage platform users.',
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
  grantablePowers?: PowerSection[];
  allowedDelegationPowers?: PowerSection[];
  canManageSubadmins?: boolean;
  status: 'active' | 'suspended';
  createdAt: string;
  createdBy?: string;
  creatorId?: string;
  createdRole?: 'super_admin' | 'sub_admin';
  createdByInfo?: {
    creator_id?: string;
    created_by?: string;
    created_role?: string;
  };
}

export interface CreateSubAdminRequest {
  name: string;
  email: string;
  password?: string;
  powers: PowerSection[];
  grantable_powers?: PowerSection[];
  grantablePowers?: PowerSection[];
  allowed_delegation_powers?: PowerSection[];
  allowedDelegationPowers?: PowerSection[];
  can_manage_subadmins?: boolean;
  canManageSubadmins?: boolean;
  createdBy?: string;
  creatorId?: string;
  createdRole?: 'super_admin' | 'sub_admin';
}

export interface UpdateSubAdminPowersRequest {
  powers: PowerSection[];
  grantable_powers?: PowerSection[];
  grantablePowers?: PowerSection[];
  allowed_delegation_powers?: PowerSection[];
  allowedDelegationPowers?: PowerSection[];
  can_manage_subadmins?: boolean;
  canManageSubadmins?: boolean;
  status?: 'active' | 'suspended';
}
