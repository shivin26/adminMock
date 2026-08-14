import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from '../context/ToastContext';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

export interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <BrowserRouter>{children}</BrowserRouter>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};
