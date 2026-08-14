import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import './NotificationsDropdown.css';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'New Vendor Onboarding',
    message: 'FreshMart Organic submitted proof of payment.',
    time: '5m ago',
    read: false,
    type: 'info',
  },
  {
    id: '2',
    title: 'Society Registered',
    message: 'Greenwood Residency enrolled successfully.',
    time: '1h ago',
    read: false,
    type: 'success',
  },
  {
    id: '3',
    title: 'Subscription Expiring',
    message: 'Apex Grocers renewal due in 3 days.',
    time: '2h ago',
    read: true,
    type: 'warning',
  },
];

export const NotificationsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="notifications-dropdown-container" ref={dropdownRef}>
      <button
        className="nav-icon-btn notification-bell-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="View notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notifications-popover glass-panel animate-fade-in">
          <div className="notifications-header">
            <h4 className="notifications-title">Notifications</h4>
            {unreadCount > 0 && (
              <button className="mark-read-btn" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="notifications-empty">No notifications</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`notification-item ${!item.read ? 'unread' : ''}`}
                >
                  <div className="notification-icon">
                    {item.type === 'success' && <CheckCircle2 size={16} className="text-emerald-500" />}
                    {item.type === 'warning' && <AlertTriangle size={16} className="text-amber-500" />}
                    {item.type === 'info' && <ShieldCheck size={16} className="text-indigo-500" />}
                  </div>
                  <div className="notification-body">
                    <span className="notification-item-title">{item.title}</span>
                    <p className="notification-item-msg">{item.message}</p>
                    <span className="notification-item-time">{item.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
