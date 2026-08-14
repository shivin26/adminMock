import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PageLoader } from '../components/feedback/PageLoader';
import { Page404 } from '../components/feedback/Page404';

// Static Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';

// Lazy Loaded Feature Modules for Route-Level Code Splitting & Performance Optimization
const DashboardOverviewPage = lazy(() =>
  import('../pages/dashboard/DashboardOverviewPage').then((m) => ({ default: m.DashboardOverviewPage }))
);
const SocietyListPage = lazy(() =>
  import('../pages/dashboard/SocietyListPage').then((m) => ({ default: m.SocietyListPage }))
);
const VendorListPage = lazy(() =>
  import('../pages/dashboard/VendorListPage').then((m) => ({ default: m.VendorListPage }))
);
const SubscriptionListPage = lazy(() =>
  import('../pages/dashboard/SubscriptionListPage').then((m) => ({ default: m.SubscriptionListPage }))
);
const PaymentListPage = lazy(() =>
  import('../pages/dashboard/PaymentListPage').then((m) => ({ default: m.PaymentListPage }))
);
const ReportsPage = lazy(() =>
  import('../pages/dashboard/ReportsPage').then((m) => ({ default: m.ReportsPage }))
);
const SettingsPage = lazy(() =>
  import('../pages/dashboard/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const NotificationListPage = lazy(() =>
  import('../pages/dashboard/NotificationListPage').then((m) => ({ default: m.NotificationListPage }))
);
const AuditLogPage = lazy(() =>
  import('../pages/dashboard/AuditLogPage').then((m) => ({ default: m.AuditLogPage }))
);
const ArchitectureDemoPage = lazy(() =>
  import('../pages/dashboard/ArchitectureDemoPage').then((m) => ({ default: m.ArchitectureDemoPage }))
);

const LazyRoute: React.FC<{ component: React.ComponentType }> = ({ component: Component }) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: '*',
        element: <Page404 />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <LazyRoute component={DashboardOverviewPage} />,
      },
      {
        path: 'analytics',
        element: <LazyRoute component={ReportsPage} />,
      },
      {
        path: 'societies',
        element: <LazyRoute component={SocietyListPage} />,
      },
      {
        path: 'users',
        element: <LazyRoute component={VendorListPage} />,
      },
      {
        path: 'subscriptions',
        element: <LazyRoute component={SubscriptionListPage} />,
      },
      {
        path: 'payments',
        element: <LazyRoute component={PaymentListPage} />,
      },
      {
        path: 'notifications',
        element: <LazyRoute component={NotificationListPage} />,
      },
      {
        path: 'security',
        element: <LazyRoute component={AuditLogPage} />,
      },
      {
        path: 'settings',
        element: <LazyRoute component={SettingsPage} />,
      },
      {
        path: 'architecture',
        element: <LazyRoute component={ArchitectureDemoPage} />,
      },
      {
        path: '*',
        element: <Page404 />,
      },
    ],
  },
  {
    path: '*',
    element: <Page404 />,
  },
]);
