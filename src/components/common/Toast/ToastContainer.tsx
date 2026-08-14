import React from 'react';
import './ToastContainer.css';
import { useToast } from '../../../context/ToastContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-portal-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type} animate-fade-in`}>
          <div className="toast-icon-wrapper">
            {toast.type === 'success' && <CheckCircle2 size={18} className="toast-icon-success" />}
            {toast.type === 'error' && <AlertCircle size={18} className="toast-icon-error" />}
            {toast.type === 'warning' && <AlertTriangle size={18} className="toast-icon-warning" />}
            {toast.type === 'info' && <Info size={18} className="toast-icon-info" />}
          </div>
          <div className="toast-content">
            <h5 className="toast-title">{toast.title}</h5>
            {toast.description && <p className="toast-desc">{toast.description}</p>}
          </div>
          <button className="toast-close-btn" onClick={() => removeToast(toast.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
