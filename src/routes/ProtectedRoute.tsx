import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import { DashboardSkeleton } from '../components/ui/DashboardSkeleton';
import type { PowerSection } from '../types/rbac.types';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
  requiredPower?: PowerSection;
}

const getFallbackRoute = (hasPower: (p?: PowerSection) => boolean): string => {
  if (hasPower('SOCIETIES')) return '/dashboard/societies';
  if (hasPower('VENDORS')) return '/dashboard/vendors';
  if (hasPower('SUBSCRIPTIONS')) return '/dashboard/subscriptions';
  if (hasPower('SUPPORT')) return '/dashboard/support';
  if (hasPower('SETTINGS')) return '/dashboard/settings';
  if (hasPower('SUB_ADMINS')) return '/dashboard/sub-admins';
  return '/dashboard/overview';
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPower,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { hasPower } = usePermission();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  const fallback = getFallbackRoute(hasPower);

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={fallback} replace />;
  }

  if (requiredPower && !hasPower(requiredPower)) {
    return <Navigate to={fallback} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
