import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeToggle } from './components/ThemeToggle';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[var(--background)] text-[var(--foreground)] transition-colors p-6">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] border border-[var(--gold)] flex items-center justify-center font-serif font-bold text-lg">
            DL
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xl text-[var(--foreground)] tracking-tight">
              DigiLocal
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--gold)] font-semibold">
              Admin Portal
            </span>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Form Center */}
      <main className="my-auto w-full flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center font-mono text-xs text-[var(--muted-foreground)] py-4 tracking-wider">
        &copy; {new Date().getFullYear()} DIGILOCAL INC. ALL RIGHTS RESERVED. ENTERPRISE SECURITY GUARANTEED.
      </footer>
    </div>
  );
};
