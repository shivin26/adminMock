import React from 'react';
import { Clock, LogOut, ShieldAlert } from 'lucide-react';
import { useSessionTimeout } from '../../hooks/auth/useSessionTimeout';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const SessionTimeoutWarning: React.FC = () => {
  const { showWarning, remainingSeconds, extendSession, logoutSession } = useSessionTimeout();

  if (!showWarning) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <Modal
      isOpen={showWarning}
      onClose={extendSession}
      showCloseButton={false}
      size="sm"
      title={
        <div className="flex items-center gap-2 text-[var(--gold)]">
          <ShieldAlert className="h-5 w-5" />
          <span className="font-serif font-bold text-lg">Inactivity Session Warning</span>
        </div>
      }
    >
      <div className="space-y-4 py-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30">
          <Clock className="h-7 w-7 animate-pulse" />
        </div>

        <p className="text-sm font-body text-[var(--foreground)]">
          You have been inactive for a while. For security reasons, your session will expire in:
        </p>

        <div className="py-2">
          <span className="font-mono text-3xl font-bold text-[var(--gold)] tracking-widest bg-[var(--secondary)] px-4 py-1.5 rounded-md border border-[var(--border)]">
            {formattedTime}
          </span>
        </div>

        <p className="text-xs font-mono-meta text-[var(--muted-foreground)]">
          Would you like to extend your session or log out now?
        </p>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<LogOut className="h-4 w-4" />}
            onClick={logoutSession}
          >
            Log Out Now
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={extendSession}
          >
            Extend Session
          </Button>
        </div>
      </div>
    </Modal>
  );
};
