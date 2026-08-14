import React from 'react';
import './Card.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  isHoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  padding = 'md',
  isHoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`custom-card card-${variant} padding-${padding} ${
        isHoverable ? 'is-hoverable' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`card-header-section ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`card-body-section ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`card-footer-section ${className}`} {...props}>
    {children}
  </div>
);
