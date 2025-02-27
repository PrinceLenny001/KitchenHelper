"use client";

import React, { useState, useEffect } from 'react';
import { TouchButton } from '@/components/ui/TouchButton';
import { Check, X } from 'lucide-react';

interface CalendarColorPickerProps {
  initialColor?: string;
  onColorSelect: (color: string) => void;
  onClose?: () => void;
}

export const CalendarColorPicker: React.FC<CalendarColorPickerProps> = ({
  initialColor = '#4285F4', // Default Google blue
  onColorSelect,
  onClose,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);
  
  // Predefined color palette (Google Calendar-like colors)
  const colorPalette = [
    '#4285F4', // Blue
    '#0B8043', // Green
    '#8E24AA', // Purple
    '#D50000', // Red
    '#F4511E', // Orange
    '#F6BF26', // Yellow
    '#33B679', // Teal
    '#E67C73', // Pink
    '#039BE5', // Light Blue
    '#616161', // Gray
    '#3F51B5', // Indigo
    '#7986CB', // Lavender
    '#795548', // Brown
    '#A79B8E', // Taupe
    '#009688', // Mint
  ];

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onColorSelect(color);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Choose a color</h3>
        {onClose && (
          <TouchButton
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close color picker"
          >
            <X className="w-5 h-5" />
          </TouchButton>
        )}
      </div>
      
      <div className="grid grid-cols-5 gap-3">
        {colorPalette.map((color) => (
          <TouchButton
            key={color}
            onClick={() => handleColorSelect(color)}
            className="w-10 h-10 rounded-full flex items-center justify-center border-2"
            style={{ 
              backgroundColor: color,
              borderColor: selectedColor === color ? 'white' : color,
            }}
            aria-label={`Select color ${color}`}
            aria-pressed={selectedColor === color}
          >
            {selectedColor === color && (
              <Check className="w-5 h-5 text-white" />
            )}
          </TouchButton>
        ))}
      </div>
      
      {/* Custom color input */}
      <div className="mt-4">
        <label htmlFor="custom-color" className="block text-sm font-medium mb-1">
          Custom color
        </label>
        <div className="flex items-center">
          <input
            type="color"
            id="custom-color"
            value={selectedColor}
            onChange={(e) => handleColorSelect(e.target.value)}
            className="w-10 h-10 p-0 border-0 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={selectedColor}
            onChange={(e) => handleColorSelect(e.target.value)}
            className="ml-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
            placeholder="#RRGGBB"
          />
        </div>
      </div>
      
      {/* Preview */}
      <div className="mt-4">
        <p className="text-sm font-medium mb-1">Preview</p>
        <div 
          className="h-10 rounded-md border border-gray-200 dark:border-gray-700"
          style={{ backgroundColor: selectedColor }}
        />
      </div>
      
      {/* Color theme presets */}
      <div className="mt-4">
        <p className="text-sm font-medium mb-1">Theme presets</p>
        <div className="flex space-x-2">
          <TouchButton
            onClick={() => handleColorSelect('#4285F4')}
            className="px-3 py-1 text-sm rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            Default
          </TouchButton>
          <TouchButton
            onClick={() => handleColorSelect('#0B8043')}
            className="px-3 py-1 text-sm rounded-md bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            Nature
          </TouchButton>
          <TouchButton
            onClick={() => handleColorSelect('#8E24AA')}
            className="px-3 py-1 text-sm rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
          >
            Creative
          </TouchButton>
          <TouchButton
            onClick={() => handleColorSelect('#D50000')}
            className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          >
            Urgent
          </TouchButton>
        </div>
      </div>
    </div>
  );
};

export default CalendarColorPicker; 