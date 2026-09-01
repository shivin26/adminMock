import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  dark?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, interactive = false, dark = false, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-[2rem] border border-[#E7DFD5] bg-white p-6 text-[#211A19] shadow-xs transition-all duration-150 relative overflow-hidden',
        dark && 'bg-[#211A19] text-white border-[#211A19]',
        interactive &&
          'hover:border-[#C8A878] hover:shadow-sm cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('flex flex-col space-y-1 pb-4', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h3 className={cn('font-serif font-bold text-[18px] tracking-tight text-[#211A19]', className)} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p className={cn('font-sans text-[12px] text-[#78716C] font-semibold tracking-wide', className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('pt-0', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('flex items-center pt-4 border-t border-[#E7DFD5] mt-4', className)} {...props}>
      {children}
    </div>
  );
};
