import React from 'react';
import './Button.css';
import { Loader2 } from 'lucide-react';

export type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;


export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`custom-btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="btn-spinner animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : (
        leftIcon && <span className="btn-icon left">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="btn-icon right">{rightIcon}</span>}
    </button>
  );
};
