"use client";

import React, { useState } from 'react';
import { TextScaleControls } from './TextScaler';
import { HighContrastToggle } from './HighContrastToggle';
import { TouchButton } from '@/components/ui/TouchButton';
import { Accessibility, ChevronDown, ChevronUp } from 'lucide-react';

export const AccessibilityControls: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Toggle the accessibility panel
  const togglePanel = () => {
    setIsOpen((prev) => !prev);
  };
  
  return (
    <div className="fixed bottom-28 right-4 z-50">
      {/* Accessibility button */}
      <TouchButton
        variant="primary"
        size="lg"
        onClick={togglePanel}
        icon={isOpen ? <ChevronDown size={24} /> : <Accessibility size={24} />}
        aria-label={isOpen ? 'Close accessibility controls' : 'Open accessibility controls'}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
      >
        {isOpen ? 'Close' : 'Accessibility'}
      </TouchButton>
      
      {/* Accessibility panel */}
      {isOpen && (
        <div
          id="accessibility-panel"
          className="absolute bottom-full right-0 mb-2 w-80 p-4 bg-background border border-border rounded-lg shadow-lg"
          role="region"
          aria-label="Accessibility controls"
        >
          <h2 className="text-lg font-semibold mb-4">Accessibility Options</h2>
          
          <div className="space-y-4">
            {/* Text scaling controls */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Text Size</label>
              <TextScaleControls />
            </div>
            
            {/* High contrast toggle */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Display</label>
              <HighContrastToggle />
            </div>
            
            {/* Keyboard navigation info */}
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-sm font-medium mb-2">Keyboard Shortcuts</h3>
              <ul className="text-sm space-y-1">
                <li><kbd className="px-2 py-1 bg-muted rounded">Tab</kbd> - Navigate between elements</li>
                <li><kbd className="px-2 py-1 bg-muted rounded">Enter</kbd> or <kbd className="px-2 py-1 bg-muted rounded">Space</kbd> - Activate buttons</li>
                <li><kbd className="px-2 py-1 bg-muted rounded">Esc</kbd> - Close dialogs</li>
                <li><kbd className="px-2 py-1 bg-muted rounded">Arrow Keys</kbd> - Navigate calendars</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 