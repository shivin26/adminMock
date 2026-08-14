import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, helperText, className = '', id, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';
    const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const effectiveRightIcon = isPasswordField ? (
      <button
        type="button"
        className="input-password-toggle-btn"
        onClick={() => setShowPassword((prev) => !prev)}
        title={showPassword ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    ) : (
      rightIcon
    );

    return (
      <div className={`input-field-group ${className}`}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <div
          className={`input-wrapper ${leftIcon ? 'has-left-icon' : ''} ${
            effectiveRightIcon ? 'has-right-icon' : ''
          } ${error ? 'has-error' : ''}`}
        >
          {leftIcon && <span className="input-icon left">{leftIcon}</span>}
          <input ref={ref} id={inputId} type={inputType} className="input-control" {...props} />
          {isPasswordField ? (
            effectiveRightIcon
          ) : (
            rightIcon && <span className="input-icon right">{rightIcon}</span>
          )}
        </div>
        {error ? (
          <span className="input-error-msg">{error}</span>
        ) : (
          helperText && <span className="input-helper-msg">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
