"use client";

import React, { useState, useEffect } from 'react';
import { TouchButton } from '@/components/ui/TouchButton';
import { Eye } from 'lucide-react';

export const HighContrastToggle: React.FC = () => {
  const [highContrast, setHighContrast] = useState(false);
  
  // Load saved preference from localStorage on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('highContrast');
    if (savedPreference === 'true') {
      setHighContrast(true);
    }
  }, []);
  
  // Update document class and save to localStorage when preference changes
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Save to localStorage
    localStorage.setItem('highContrast', highContrast.toString());
  }, [highContrast]);
  
  // Toggle high contrast mode
  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };
  
  return (
    <TouchButton
      variant={highContrast ? 'primary' : 'outline'}
      size="sm"
      onClick={toggleHighContrast}
      icon={<Eye size={20} />}
      aria-label={highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
    >
      {highContrast ? 'High Contrast: On' : 'High Contrast: Off'}
    </TouchButton>
  );
}; 