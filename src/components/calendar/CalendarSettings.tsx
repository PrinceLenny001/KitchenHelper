"use client";

import React, { useState, useEffect } from 'react';
import { calendar_v3 } from 'googleapis';
import { useCalendarApi } from '@/hooks/useCalendarApi';
import { TouchButton } from '@/components/ui/TouchButton';
import { Settings, X, Edit2, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import CalendarColorPicker from './CalendarColorPicker';

interface CalendarSettingsProps {
  onClose?: () => void;
}

export const CalendarSettings: React.FC<CalendarSettingsProps> = ({
  onClose,
}) => {
  const [selectedCalendar, setSelectedCalendar] = useState<string>('primary');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [calendarColors, setCalendarColors] = useState<Record<string, string>>({});
  const { calendars, isLoading, error, fetchCalendars } = useCalendarApi();

  // Fetch calendars on component mount
  useEffect(() => {
    fetchCalendars();
  }, [fetchCalendars]);

  // Initialize calendar colors from localStorage
  useEffect(() => {
    const savedColors = localStorage.getItem('calendarColors');
    if (savedColors) {
      try {
        setCalendarColors(JSON.parse(savedColors));
      } catch (error) {
        console.error('Error parsing saved calendar colors:', error);
      }
    }
  }, []);

  // Save calendar colors to localStorage when they change
  useEffect(() => {
    if (Object.keys(calendarColors).length > 0) {
      localStorage.setItem('calendarColors', JSON.stringify(calendarColors));
    }
  }, [calendarColors]);

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setCalendarColors(prev => ({
      ...prev,
      [selectedCalendar]: color
    }));
    setShowColorPicker(false);
  };

  // Get calendar color (from our custom colors or from Google's default)
  const getCalendarColor = (calendarId: string) => {
    if (calendarColors[calendarId]) {
      return calendarColors[calendarId];
    }
    
    const calendar = calendars.find(cal => cal.id === calendarId);
    return calendar?.backgroundColor || '#4285F4'; // Default Google blue
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-md w-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Calendar Settings
        </h2>
        {onClose && (
          <TouchButton
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </TouchButton>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-medium mb-3">Calendar Colors</h3>
        
        {isLoading ? (
          <div className="text-center py-4">
            <p>Loading calendars...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-500">Error: {error}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Primary calendar */}
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: getCalendarColor('primary') }}
                />
                <span>Primary Calendar</span>
              </div>
              <TouchButton
                onClick={() => {
                  setSelectedCalendar('primary');
                  setShowColorPicker(true);
                }}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Edit primary calendar color"
              >
                <Edit2 className="w-4 h-4" />
              </TouchButton>
            </div>
            
            {/* Other calendars */}
            {calendars
              .filter(calendar => calendar.id !== 'primary')
              .map(calendar => (
                <div 
                  key={calendar.id} 
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: getCalendarColor(calendar.id || '') }}
                    />
                    <span>{calendar.summary}</span>
                  </div>
                  <TouchButton
                    onClick={() => {
                      if (calendar.id) {
                        setSelectedCalendar(calendar.id);
                        setShowColorPicker(true);
                      }
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label={`Edit ${calendar.summary} color`}
                    disabled={!calendar.id}
                  >
                    <Edit2 className="w-4 h-4" />
                  </TouchButton>
                </div>
              ))}
          </div>
        )}
        
        {/* Color picker modal */}
        {showColorPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="max-w-md w-full">
              <CalendarColorPicker
                initialColor={getCalendarColor(selectedCalendar)}
                onColorSelect={handleColorSelect}
                onClose={() => setShowColorPicker(false)}
              />
            </div>
          </div>
        )}
        
        {/* Default calendars section */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Default Settings</h3>
          
          <div className="space-y-3">
            <div className="p-3 border rounded-md">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Show weekends</span>
                <input 
                  type="checkbox" 
                  defaultChecked={true}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
            </div>
            
            <div className="p-3 border rounded-md">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Show declined events</span>
                <input 
                  type="checkbox" 
                  defaultChecked={false}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
            </div>
            
            <div className="p-3 border rounded-md">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Start week on Monday</span>
                <input 
                  type="checkbox" 
                  defaultChecked={false}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
            </div>
          </div>
        </div>
        
        {/* Calendar sharing section */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Calendar Sharing</h3>
          
          <TouchButton
            className="flex items-center justify-center w-full p-3 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Manage Sharing Settings
          </TouchButton>
        </div>
      </div>
    </div>
  );
};

export default CalendarSettings; 