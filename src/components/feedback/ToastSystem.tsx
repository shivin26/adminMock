import React from 'react';
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';

export const ToastProvider: React.FC = () => {
  const { actualTheme } = useTheme();

  return (
    <SonnerToaster
      theme={actualTheme}
      position="top-right"
      closeButton
      richColors
      toastOptions={{
        style: {
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
        },
      }}
    />
  );
};

export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, { description }),
  error: (message: string, description?: string) =>
    sonnerToast.error(message, { description }),
  info: (message: string, description?: string) =>
    sonnerToast.info(message, { description }),
  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, { description }),
  loading: (message: string) => sonnerToast.loading(message),
  dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
};
