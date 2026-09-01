import React from 'react';

export const ToastProvider: React.FC = () => {
  return null;
};

export const toast = {
  success: (message: string, description?: string) =>
    console.log('[Toast Success]', message, description),
  error: (message: string, description?: string) =>
    console.error('[Toast Error]', message, description),
  info: (message: string, description?: string) =>
    console.info('[Toast Info]', message, description),
  warning: (message: string, description?: string) =>
    console.warn('[Toast Warning]', message, description),
  loading: (message: string) => console.log('[Toast Loading]', message),
  dismiss: (_toastId?: string | number) => {},
};
