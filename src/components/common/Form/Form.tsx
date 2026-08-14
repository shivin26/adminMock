import React from 'react';
import './Form.css';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  spacing?: 'sm' | 'md' | 'lg';
}

export const Form: React.FC<FormProps> = ({
  children,
  spacing = 'md',
  className = '',
  ...props
}) => {
  return (
    <form className={`custom-form form-spacing-${spacing} ${className}`} {...props}>
      {children}
    </form>
  );
};

export const FormRow: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => <div className={`form-row-container ${className}`} {...props}>{children}</div>;

export const FormField: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => <div className={`form-field-wrapper ${className}`} {...props}>{children}</div>;

export const FormLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  children,
  className = '',
  ...props
}) => <label className={`form-field-label ${className}`} {...props}>{children}</label>;

export const FormError: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return <span className="form-field-error">{message}</span>;
};
