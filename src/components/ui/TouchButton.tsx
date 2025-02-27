"use client";

import React from 'react';

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'min-h-[48px] px-4 py-2 text-sm',
    md: 'min-h-[56px] px-5 py-3 text-base',
    lg: 'min-h-[64px] px-6 py-4 text-lg',
    xl: 'min-h-[72px] px-8 py-5 text-xl',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Icon classes
  const iconClasses = icon ? 'flex items-center justify-center gap-2' : '';
  
  // Combined classes
  const buttonClasses = `
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${widthClasses}
    ${iconClasses}
    rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
    ${className}
  `;
  
  return (
    <button className={buttonClasses} {...props}>
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </button>
  );
}; 