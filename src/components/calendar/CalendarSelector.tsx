"use client";

import React, { useState, useEffect } from 'react';
import { calendar_v3 } from 'googleapis';
import { useCalendarApi } from '@/hooks/useCalendarApi';
import { TouchButton } from '@/components/ui/TouchButton';
import { Check, X, Search, Settings, ChevronDown, ChevronUp } from 'lucide-react';

interface CalendarSelectorProps {
  onCalendarSelect: (calendarIds: string[]) => void;
  selectedCalendarIds?: string[];
}

export const CalendarSelector: React.FC<CalendarSelectorProps> = ({
  onCalendarSelect,
  selectedCalendarIds = ['primary'],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(selectedCalendarIds);
  const [searchTerm, setSearchTerm] = useState('');
  const { calendars, isLoading, error, fetchCalendars } = useCalendarApi();
  const [filteredCalendars, setFilteredCalendars] = useState<calendar_v3.Schema$CalendarListEntry[]>([]);

  // Fetch calendars on component mount
  useEffect(() => {
    fetchCalendars();
  }, [fetchCalendars]);

  // Filter calendars based on search term
  useEffect(() => {
    if (!calendars) return;
    
    if (!searchTerm.trim()) {
      setFilteredCalendars(calendars);
      return;
    }

    const filtered = calendars.filter(calendar => 
      calendar.summary?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredCalendars(filtered);
  }, [calendars, searchTerm]);

  // Toggle calendar selection
  const toggleCalendar = (calendarId: string) => {
    const newSelected = selected.includes(calendarId)
      ? selected.filter(id => id !== calendarId)
      : [...selected, calendarId];
    
    setSelected(newSelected);
    onCalendarSelect(newSelected);
  };

  // Get calendar name for display
  const getCalendarName = (calendarId: string) => {
    if (calendarId === 'primary') return 'Primary Calendar';
    
    const calendar = calendars.find(cal => cal.id === calendarId);
    return calendar?.summary || calendarId;
  };

  // Get calendar color
  const getCalendarColor = (calendarId: string) => {
    const calendar = calendars.find(cal => cal.id === calendarId);
    return calendar?.backgroundColor || '#4285F4'; // Default Google blue
  };

  return (
    <div className="relative">
      {/* Toggle button */}
      <TouchButton
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-md bg-white dark:bg-gray-800 shadow-sm"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>Calendars</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </TouchButton>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-72 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
          <div className="p-3 border-b">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search calendars..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-2">
            {isLoading ? (
              <div className="text-center py-4">
                <p>Loading calendars...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-500">Error: {error}</p>
              </div>
            ) : filteredCalendars.length === 0 ? (
              <div className="text-center py-4">
                <p>No calendars found</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {/* Always show primary calendar first */}
                <li className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <TouchButton
                    onClick={() => toggleCalendar('primary')}
                    className="flex items-center w-full"
                  >
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: getCalendarColor('primary') }}
                    />
                    <span className="flex-grow text-left">Primary Calendar</span>
                    <div className="w-5 h-5 flex items-center justify-center">
                      {selected.includes('primary') && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </TouchButton>
                </li>
                
                {/* Other calendars */}
                {filteredCalendars
                  .filter(calendar => calendar.id !== 'primary')
                  .map(calendar => (
                    <li 
                      key={calendar.id} 
                      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <TouchButton
                        onClick={() => toggleCalendar(calendar.id || '')}
                        className="flex items-center w-full"
                        disabled={!calendar.id}
                      >
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: calendar.backgroundColor || '#4285F4' }}
                        />
                        <span className="flex-grow text-left">{calendar.summary}</span>
                        <div className="w-5 h-5 flex items-center justify-center">
                          {calendar.id && selected.includes(calendar.id) && (
                            <Check className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </TouchButton>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div className="border-t p-2 flex justify-between">
            <TouchButton
              onClick={() => {
                setSelected(['primary']);
                onCalendarSelect(['primary']);
              }}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Reset
            </TouchButton>
            <TouchButton
              onClick={() => setIsOpen(false)}
              className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
            >
              Done
            </TouchButton>
          </div>
        </div>
      )}

      {/* Selected calendars display */}
      <div className="mt-2 flex flex-wrap gap-2">
        {selected.map(calendarId => (
          <div 
            key={calendarId}
            className="flex items-center px-2 py-1 rounded-full text-sm"
            style={{ 
              backgroundColor: `${getCalendarColor(calendarId)}20`, // 20% opacity
              color: getCalendarColor(calendarId),
              border: `1px solid ${getCalendarColor(calendarId)}`
            }}
          >
            <div 
              className="w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: getCalendarColor(calendarId) }}
            />
            <span>{getCalendarName(calendarId)}</span>
            <TouchButton
              onClick={() => toggleCalendar(calendarId)}
              className="ml-1 p-0.5 rounded-full hover:bg-white/20"
              aria-label={`Remove ${getCalendarName(calendarId)}`}
            >
              <X className="w-3 h-3" />
            </TouchButton>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarSelector; 