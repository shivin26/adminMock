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
      'inline-flex items-center justify-center rounded-[10px] font-semibold font-sans transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A066] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99] cursor-pointer select-none';

    const variantStyles = {
      default:
        'bg-[#18281F] hover:bg-[#243A2D] text-[#F8F5EE] shadow-xs border border-[#18281F]',
      indigo:
        'bg-[#18281F] hover:bg-[#243A2D] text-[#F8F5EE] shadow-xs border border-[#18281F]',
      mint:
        'bg-[#1E3A29] hover:bg-[#18281F] text-[#F8F5EE] shadow-xs border border-[#1E3A29]',
      gradient:
        'bg-[#18281F] hover:bg-[#243A2D] text-[#F8F5EE] shadow-xs border border-[#18281F]',
      gold:
        'bg-[#C4A066] hover:bg-[#B38F55] text-[#18281F] font-bold shadow-xs border border-[#C4A066]',
      ink:
        'bg-[#18281F] hover:bg-[#243A2D] text-[#F8F5EE] shadow-xs',
      secondary:
        'bg-[#EFE8D8] hover:bg-[#E4DCC9] text-[#18281F] border border-[#E4DCC9] shadow-xs font-semibold',
      outline:
        'bg-white hover:bg-[#EFE8D8] text-[#18281F] border border-[#E4DCC9] shadow-xs font-semibold',
      ghost:
        'hover:bg-[#EFE8D8] text-[#6B7C70] hover:text-[#18281F]',
      destructive:
        'bg-[#B91C1C] hover:bg-[#991B1B] text-white font-semibold shadow-xs border border-[#B91C1C]',
      success:
        'bg-[#1E3A29] hover:bg-[#18281F] text-white font-semibold shadow-xs border border-[#1E3A29]',
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
