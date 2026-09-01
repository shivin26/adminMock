import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../../../hooks/useNotifications';
import { formatDate } from '../../../utils/formatters.utils';
import './NotificationsDropdown.css';

export const NotificationsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notificationData } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllReadMutation = useMarkAllAsRead();

  const notifications = notificationData?.items || [];
  const unreadCount = notificationData?.unreadCount ?? notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleMarkSingleRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  return (
    <div className="notifications-dropdown-container" ref={dropdownRef}>
      <button
        className="nav-icon-btn notification-bell-btn cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="View notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notifications-popover glass-panel animate-fade-in">
          <div className="notifications-header flex items-center justify-between p-3 border-b border-[#E7DFD5]">
            <h4 className="notifications-title font-serif font-bold text-sm text-[#211A19]">Notifications</h4>
            {unreadCount > 0 && (
              <button
                className="mark-read-btn text-xs font-bold text-[#541D26] hover:underline cursor-pointer"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notifications-list max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="notifications-empty p-4 text-center text-xs text-[#78716C]">No notifications</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.isRead && handleMarkSingleRead(item.id)}
                  className={`notification-item p-3 border-b border-[#E7DFD5]/50 flex gap-3 cursor-pointer hover:bg-[#FAF8F5] transition-all ${
                    !item.isRead ? 'bg-[#FAF8F5] font-semibold' : 'opacity-80'
                  }`}
                >
                  <div className="notification-icon shrink-0 mt-0.5">
                    {item.type === 'SUCCESS' || item.type === 'success' ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : item.type === 'WARNING' || item.type === 'warning' ? (
                      <AlertTriangle size={16} className="text-amber-500" />
                    ) : (
                      <ShieldCheck size={16} className="text-[#541D26]" />
                    )}
                  </div>
                  <div className="notification-body flex-1 min-w-0 text-xs">
                    <span className="notification-item-title font-bold text-[#211A19] block">{item.title}</span>
                    <p className="notification-item-msg text-[#78716C] truncate mt-0.5">{item.message}</p>
                    <span className="notification-item-time text-[10px] text-[#78716C] block mt-1">
                      {formatDate(item.createdAt || new Date().toISOString())}
                    </span>
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

