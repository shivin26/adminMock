import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import './MainDashboardLayout.css';
import { Sidebar } from '../components/layout/Sidebar/Sidebar';
import { Navbar } from '../components/layout/Navbar/Navbar';
import { ToastContainer } from '../components/common/Toast/ToastContainer';

export const MainDashboardLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    // If on mobile/tablet screen width, toggle overlay drawer; otherwise toggle collapse mode
    if (window.innerWidth <= 1024) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  const sidebarWidthClass = isCollapsed ? 'collapsed-shell' : 'expanded-shell';

  return (
    <div
      className={`dashboard-shell ${sidebarWidthClass}`}
      style={{
        ['--sidebar-width' as any]: isCollapsed ? '80px' : '260px',
      }}
    >
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Top Header Navbar */}
      <Navbar
        onToggleSidebar={handleToggleSidebar}
        isSidebarCollapsed={isCollapsed}
      />

      <main className="dashboard-main-content">
        <div className="content-container animate-fade-in">
          <Outlet />
        </div>
      </main>

      <ToastContainer />
    </div>
  );
};
