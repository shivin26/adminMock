import React from 'react';
import './Header.css';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { Sun, Moon, LogOut, User as UserIcon, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header glass-panel">
      <div className="header-search-space">
        <span className="header-env-badge">Production API Ready</span>
      </div>

      <div className="header-actions">
        <button
          className="header-icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="header-user-profile">
          <div className="user-avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="User Avatar" />
            ) : (
              <UserIcon size={18} />
            )}
          </div>
          <div className="user-info">
            <span className="user-name">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="user-role-badge">
              <Shield size={10} />
              {user?.role || 'Admin'}
            </span>
          </div>
        </div>

        <button className="header-icon-btn logout-btn" onClick={logout} title="Sign Out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};
