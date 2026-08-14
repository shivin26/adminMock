import type { PowerSection } from '../types/rbac.types';

export interface RouteMeta {
  path: string;
  title: string;
  breadcrumbLabel: string;
  parentPath?: string;
  requiresAuth: boolean;
  requiredPower?: PowerSection;
}

export const ROUTES_CONFIG: Record<string, RouteMeta> = {
  OVERVIEW: {
    path: '/dashboard/overview',
    title: 'Dashboard',
    breadcrumbLabel: 'Dashboard',
    requiresAuth: true,
  },
  SOCIETIES: {
    path: '/dashboard/societies',
    title: 'Societies Registry',
    breadcrumbLabel: 'Societies',
    requiresAuth: true,
    requiredPower: 'SOCIETIES',
  },
  VENDORS: {
    path: '/dashboard/vendors',
    title: 'Vendor Management',
    breadcrumbLabel: 'Vendors',
    requiresAuth: true,
    requiredPower: 'VENDORS',
  },
  SUBSCRIPTIONS: {
    path: '/dashboard/subscriptions',
    title: 'Subscriptions & Financials',
    breadcrumbLabel: 'Subscriptions',
    requiresAuth: true,
    requiredPower: 'SUBSCRIPTIONS',
  },
  SUPPORT: {
    path: '/dashboard/support',
    title: 'Support Desk & Inquiries',
    breadcrumbLabel: 'Support Desk',
    requiresAuth: true,
    requiredPower: 'SUPPORT',
  },
  SUB_ADMINS: {
    path: '/dashboard/sub-admins',
    title: 'Sub-Admin Management',
    breadcrumbLabel: 'Sub-Admins',
    requiresAuth: true,
    requiredPower: 'SUB_ADMINS',
  },
  SETTINGS: {
    path: '/dashboard/settings',
    title: 'Platform Settings',
    breadcrumbLabel: 'Settings',
    requiresAuth: true,
    requiredPower: 'SETTINGS',
  },
  LOGIN: {
    path: '/auth/login',
    title: 'Super Admin Sign In',
    breadcrumbLabel: 'Login',
    requiresAuth: false,
  },
};

export const getRouteMetadata = (pathname: string): RouteMeta | undefined => {
  return Object.values(ROUTES_CONFIG).find((route) => route.path === pathname);
};
