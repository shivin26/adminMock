import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { MainDashboardLayout } from '../layouts/MainDashboardLayout';
import { DashboardSkeleton } from '../components/ui/DashboardSkeleton';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

// Dynamic Route Code Splitting (Lazy Loading)
const LoginPage = lazy(() =>
  import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);

const OverviewPage = lazy(() =>
  import('../pages/dashboard/OverviewPage').then((m) => ({ default: m.OverviewPage }))
);

const SocietiesPage = lazy(() =>
  import('../pages/dashboard/SocietiesPage').then((m) => ({ default: m.SocietiesPage }))
);

const VendorsPage = lazy(() =>
  import('../pages/dashboard/VendorsPage').then((m) => ({ default: m.VendorsPage }))
);

const UsersPage = lazy(() =>
  import('../pages/dashboard/UsersPage').then((m) => ({ default: m.UsersPage }))
);

const SubscriptionsPage = lazy(() =>
  import('../pages/dashboard/SubscriptionsPage').then((m) => ({ default: m.SubscriptionsPage }))
);

const SupportPage = lazy(() =>
  import('../pages/dashboard/SupportPage').then((m) => ({ default: m.SupportPage }))
);

const SubAdminsPage = lazy(() =>
  import('../pages/dashboard/SubAdminsPage').then((m) => ({ default: m.SubAdminsPage }))
);

const SettingsPage = lazy(() =>
  import('../pages/dashboard/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

const AuditLogsPage = lazy(() =>
  import('../pages/dashboard/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage }))
);

export const AppRoutes: React.FC = () => {
  useDocumentTitle();

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Routes>
        {/* Public Guest Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/auth/login" element={<LoginPage />} />
        </Route>

        {/* Protected Dashboard Shell Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainDashboardLayout />}>
            <Route element={<ProtectedRoute requiredPower="OVERVIEW" />}>
              <Route path="dashboard/overview" element={<OverviewPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPower="SOCIETIES" />}>
              <Route path="dashboard/societies" element={<SocietiesPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPower="VENDORS" />}>
              <Route path="dashboard/vendors" element={<VendorsPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPower="USERS" />}>
              <Route path="dashboard/users" element={<UsersPage />} />
            </Route>
            <Route path="dashboard/people" element={<Navigate to="/dashboard/users" replace />} />

            <Route element={<ProtectedRoute requiredPower="SUBSCRIPTIONS" />}>
              <Route path="dashboard/subscriptions" element={<SubscriptionsPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPower="SUPPORT" />}>
              <Route path="dashboard/support" element={<SupportPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPower="SUB_ADMINS" />}>
              <Route path="dashboard/sub-admins" element={<SubAdminsPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPower="SETTINGS" />}>
              <Route path="dashboard/settings" element={<SettingsPage />} />
            </Route>

            <Route path="dashboard/audit-logs" element={<AuditLogsPage />} />
          </Route>
        </Route>

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
      </Routes>
    </Suspense>
  );
};
