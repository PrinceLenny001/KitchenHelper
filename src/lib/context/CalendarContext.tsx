"use client";

import React, { createContext, useContext, useState } from 'react';
import { nextMonth, prevMonth, nextWeek, prevWeek, nextDay, prevDay } from '@/lib/utils/shared';

// Define the view types
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

// Define the context type
interface CalendarContextType {
  currentDate: Date;
  view: CalendarView;
  setCurrentDate: (date: Date) => void;
  setView: (view: CalendarView) => void;
  goToNextPeriod: () => void;
  goToPrevPeriod: () => void;
  goToToday: () => void;
}

// Create the context with a default value
const CalendarContext = createContext<CalendarContextType>({
  currentDate: new Date(),
  view: 'month',
  setCurrentDate: () => {},
  setView: () => {},
  goToNextPeriod: () => {},
  goToPrevPeriod: () => {},
  goToToday: () => {},
});

// Custom hook to use the calendar context
export const useCalendar = () => useContext(CalendarContext);

// Provider component
export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('month');

  // Navigate to the next period based on the current view
  const goToNextPeriod = () => {
    if (view === 'month') {
      setCurrentDate(nextMonth(currentDate));
    } else if (view === 'week') {
      setCurrentDate(nextWeek(currentDate));
    } else if (view === 'day') {
      setCurrentDate(nextDay(currentDate));
    }
  };

  // Navigate to the previous period based on the current view
  const goToPrevPeriod = () => {
    if (view === 'month') {
      setCurrentDate(prevMonth(currentDate));
    } else if (view === 'week') {
      setCurrentDate(prevWeek(currentDate));
    } else if (view === 'day') {
      setCurrentDate(prevDay(currentDate));
    }
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <CalendarContext.Provider
      value={{
        currentDate,
        view,
        setCurrentDate,
        setView,
        goToNextPeriod,
        goToPrevPeriod,
        goToToday,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}; 