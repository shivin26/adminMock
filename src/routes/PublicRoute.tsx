import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export interface PublicRouteProps {
  children?: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {

    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard/overview" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
