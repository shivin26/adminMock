import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C] pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            'flex h-11 w-full rounded-[10px] border border-[#E7DFD5] bg-[#FAF8F5] px-3.5 py-2 text-[14px] text-[#211A19] placeholder:text-[#78716C] transition-all duration-150 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#541D26]/10 focus:border-[#541D26] disabled:cursor-not-allowed disabled:opacity-50 font-sans shadow-2xs',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-[#DC2626] focus:ring-[#DC2626]/10 focus:border-[#DC2626]',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#78716C]">
            {rightIcon}
          </div>
        )}

        {error && <span className="font-sans text-[12px] text-[#DC2626] font-semibold mt-1 block">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
