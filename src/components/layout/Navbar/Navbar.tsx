import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import './Navbar.css';
import { useAuth } from '../../../hooks/useAuth';
import { useSocieties } from '../../../hooks/useSocieties';
import { useVendors } from '../../../hooks/useVendors';

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

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'New Vendor Onboarding Application',
    message: 'ResinReverie (Lovely Sethiya) submitted a new registration request for Greenwood Residency.',
    time: '10m ago',
    unread: true,
    type: 'vendor',
    categoryBadge: 'Vendor Request',
    entityDetails: 'ResinReverie • Greenwood Residency',
    actionText: 'Review & Verify Payment',
    targetUrl: '/dashboard/vendors?tab=pending',
  },
  {
    id: 'n-2',
    title: 'Enterprise Subscription Renewed',
    message: 'Mahagun Organic store renewed their Enterprise Tier subscription plan for 12 months.',
    time: '45m ago',
    unread: true,
    type: 'subscription',
    categoryBadge: 'Payment Cleared',
    entityDetails: 'Mahagun Organic • Invoice #INV-2026-09',
    actionText: 'View Subscription & Invoice',
    targetUrl: '/dashboard/subscriptions',
  },
  {
    id: 'n-3',
    title: 'Residential Enclave Onboarded',
    message: 'Royal Garden Enclave (Code RGE-2026) was activated with 8 assigned vendors.',
    time: '2h ago',
    unread: false,
    type: 'society',
    categoryBadge: 'Society Active',
    entityDetails: 'Royal Garden Enclave • Sector 62',
    actionText: 'Manage Enclave Vendors',
    targetUrl: '/dashboard/societies',
  },
  {
    id: 'n-4',
    title: 'Vendor Compliance Warning',
    message: 'Fresh Veggies Store received an automated warning regarding delivery delay reports.',
    time: '5h ago',
    unread: false,
    type: 'vendor',
    categoryBadge: 'Compliance Alert',
    entityDetails: 'Fresh Veggies Store • Mahagun Enclave',
    actionText: 'Inspect Vendor Account',
    targetUrl: '/dashboard/vendors?tab=suspended',
  },
  {
    id: 'n-5',
    title: 'Security & Access Log Audit',
    message: 'Root administrator password updated and sub-admin delegation powers audited.',
    time: '1d ago',
    unread: false,
    type: 'system',
    categoryBadge: 'Security Audit',
    entityDetails: 'Platform Security • Admin Portal',
    actionText: 'View Security Settings',
    targetUrl: '/dashboard/settings',
  },
];

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [notifVisibleCount, setNotifVisibleCount] = useState(3);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { data: societies = [] } = useSocieties(searchTerm);
  const { data: vendors = [] } = useVendors({ search: searchTerm });

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const filteredNotifs = notifFilter === 'unread'
    ? notifications.filter((n) => n.unread)
    : notifications;

  const handleNotifScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 50 && notifVisibleCount < filteredNotifs.length) {
      setNotifVisibleCount((prev) => Math.min(prev + 3, filteredNotifs.length));
    }
  };

  const displayedNotifs = filteredNotifs.slice(0, notifVisibleCount);
  const hasMoreNotifs = notifVisibleCount < filteredNotifs.length;

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
        {/* Back Navigation Button */}
        <button
          className="nav-icon-btn toggle-arrow-btn"
          onClick={() => navigate(-1)}
          title="Go Back"
        >
          <ArrowLeft size={18} />
        </button>
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
        {/* Notifications Button & Popover */}
        <div className="notif-dropdown-wrapper" ref={notifRef}>
          <button
            className="nav-icon-btn relative"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            title="Notifications"
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

              <div className="notif-list" onScroll={handleNotifScroll}>
                {filteredNotifs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No unread notifications at present.
                  </div>
                ) : (
                  <>
                    {displayedNotifs.map((n) => (
                      <div
                        key={n.id}
                        className={`notif-item ${n.unread ? 'unread' : ''}`}
                        onClick={() => {
                          navigate(n.targetUrl);
                          setIsNotificationsOpen(false);
                        }}
                      >
                        <div className={`notif-item-icon-box ${n.type}`}>
                          {getNotifIcon(n.type)}
                        </div>

                        <div className="notif-item-content">
                          <div className="notif-item-header">
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
                      </div>
                    ))}

                    {hasMoreNotifs && (
                      <div className="p-2 text-center text-[11px] font-semibold text-[#C4A066] flex items-center justify-center gap-1.5">
                        <span>Scroll to auto-load more notifications...</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="notif-popover-footer">
                <button
                  className="notif-footer-btn"
                  onClick={() => {
                    navigate('/dashboard/overview');
                    setIsNotificationsOpen(false);
                  }}
                >
                  <span>View All System Activity & Reports</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="profile-dropdown-wrapper" ref={profileRef}>
          <button
            className="nav-icon-btn profile-avatar-btn"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            title="User Profile"
          >
            <User size={18} />
          </button>

          {isProfileOpen && (
            <div className="profile-popover animate-fade-in">
              <div className="profile-popover-header">
                <span className="user-name">{(user as any)?.name || user?.email || 'System Admin'}</span>
                <span className="user-role">{user?.role ? user.role.toUpperCase() : 'SUPER ADMIN'}</span>
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
    </header>
  );
};
