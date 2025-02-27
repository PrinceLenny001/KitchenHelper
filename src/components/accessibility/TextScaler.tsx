"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TouchButton } from '@/components/ui/TouchButton';
import { Minus, Plus, RotateCcw } from 'lucide-react';

// Define the text scale levels
type TextScaleLevel = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Define the context type
interface TextScaleContextType {
  textScale: TextScaleLevel;
  increaseTextScale: () => void;
  decreaseTextScale: () => void;
  resetTextScale: () => void;
}

// Create the context with a default value
const TextScaleContext = createContext<TextScaleContextType>({
  textScale: 'md',
  increaseTextScale: () => {},
  decreaseTextScale: () => {},
  resetTextScale: () => {},
});

// Custom hook to use the text scale context
export const useTextScale = () => useContext(TextScaleContext);

// Provider component
export const TextScaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textScale, setTextScale] = useState<TextScaleLevel>('md');
  
  // Load saved text scale from localStorage on mount
  useEffect(() => {
    const savedTextScale = localStorage.getItem('textScale') as TextScaleLevel | null;
    if (savedTextScale) {
      setTextScale(savedTextScale);
    }
  }, []);
  
  // Update document class and save to localStorage when text scale changes
  useEffect(() => {
    // Remove all text scale classes
    document.documentElement.classList.remove(
      'text-scale-xs',
      'text-scale-sm',
      'text-scale-md',
      'text-scale-lg',
      'text-scale-xl'
    );
    
    // Add the current text scale class
    document.documentElement.classList.add(`text-scale-${textScale}`);
    
    // Save to localStorage
    localStorage.setItem('textScale', textScale);
  }, [textScale]);
  
  // Scale levels in order
  const scaleLevels: TextScaleLevel[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  
  // Increase text scale
  const increaseTextScale = () => {
    setTextScale((current) => {
      const currentIndex = scaleLevels.indexOf(current);
      return currentIndex < scaleLevels.length - 1 ? scaleLevels[currentIndex + 1] : current;
    });
  };
  
  // Decrease text scale
  const decreaseTextScale = () => {
    setTextScale((current) => {
      const currentIndex = scaleLevels.indexOf(current);
      return currentIndex > 0 ? scaleLevels[currentIndex - 1] : current;
    });
  };
  
  // Reset text scale to default
  const resetTextScale = () => {
    setTextScale('md');
  };
  
  return (
    <TextScaleContext.Provider
      value={{
        textScale,
        increaseTextScale,
        decreaseTextScale,
        resetTextScale,
      }}
    >
      {children}
    </TextScaleContext.Provider>
  );
};

// Text scale control component
export const TextScaleControls: React.FC = () => {
  const { textScale, increaseTextScale, decreaseTextScale, resetTextScale } = useTextScale();
  
  return (
    <div className="flex items-center space-x-2">
      <TouchButton
        variant="outline"
        size="sm"
        onClick={decreaseTextScale}
        icon={<Minus size={20} />}
        aria-label="Decrease text size"
      />
      
      <div className="px-2 min-w-[80px] text-center">
        <span className="font-medium">Text: </span>
        <span>{textScale.toUpperCase()}</span>
      </div>
      
      <TouchButton
        variant="outline"
        size="sm"
        onClick={increaseTextScale}
        icon={<Plus size={20} />}
        aria-label="Increase text size"
      />
      
      <TouchButton
        variant="outline"
        size="sm"
        onClick={resetTextScale}
        icon={<RotateCcw size={20} />}
        aria-label="Reset text size"
      />
    </div>
  );
}; 