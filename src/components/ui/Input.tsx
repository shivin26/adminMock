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
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7C70] pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            'flex h-11 w-full rounded-[10px] border border-[#E4DCC9] bg-white px-3.5 py-2 text-[14px] text-[#18281F] placeholder:text-[#6B7C70]/70 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#18281F] focus:border-[#18281F] disabled:cursor-not-allowed disabled:opacity-50 font-sans shadow-2xs',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-[#B91C1C] focus:ring-[#B91C1C] focus:border-[#B91C1C]',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7C70]">
            {rightIcon}
          </div>
        )}

        {error && <span className="font-sans text-[12px] text-[#B91C1C] font-semibold mt-1 block">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
