import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../components/feedback/ToastSystem';

// Default config: 15 minutes timeout, warning at 2 minutes remaining
const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;
const DEFAULT_WARNING_MS = 2 * 60 * 1000;

export function useSessionTimeout(
  timeoutMs = DEFAULT_TIMEOUT_MS,
  warningMs = DEFAULT_WARNING_MS
) {
  const { isAuthenticated, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(Math.floor(warningMs / 1000));

  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
    }
  }, [showWarning]);

  const extendSession = useCallback(() => {
    resetActivity();
    toast.info('Session extended', 'Your session has been refreshed.');
  }, [resetActivity]);

  const logoutSession = useCallback(() => {
    setShowWarning(false);
    logout();
    toast.warning('Session expired', 'You were logged out due to inactivity.');
  }, [logout]);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart',
    ];

    const handleUserActivity = () => {
      // Only reset activity if warning is NOT active
      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    activityEvents.forEach((evt) => window.addEventListener(evt, handleUserActivity));

    const checkInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;

      if (elapsed >= timeoutMs) {
        logoutSession();
      } else if (elapsed >= timeoutMs - warningMs) {
        if (!showWarning) {
          setShowWarning(true);
        }
        const remaining = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000));
        setRemainingSeconds(remaining);
      }
    }, 1000);

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      clearInterval(checkInterval);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningCountdownRef.current) clearInterval(warningCountdownRef.current);
    };
  }, [isAuthenticated, timeoutMs, warningMs, showWarning, logoutSession]);

  return {
    showWarning,
    remainingSeconds,
    extendSession,
    logoutSession,
  };
}
