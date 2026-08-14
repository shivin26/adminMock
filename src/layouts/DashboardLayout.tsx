import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { SessionTimeoutWarning } from '../components/auth/SessionTimeoutWarning';
import { useMediaQuery } from '../hooks/useMediaQuery';

export const DashboardLayout: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full flex bg-[var(--background)] text-[var(--foreground)] transition-colors font-body">
      {/* Session Timeout Inactivity Warning Modal */}
      <SessionTimeoutWarning />

      {/* Desktop Sidebar */}
      {isDesktop && (
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      )}

      {/* Mobile Drawer Backdrop & Sidebar */}
      {!isDesktop && isMobileOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-[var(--ink)]/60 backdrop-blur-xs"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative flex w-64 max-w-xs flex-col z-50">
            <Sidebar
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenMobileSidebar={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
