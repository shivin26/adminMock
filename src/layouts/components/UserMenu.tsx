import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User as UserIcon, Settings, Shield, KeyRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLogout } from '../../hooks/auth/useAuthMutations';
import { Badge } from '../../components/ui/Badge';
import { ChangePasswordModal } from '../../components/auth/ChangePasswordModal';
import { useNavigate } from 'react-router-dom';

export const UserMenu: React.FC = () => {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-full p-1 transition hover:bg-[var(--secondary)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        >
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'}
            alt={`${user.firstName} ${user.lastName}`}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-[var(--gold)]/40"
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-150 text-[var(--foreground)]">
            {/* User Info Header */}
            <div className="p-3 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <p className="font-serif text-sm font-semibold truncate">
                  {user.firstName} {user.lastName}
                </p>
                <Badge variant="gold" className="capitalize">
                  {user.role.replace('_', ' ')}
                </Badge>
              </div>
              <p className="font-mono text-[11px] text-[var(--muted-foreground)] truncate mt-0.5">
                {user.email}
              </p>
            </div>

            {/* Menu Actions */}
            <div className="py-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/dashboard/profile');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-body font-medium hover:bg-[var(--secondary)] hover:text-[var(--gold)] rounded-md transition"
              >
                <UserIcon className="h-4 w-4 text-[var(--muted-foreground)]" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsChangePasswordOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-body font-medium hover:bg-[var(--secondary)] hover:text-[var(--gold)] rounded-md transition"
              >
                <KeyRound className="h-4 w-4 text-[var(--muted-foreground)]" />
                <span>Change Password</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/dashboard/settings');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-body font-medium hover:bg-[var(--secondary)] hover:text-[var(--gold)] rounded-md transition"
              >
                <Settings className="h-4 w-4 text-[var(--muted-foreground)]" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/dashboard/security');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-body font-medium hover:bg-[var(--secondary)] hover:text-[var(--gold)] rounded-md transition"
              >
                <Shield className="h-4 w-4 text-[var(--muted-foreground)]" />
                <span>Security & Audit</span>
              </button>
            </div>

            {/* Logout Action */}
            <div className="pt-1 border-t border-[var(--border)]">
              <button
                onClick={() => {
                  setIsOpen(false);
                  logoutMutation.mutate();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-body font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
};
