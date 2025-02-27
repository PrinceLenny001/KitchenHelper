"use client";

import React, { useState, useRef, useEffect } from 'react';

interface TouchSliderProps {
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  value?: number;
  onChange?: (value: number) => void;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
}

export const TouchSlider: React.FC<TouchSliderProps> = ({
  min,
  max,
  step = 1,
  defaultValue,
  value: controlledValue,
  onChange,
  label,
  showValue = true,
  disabled = false,
  className = '',
}) => {
  // Use controlled or uncontrolled value
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue || min);
  const value = isControlled ? controlledValue : internalValue;
  
  // Calculate percentage for slider position
  const percentage = ((value - min) / (max - min)) * 100;
  
  // Handle value change
  const handleChange = (newValue: number) => {
    if (disabled) return;
    
    // Ensure value is within bounds and follows step
    const clampedValue = Math.min(Math.max(newValue, min), max);
    const steppedValue = Math.round(clampedValue / step) * step;
    
    if (!isControlled) {
      setInternalValue(steppedValue);
    }
    
    if (onChange) {
      onChange(steppedValue);
    }
  };
  
  // Handle slider track click
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const trackWidth = rect.width;
    const percentage = clickPosition / trackWidth;
    const newValue = min + percentage * (max - min);
    
    handleChange(newValue);
  };
  
  // Handle touch/drag
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  
  const handleDragStart = () => {
    if (disabled) return;
    isDragging.current = true;
  };
  
  const handleDragEnd = () => {
    isDragging.current = false;
  };
  
  const handleDragMove = (clientX: number) => {
    if (!isDragging.current || !sliderRef.current || disabled) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const position = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, position / rect.width));
    const newValue = min + percentage * (max - min);
    
    handleChange(newValue);
  };
  
  // Set up event listeners for touch/mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0].clientX);
    
    if (isDragging.current) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchend', handleDragEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [value, min, max, step, disabled]);
  
  return (
    <div className={`w-full ${className}`}>
      {/* Label and value display */}
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && <label className="text-sm font-medium">{label}</label>}
          {showValue && <span className="text-sm font-medium">{value}</span>}
        </div>
      )}
      
      {/* Slider track */}
      <div
        ref={sliderRef}
        className={`
          relative h-8 rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={handleTrackClick}
      >
        {/* Filled track */}
        <div
          className="absolute h-full rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Thumb */}
        <div
          className={`
            absolute top-0 h-8 w-8 rounded-full bg-white border-2 border-primary shadow
            transform -translate-x-1/2 -translate-y-0
            ${disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
          `}
          style={{ left: `${percentage}%` }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          tabIndex={disabled ? -1 : 0}
        />
      </div>
    </div>
  );
}; 