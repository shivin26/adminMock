import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gold' | 'gradient' | 'ink' | 'mint' | 'indigo' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-[10px] font-semibold font-sans transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A878] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99] cursor-pointer select-none';

    const variantStyles = {
      default:
        'bg-[#541D26] hover:bg-[#6B2732] text-white shadow-xs border border-[#C8A878]/30',
      indigo:
        'bg-[#541D26] hover:bg-[#6B2732] text-white shadow-xs border border-[#C8A878]/30',
      mint:
        'bg-[#541D26] hover:bg-[#6B2732] text-white shadow-xs border border-[#C8A878]/30',
      gradient:
        'bg-[#541D26] hover:bg-[#6B2732] text-white shadow-xs border border-[#C8A878]/30',
      gold:
        'bg-[#C8A878] hover:bg-[#A88B58] text-[#211A19] font-bold shadow-xs border border-[#C8A878]',
      ink:
        'bg-[#211A19] hover:bg-[#2D2322] text-white shadow-xs border border-[#E7DFD5]',
      secondary:
        'bg-[#EEE5DA] hover:bg-[#E7DFD5] text-[#211A19] border border-[#E7DFD5] shadow-xs font-semibold',
      outline:
        'bg-white hover:bg-[#FAF8F5] text-[#211A19] border border-[#E7DFD5] shadow-xs font-semibold',
      ghost:
        'hover:bg-[#FAF8F5] text-[#78716C] hover:text-[#211A19]',
      destructive:
        'bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold shadow-xs border border-[#DC2626]',
      success:
        'bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold shadow-xs border border-[#16A34A]',
    };

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-0 text-sm justify-center',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0 text-current" />
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
