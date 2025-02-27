"use client";

import React, { useState, useRef, useEffect } from 'react';

interface TouchFeedbackProps {
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const TouchFeedback: React.FC<TouchFeedbackProps> = ({
  children,
  className = '',
  activeClassName = 'bg-primary/10',
  disabled = false,
  onClick,
}) => {
  const [isActive, setIsActive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Handle touch/mouse start
  const handleStart = () => {
    if (disabled) return;
    
    setIsActive(true);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
  
  // Handle touch/mouse end
  const handleEnd = () => {
    if (disabled) return;
    
    // Add a small delay before removing the active state for better visual feedback
    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, 150);
  };
  
  // Handle click
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    if (onClick) {
      onClick(e);
    }
  };
  
  return (
    <div
      className={`
        transition-colors duration-150
        ${className}
        ${isActive && !disabled ? activeClassName : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
    >
      {children}
    </div>
  );
}; 