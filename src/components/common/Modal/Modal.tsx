import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-backdrop" onClick={onClose} aria-hidden="true">
      <div
        className={`modal-container modal-${size} glass-panel animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title-heading"
        aria-describedby={subtitle ? 'modal-subtitle-text' : undefined}
      >
        <div className="modal-header">
          <div>
            <h3 id="modal-title-heading" className="modal-title">
              {title}
            </h3>
            {subtitle && (
              <p id="modal-subtitle-text" className="modal-subtitle">
                {subtitle}
              </p>
            )}
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
