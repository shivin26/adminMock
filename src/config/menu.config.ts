import type { PowerSection } from '../types/rbac.types';

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'danger';
  requiredPower?: PowerSection | 'OVERVIEW' | 'USERS';
}

export const MAIN_MENU_CONFIG: MenuItem[] = [
  {
    id: 'overview',
    label: 'Dashboard',
    path: '/dashboard/overview',
    iconName: 'LayoutDashboard',
    requiredPower: 'OVERVIEW',
  },
  {
    id: 'societies',
    label: 'Areas',
    path: '/dashboard/societies',
    iconName: 'MapPin',
    requiredPower: 'SOCIETIES',
  },
  {
    id: 'vendors',
    label: 'Vendors',
    path: '/dashboard/vendors',
    iconName: 'Users',
    requiredPower: 'VENDORS',
  },
  {
    id: 'users',
    label: 'Users',
    path: '/dashboard/users',
    iconName: 'UserCheck',
    requiredPower: 'USERS',
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    path: '/dashboard/subscriptions',
    iconName: 'CreditCard',
    requiredPower: 'SUBSCRIPTIONS',
  },
  {
    id: 'support',
    label: 'Support',
    path: '/dashboard/support',
    iconName: 'LifeBuoy',
    requiredPower: 'SUPPORT',
  },
  {
    id: 'subadmins',
    label: 'Sub-Admins',
    path: '/dashboard/sub-admins',
    iconName: 'ShieldAlert',
    requiredPower: 'SUB_ADMINS',
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/dashboard/settings',
    iconName: 'Settings',
    requiredPower: 'SETTINGS',
  },
];
