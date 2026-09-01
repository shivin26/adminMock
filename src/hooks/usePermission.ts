import { useAuth } from './useAuth';
import type { PowerSection } from '../types/rbac.types';

export const usePermission = () => {
  const { user } = useAuth();

  const rawRole = String(user?.role || '').toLowerCase();
  const isSuperAdmin =
    rawRole === 'super_admin' ||
    rawRole === 'superadmin' ||
    rawRole === 'super';

  const userPowers: PowerSection[] = isSuperAdmin
    ? ['SOCIETIES', 'VENDORS', 'SUBSCRIPTIONS', 'SUPPORT', 'SETTINGS', 'SUB_ADMINS']
    : Array.isArray((user as any)?.powers)
    ? (user as any).powers
    : [];

  const hasPower = (section?: PowerSection | 'OVERVIEW' | 'USERS'): boolean => {
    if (isSuperAdmin) return true;
    if (!section) return userPowers.length > 0;

    if (section === 'OVERVIEW') {
      // Dashboard overview is visible if sub-admin has core operational powers (Societies, Vendors, Subscriptions, Support)
      return userPowers.some((p) => ['SOCIETIES', 'VENDORS', 'SUBSCRIPTIONS', 'SUPPORT'].includes(p));
    }

    if (section === 'USERS') {
      // Users directory is visible if sub-admin has Vendors or Societies power
      return userPowers.some((p) => ['SOCIETIES', 'VENDORS'].includes(p));
    }

    return userPowers.includes(section as PowerSection);
  };

  return {
    isSuperAdmin,
    userPowers,
    hasPower,
  };
};
