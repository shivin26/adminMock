import { useAuth } from './useAuth';
import type { PowerSection } from '../types/rbac.types';

export const usePermission = () => {
  const { user } = useAuth();

  const rawRole = String(user?.role || '').toLowerCase();
  const isSuperAdmin =
    rawRole === 'super_admin' ||
    rawRole === 'admin' ||
    rawRole === 'superadmin' ||
    rawRole === 'super';

  const userPowers: PowerSection[] = isSuperAdmin
    ? ['SOCIETIES', 'VENDORS', 'SUBSCRIPTIONS', 'SUPPORT', 'SETTINGS', 'SUB_ADMINS']
    : (user as any)?.powers || [];

  const hasPower = (section?: PowerSection): boolean => {
    if (!section) return true;
    if (isSuperAdmin) return true;
    return userPowers.includes(section);
  };

  return {
    isSuperAdmin,
    userPowers,
    hasPower,
  };
};
