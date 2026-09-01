import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Users,
  UserCheck,
  CreditCard,
  Settings,
  ShieldAlert,
  LifeBuoy,
  Menu,
  ChevronLeft,
} from 'lucide-react';
import './Sidebar.css';
import { MAIN_MENU_CONFIG } from '../../../config/menu.config';
import type { MenuItem } from '../../../config/menu.config';
import { usePlatformConfig } from '../../../hooks/useConfig';
import { usePermission } from '../../../hooks/usePermission';

export interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  Building2: <Building2 size={20} />,
  MapPin: <MapPin size={20} />,
  Users: <Users size={20} />,
  UserCheck: <UserCheck size={20} />,
  CreditCard: <CreditCard size={20} />,
  LifeBuoy: <LifeBuoy size={20} />,
  ShieldAlert: <ShieldAlert size={20} />,
  Settings: <Settings size={20} />,
};

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const { data: config } = usePlatformConfig();
  const { hasPower, isSuperAdmin } = usePermission();

  const visibleMenuItems = MAIN_MENU_CONFIG.filter((item) => hasPower(item.requiredPower));

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div className="sidebar-mobile-backdrop" onClick={onCloseMobile} />
      )}

      <aside
        className={`app-sidebar glass-panel ${isCollapsed ? 'collapsed' : ''} ${
          isMobileOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div
            className="brand-link"
            onClick={() => navigate('/dashboard/overview')}
            title="Go to Dashboard"
          >
            <div className="brand-logo-container">
              <img
                src="/logo.png"
                alt="DigiLocal Logo"
                className="brand-logo-img"
              />
            </div>
            <div className="brand-text">
              <span className="brand-name">DigiLocal</span>
              <span className="brand-badge">SUPER ADMIN</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-collapse-toggle"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Side Panel' : 'Collapse Side Panel'}
          >
            <Menu size={18} className="toggle-icon-menu" />
            <ChevronLeft size={18} className="toggle-icon-chevron" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav">
          <span className="nav-section-title">Main Navigation</span>
          {visibleMenuItems.map((item: MenuItem) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="nav-icon">{ICON_MAP[item.iconName]}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && (
                <span className={`nav-badge badge-${item.badgeVariant || 'primary'}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};
