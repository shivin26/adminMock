import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  DollarSign,
  Settings,
  Bell,
  ShieldCheck,
  Activity,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const navigationGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        { label: 'Reports & Analytics', path: '/dashboard/analytics', icon: <Activity className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Management',
      items: [
        { label: 'Areas', path: '/dashboard/societies', icon: <Building2 className="h-4 w-4" /> },
        { label: 'Users & Vendors', path: '/dashboard/users', icon: <Users className="h-4 w-4" /> },
        { label: 'Subscriptions', path: '/dashboard/subscriptions', icon: <CreditCard className="h-4 w-4" /> },
        { label: 'Payments & Payouts', path: '/dashboard/payments', icon: <DollarSign className="h-4 w-4" /> },
        { label: 'Architecture Specs', path: '/dashboard/architecture', icon: <Layers className="h-4 w-4" /> },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Notifications Feed', path: '/dashboard/notifications', icon: <Bell className="h-4 w-4" /> },
        { label: 'Security & Audit Logs', path: '/dashboard/security', icon: <ShieldCheck className="h-4 w-4" />, badge: 'Audit' },
        { label: 'Settings', path: '/dashboard/settings', icon: <Settings className="h-4 w-4" /> },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-[#243A2D] bg-[#18281F] text-[#F8F5EE] transition-all duration-200 z-30 select-none shadow-sm',
        isCollapsed ? 'w-18' : 'w-64'
      )}
    >
      {/* Brand Logo Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-[#243A2D]">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[10px] bg-white border border-[#C4A066] p-0.5 flex items-center justify-center overflow-hidden shadow-xs">
              <img src="/logo.png" alt="DigiLocal Logo" className="h-full w-full object-contain rounded-[8px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-[18px] text-[#F8F5EE] tracking-tight leading-none">
                DigiLocal
              </span>
              <span className="font-sans text-[10px] uppercase tracking-widest text-[#C4A066] font-semibold mt-1">
                SUPER ADMIN
              </span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto h-9 w-9 rounded-[10px] bg-white border border-[#C4A066] p-0.5 flex items-center justify-center overflow-hidden shadow-xs">
            <img src="/logo.png" alt="DigiLocal Logo" className="h-full w-full object-contain rounded-[8px]" />
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6 scrollbar-none">
        {navigationGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!isCollapsed && (
              <h5 className="px-3 font-sans text-[11px] font-semibold text-[#6B7C70] uppercase tracking-wider mb-2">
                {group.title}
              </h5>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-semibold font-sans transition-all duration-150',
                    isActive
                      ? 'bg-[#C4A066] text-[#18281F] font-bold shadow-xs'
                      : 'text-[#F8F5EE]/80 hover:bg-[#243A2D] hover:text-[#F8F5EE]',
                    isCollapsed && 'justify-center px-0'
                  )
                }
                title={isCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <span className={cn('shrink-0', isActive ? 'text-[#18281F]' : 'text-[#C4A066]')}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                    {!isCollapsed && item.badge && (
                      <span className="font-sans text-[10px] bg-[#243A2D] text-[#C4A066] border border-[#C4A066]/30 px-2 py-0.5 rounded-full font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-[#243A2D] flex justify-end">
        <button
          onClick={onToggleCollapse}
          className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#243A2D] bg-[#18281F] text-[#F8F5EE] hover:bg-[#243A2D] transition cursor-pointer"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4 text-[#C4A066]" /> : <ChevronLeft className="h-4 w-4 text-[#C4A066]" />}
        </button>
      </div>
    </aside>
  );
};
