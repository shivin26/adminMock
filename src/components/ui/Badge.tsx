import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'forest' | 'gold' | 'secondary' | 'outline' | 'destructive' | 'violet' | 'cyan' | 'warning';
  children: React.ReactNode;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  showDot = false,
  className,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-sans font-semibold select-none border';

  const variantStyles = {
    default: 'bg-[#E8F2EA] text-[#1E3A29] border-[#D2E4D5]',
    forest: 'bg-[#E8F2EA] text-[#1E3A29] border-[#D2E4D5]',
    gold: 'bg-[#F9EFE2] text-[#8C6B38] border-[#EEDFCD]',
    warning: 'bg-[#F9EFE2] text-[#8C6B38] border-[#EEDFCD]',
    violet: 'bg-[#EBF3F9] text-[#2C5282] border-[#D5E4F1]',
    cyan: 'bg-[#EBF3F9] text-[#2C5282] border-[#D5E4F1]',
    secondary: 'bg-[#EEE5DA] text-[#211A19] border-[#E7DFD5]',
    outline: 'bg-white text-[#78716C] border-[#E7DFD5]',
    destructive: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]',
  };

  const dotColorStyles = {
    default: 'bg-[#1E3A29]',
    forest: 'bg-[#1E3A29]',
    gold: 'bg-[#8C6B38]',
    warning: 'bg-[#8C6B38]',
    violet: 'bg-[#2C5282]',
    cyan: 'bg-[#2C5282]',
    secondary: 'bg-[#78716C]',
    outline: 'bg-[#78716C]',
    destructive: 'bg-[#B91C1C]',
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {showDot && (
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColorStyles[variant])} />
      )}
      {children}
    </span>
  );
};
