import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  const titleId = useId();
  const descriptionId = useId();

  // Escape key close listener & body overflow lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--ink)]/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Panel */}
      <div
        className={cn(
          'relative w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--foreground)] shadow-2xl z-10 animate-in zoom-in-95 duration-200 font-body',
          sizeClasses[size]
        )}
      >
        {/* Header */}
        {(title || description || showCloseButton) && (
          <div className="flex items-start justify-between pb-4 mb-4 border-b border-[var(--border)]">
            <div>
              {title && (
                <h3 id={titleId} className="font-serif text-xl font-bold text-[var(--foreground)] tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p id={descriptionId} className="text-xs text-[var(--muted-foreground)] mt-1">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div>{children}</div>
      </div>
    </div>
  );
};
