"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CalendarSelectionContextType {
  selectedCalendarIds: string[];
  setSelectedCalendarIds: (ids: string[]) => void;
  toggleCalendar: (id: string) => void;
  isCalendarSelected: (id: string) => boolean;
}

const CalendarSelectionContext = createContext<CalendarSelectionContextType | undefined>(undefined);

export const useCalendarSelection = (): CalendarSelectionContextType => {
  const context = useContext(CalendarSelectionContext);
  if (!context) {
    throw new Error('useCalendarSelection must be used within a CalendarSelectionProvider');
  }
  return context;
};

interface CalendarSelectionProviderProps {
  children: React.ReactNode;
  defaultSelectedCalendarIds?: string[];
}

export const CalendarSelectionProvider: React.FC<CalendarSelectionProviderProps> = ({
  children,
  defaultSelectedCalendarIds = ['primary'],
}) => {
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>(defaultSelectedCalendarIds);

  // Load saved calendar selection from localStorage on mount
  useEffect(() => {
    const savedSelection = localStorage.getItem('selectedCalendarIds');
    if (savedSelection) {
      try {
        const parsed = JSON.parse(savedSelection);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedCalendarIds(parsed);
        }
      } catch (error) {
        console.error('Error parsing saved calendar selection:', error);
      }
    }
  }, []);

  // Save selection to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selectedCalendarIds', JSON.stringify(selectedCalendarIds));
  }, [selectedCalendarIds]);

  // Toggle a calendar's selection status
  const toggleCalendar = (id: string) => {
    setSelectedCalendarIds(prev => 
      prev.includes(id)
        ? prev.filter(calendarId => calendarId !== id)
        : [...prev, id]
    );
  };

  // Check if a calendar is selected
  const isCalendarSelected = (id: string) => {
    return selectedCalendarIds.includes(id);
  };

  return (
    <CalendarSelectionContext.Provider
      value={{
        selectedCalendarIds,
        setSelectedCalendarIds,
        toggleCalendar,
        isCalendarSelected,
      }}
    >
      {children}
    </CalendarSelectionContext.Provider>
  );
};

export default CalendarSelectionProvider; 