import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './Drawer.css';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl';
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
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCloseTrigger = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      setIsRendered(false);
      setIsClosing(false);
      onClose();
    }, 240);
  }, [isClosing, onClose]);

  useEffect(() => {
    if (isOpen) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setIsRendered(true);
      setIsClosing(false);
    } else if (isRendered && !isClosing) {
      setIsClosing(true);
      closeTimeoutRef.current = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 240);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRendered && !isClosing) {
        handleCloseTrigger();
      }
    };

    if (isRendered) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      if (bodyRef.current && !isClosing) {
        bodyRef.current.scrollTop = 0;
      }
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRendered, isClosing, handleCloseTrigger]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  if (!isRendered) return null;

  const drawerContent = (
    <div className="drawer-portal-wrapper">
      <div
        className={`drawer-backdrop ${isClosing ? 'drawer-backdrop-closing' : ''}`}
        onClick={handleCloseTrigger}
        aria-hidden="true"
      />
      <div
        className={`drawer-panel drawer-${size} ${isClosing ? 'drawer-panel-closing' : ''}`}
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
          <button className="drawer-close-btn" onClick={handleCloseTrigger} aria-label="Close details panel">
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
