import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  ArrowLeft,
  Building2,
  Users,
  X,
  CheckCheck,
  Store,
  CreditCard,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Activity,
  ChevronDown,
} from 'lucide-react';
import './Navbar.css';
import { useAuth } from '../../../hooks/useAuth';
import { usePermission } from '../../../hooks/usePermission';
import { useSocieties } from '../../../hooks/useSocieties';
import { useVendors } from '../../../hooks/useVendors';
import { AuditLogDrawer } from '../../common/AuditLogDrawer';

export interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'vendor' | 'society' | 'subscription' | 'system';
  categoryBadge: string;
  entityDetails?: string;
  actionText: string;
  targetUrl: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, logout } = useAuth();
  const { isSuperAdmin } = usePermission();
  const navigate = useNavigate();
  const location = useLocation();

  const [canGoBack, setCanGoBack] = useState(false);
  const initialPathRef = useRef<string | null>(null);
  const navCountRef = useRef(0);

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    if (initialPathRef.current === null) {
      initialPathRef.current = currentPath;
    } else if (initialPathRef.current !== currentPath) {
      navCountRef.current += 1;
    }

    const idx = window.history.state?.idx;
    if (typeof idx === 'number') {
      setCanGoBack(idx > 0);
    } else {
      setCanGoBack(navCountRef.current > 0);
    }
  }, [location]);

  const userInitial = user
    ? (user.firstName?.charAt(0) || (user as any).name?.charAt(0) || user.email?.charAt(0) || 'A').toUpperCase()
    : 'A';

  const displayName = user
    ? (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user as any).name || user.email)
    : 'Aarushi Admin';

  const roleBadgeText = isSuperAdmin ? 'SUPER ADMIN' : 'SUB ADMIN';
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('digilocal_admin_notifications');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('digilocal_admin_notifications', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { data: societies = [] } = useSocieties(searchTerm);
  const { data: vendors = [] } = useVendors({ search: searchTerm });

  // Sync resubmitted & pending vendors dynamically into notification center
  useEffect(() => {
    if (vendors && vendors.length > 0) {
      const resubmittedVendors = vendors.filter(
        (v) =>
          (v.hasResubmitted ||
            v.hasVendorUpdate ||
            (v.resubmittedChanges && v.resubmittedChanges.length > 0) ||
            (v.updatedFieldKeys && v.updatedFieldKeys.length > 0)) &&
          !v.isUpdateViewed
      );
      if (resubmittedVendors.length > 0) {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const newNotifs: NotificationItem[] = [];

          resubmittedVendors.forEach((v) => {
            const nId = `notif-vendor-${v.id}`;
            if (!existingIds.has(nId)) {
              newNotifs.push({
                id: nId,
                title: 'Vendor Settings Resubmitted',
                message: `${v.storeName} (${v.ownerName}) updated registration settings in response to hold request.`,
                time: v.resubmittedAtReadable || 'Just now',
                unread: true,
                type: 'vendor',
                categoryBadge: 'Resubmission',
                entityDetails: `${v.storeName} • ${v.locationArea || v.societyName || v.area || 'Jagatpura'}`,
                actionText: 'Review Updated Details',
                targetUrl: `/dashboard/vendors?tab=on_hold`,
              });
            }
          });

          if (newNotifs.length > 0) {
            return [...newNotifs, ...prev];
          }
          return prev;
        });
      }
    }
  }, [vendors]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotifClick = (id: string, targetUrl: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item))
    );
    navigate(targetUrl);
    setIsNotificationsOpen(false);
  };

  const handleDismissNotif = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredNotifs = notifFilter === 'unread'
    ? notifications.filter((n) => n.unread)
    : notifications;

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'vendor':
        return <Store size={18} />;
      case 'subscription':
        return <CreditCard size={18} />;
      case 'society':
        return <Building2 size={18} />;
      case 'system':
        return <ShieldAlert size={18} />;
      default:
        return <Bell size={18} />;
    }
  };

  // Close search, notification, & profile popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSocieties = searchTerm ? societies.slice(0, 3) : [];
  const filteredVendors = searchTerm ? vendors.slice(0, 3) : [];
  const hasResults = filteredSocieties.length > 0 || filteredVendors.length > 0;

  return (
    <header className="navbar-header">
      <div className="navbar-left">
        {/* Back Navigation Button - appears only after admin changes panel */}
        {canGoBack && (
          <button
            className="nav-icon-btn toggle-arrow-btn"
            onClick={() => navigate(-1)}
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
      </div>

      {/* Global Interactive Search Bar */}
      <div className="navbar-center" ref={searchRef}>
        <div className="navbar-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search vendors, societies, subscriptions..."
            className="navbar-search-input"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
          />
          {searchTerm && (
            <button
              className="search-clear-btn"
              onClick={() => {
                setSearchTerm('');
                setIsSearchOpen(false);
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown Overlay */}
        {isSearchOpen && searchTerm.trim().length > 0 && (
          <div className="search-dropdown-results animate-fade-in">
            {hasResults ? (
              <>
                {filteredSocieties.length > 0 && (
                  <div className="search-group">
                    <span className="search-group-title">
                      <Building2 size={12} /> Societies ({filteredSocieties.length})
                    </span>
                    {filteredSocieties.map((soc) => (
                      <div
                        key={soc.id}
                        className="search-result-item"
                        onClick={() => {
                          navigate('/dashboard/societies');
                          setIsSearchOpen(false);
                        }}
                      >
                        <span className="item-title">{soc.name}</span>
                        <span className="item-sub">{soc.address}</span>
                      </div>
                    ))}
                  </div>
                )}

                {filteredVendors.length > 0 && (
                  <div className="search-group">
                    <span className="search-group-title">
                      <Users size={12} /> Vendors ({filteredVendors.length})
                    </span>
                    {filteredVendors.map((v) => (
                      <div
                        key={v.id}
                        className="search-result-item"
                        onClick={() => {
                          navigate('/dashboard/vendors');
                          setIsSearchOpen(false);
                        }}
                      >
                        <span className="item-title">{v.storeName}</span>
                        <span className="item-sub">{v.ownerName} • {v.societyName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching societies or vendors found for "{searchTerm}".
              </div>
            )}
          </div>
        )}
      </div>

      <div className="navbar-right">
        {/* System Audit & Mutation Logs Navigation Shortcut Button */}
        <button
          type="button"
          className="nav-icon-btn text-[#A88B58] hover:text-white hover:bg-[#6B2732] transition-all flex items-center justify-center border border-[#E7DFD5] rounded-full"
          onClick={() => navigate('/dashboard/audit-logs')}
          title="View Complete Audit Logs & Mutation Trail Section"
        >
          <Activity size={18} />
        </button>

        {/* Notifications Button & Popover */}
        <div className="notif-dropdown-wrapper" ref={notifRef}>
          <button
            type="button"
            className="nav-icon-btn relative"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            title="System Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="nav-badge-dot" />}
          </button>

          {isNotificationsOpen && (
            <div className="notif-popover animate-fade-in">
              <div className="notif-popover-header">
                <div className="flex items-center gap-2">
                  <span className="notif-title">System Notifications</span>
                  {unreadCount > 0 && <span className="notif-count-pill">{unreadCount} New</span>}
                </div>
                {unreadCount > 0 && (
                  <button className="mark-read-btn" onClick={markAllRead}>
                    <CheckCheck size={12} /> Mark all read
                  </button>
                )}
              </div>

              {/* Notification Filter Bar */}
              <div className="notif-tabs-bar">
                <button
                  className={`notif-tab-btn ${notifFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setNotifFilter('all')}
                >
                  All ({notifications.length})
                </button>
                <button
                  className={`notif-tab-btn ${notifFilter === 'unread' ? 'active' : ''}`}
                  onClick={() => setNotifFilter('unread')}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              <div className="notif-list">
                {filteredNotifs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    {notifFilter === 'unread' ? 'No unread notifications at present.' : 'No notifications found.'}
                  </div>
                ) : (
                  filteredNotifs.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item relative group ${n.unread ? 'unread' : ''}`}
                      onClick={() => handleNotifClick(n.id, n.targetUrl)}
                    >
                      <div className={`notif-item-icon-box ${n.type}`}>
                        {getNotifIcon(n.type)}
                      </div>

                      <div className="notif-item-content">
                        <div className="notif-item-header pr-6">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="notif-item-title">{n.title}</span>
                            <span className="notif-item-badge">{n.categoryBadge}</span>
                          </div>
                          <span className="notif-time">{n.time}</span>
                        </div>

                        <p className="notif-item-msg">{n.message}</p>

                        {n.entityDetails && (
                          <div className="notif-item-entity">
                            {n.entityDetails}
                          </div>
                        )}

                        <div className="notif-item-action">
                          <span>{n.actionText}</span>
                          <ArrowRight size={12} />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDismissNotif(e, n.id)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Dismiss notification"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="notif-popover-footer">
                <button
                  className="notif-footer-btn"
                  onClick={() => {
                    navigate('/dashboard/audit-logs');
                    setIsNotificationsOpen(false);
                  }}
                >
                  <span>View All Audit Logs & System Trail</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logged-In User Profile Capsule Dropdown */}
        <div className="profile-dropdown-wrapper" ref={profileRef}>
          <button
            type="button"
            className="profile-capsule-btn"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            title="User Account Options"
          >
            <div className="profile-capsule-avatar">
              {userInitial}
            </div>
            <div className="profile-capsule-info">
              <span className="profile-capsule-name">{displayName}</span>
              <span className="profile-capsule-role">{roleBadgeText}</span>
            </div>
            <ChevronDown size={14} className={`profile-capsule-chevron ${isProfileOpen ? 'open' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="profile-popover animate-fade-in">
              <div className="profile-popover-header">
                <span className="user-name">{displayName}</span>
                <span className="user-role">{roleBadgeText}</span>
              </div>
              <button
                className="logout-btn"
                onClick={() => {
                  logout();
                  setIsProfileOpen(false);
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <AuditLogDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
      />
    </header>
  );
};
