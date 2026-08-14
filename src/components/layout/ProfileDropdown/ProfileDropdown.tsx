import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Shield, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import './ProfileDropdown.css';

export const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button className="profile-trigger-btn" onClick={() => setIsOpen((prev) => !prev)}>
        <div className="profile-avatar">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" />
          ) : (
            <UserIcon size={16} />
          )}
        </div>
        <div className="profile-trigger-info">
          <span className="profile-trigger-name">{user?.firstName || 'Admin'}</span>
          <span className="profile-trigger-role">{user?.role || 'admin'}</span>
        </div>
        <ChevronDown size={14} className="profile-chevron" />
      </button>

      {isOpen && (
        <div className="profile-menu glass-panel animate-fade-in">
          <div className="profile-menu-header">
            <span className="menu-user-email">{user?.email || 'admin@digilocal.com'}</span>
            <div className="menu-role-badge">
              <Shield size={10} />
              <span>{user?.role || 'admin'}</span>
            </div>
          </div>

          <div className="profile-menu-items">
            <button
              className="profile-menu-item"
              onClick={() => {
                setIsOpen(false);
                navigate('/dashboard/settings');
              }}
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <button
              className="profile-menu-item logout-item"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
