import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './Drawer.css';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
}) => {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      if (bodyRef.current) {
        bodyRef.current.scrollTop = 0;
      }
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const drawerContent = (
    <div className="drawer-portal-wrapper">
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className={`drawer-panel drawer-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title-heading"
      >
        <div className="drawer-header">
          <div className="flex flex-col gap-0.5">
            <h3 id="drawer-title-heading" className="drawer-title">
              {title}
            </h3>
            {subtitle && <p className="drawer-subtitle">{subtitle}</p>}
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close details panel">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body" ref={bodyRef}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};
