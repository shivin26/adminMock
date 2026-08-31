import React from 'react';
import { Search, LogOut, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Breadcrumbs } from './Breadcrumbs';
import { NotificationMenu } from '../../components/dashboard/NotificationMenu';
import { Button } from '../../components/ui/Button';

export interface NavbarProps {
  onOpenMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileSidebar }) => {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = React.useState(false);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
    document.documentElement.classList.toggle('dark');
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Alex Vance';

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#E4DCC9] bg-white px-4 sm:px-6 transition-all shadow-2xs">
      {/* Mobile Menu & Breadcrumbs Navigation */}
      <div className="flex items-center gap-3">
        {onOpenMobileSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileSidebar}
            className="lg:hidden text-[#6B7C70]"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Breadcrumbs />
      </div>

      {/* Global Controls & Actions */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative hidden md:flex items-center">
          <button
            type="button"
            className="flex items-center gap-3 h-10 px-3.5 rounded-[10px] border border-[#E4DCC9] bg-[#F8F5EE] text-[12px] text-[#6B7C70] hover:border-[#C4A066] transition cursor-pointer font-sans"
          >
            <Search className="h-3.5 w-3.5 text-[#C4A066]" />
            <span>Search merchants, societies, transactions...</span>
            <kbd className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded text-[#6B7C70] border border-[#E4DCC9]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle dark/light theme"
          className="text-[#6B7C70] hover:text-[#18281F] hover:bg-[#EFE8D8]"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notification Bell Dropdown */}
        <NotificationMenu />

        <div className="h-4 w-px bg-[#E4DCC9] hidden sm:block mx-1" />

        {/* Profile Avatar Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-[#18281F] p-0.5 ring-2 ring-[#C4A066]/40">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'}
                alt={displayName}
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="font-serif text-[14px] font-bold text-[#18281F] leading-tight">
                {displayName}
              </span>
              <span className="font-sans text-[12px] text-[#6B7C70] font-semibold">
                {user?.role || 'Super Admin'}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-[#6B7C70] hover:text-[#B91C1C] hover:bg-[#EFE8D8]"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
