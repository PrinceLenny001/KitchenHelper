import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isToday,
  parseISO,
} from 'date-fns';
import { calendar_v3 } from 'googleapis';

/**
 * Get an array of dates for a month view calendar
 * This includes days from the previous and next months to fill the grid
 */
export const getMonthDates = (date: Date): Date[] => {
  const firstDayOfMonth = startOfMonth(date);
  const lastDayOfMonth = endOfMonth(date);
  const startDate = startOfWeek(firstDayOfMonth);
  const endDate = endOfWeek(lastDayOfMonth);
  
  return eachDayOfInterval({ start: startDate, end: endDate });
};

/**
 * Get an array of dates for a week view calendar
 */
export const getWeekDates = (date: Date): Date[] => {
  const startDate = startOfWeek(date);
  const endDate = endOfWeek(date);
  
  return eachDayOfInterval({ start: startDate, end: endDate });
};

/**
 * Check if a date is in the current month
 */
export const isCurrentMonth = (date: Date, currentMonth: Date): boolean => {
  return isSameMonth(date, currentMonth);
};

/**
 * Format a date for display
 */
export const formatDate = (date: Date, formatString: string): string => {
  return format(date, formatString);
};

/**
 * Navigate to the next month
 */
export const nextMonth = (date: Date): Date => {
  return addMonths(date, 1);
};

/**
 * Navigate to the previous month
 */
export const prevMonth = (date: Date): Date => {
  return subMonths(date, 1);
};

/**
 * Navigate to the next week
 */
export const nextWeek = (date: Date): Date => {
  return addWeeks(date, 1);
};

/**
 * Navigate to the previous week
 */
export const prevWeek = (date: Date): Date => {
  return subWeeks(date, 1);
};

/**
 * Navigate to the next day
 */
export const nextDay = (date: Date): Date => {
  return addDays(date, 1);
};

/**
 * Navigate to the previous day
 */
export const prevDay = (date: Date): Date => {
  return subDays(date, 1);
};

/**
 * Check if a date has events
 */
export const hasEvents = (
  date: Date, 
  events: calendar_v3.Schema$Event[]
): boolean => {
  return events.some(event => {
    // Handle all-day events (date only)
    if (event.start?.date) {
      const eventDate = parseISO(event.start.date);
      return isSameDay(date, eventDate);
    }
    
    // Handle timed events (dateTime)
    if (event.start?.dateTime) {
      const eventDateTime = parseISO(event.start.dateTime);
      return isSameDay(date, eventDateTime);
    }
    
    return false;
  });
};

/**
 * Get events for a specific date
 */
export const getEventsForDate = (
  date: Date, 
  events: calendar_v3.Schema$Event[]
): calendar_v3.Schema$Event[] => {
  return events.filter(event => {
    // Handle all-day events (date only)
    if (event.start?.date) {
      const eventDate = parseISO(event.start.date);
      return isSameDay(date, eventDate);
    }
    
    // Handle timed events (dateTime)
    if (event.start?.dateTime) {
      const eventDateTime = parseISO(event.start.dateTime);
      return isSameDay(date, eventDateTime);
    }
    
    return false;
  });
};

/**
 * Sort events by start time
 */
export const sortEventsByTime = (
  events: calendar_v3.Schema$Event[]
): calendar_v3.Schema$Event[] => {
  return [...events].sort((a, b) => {
    const aTime = a.start?.dateTime || a.start?.date || '';
    const bTime = b.start?.dateTime || b.start?.date || '';
    return aTime.localeCompare(bTime);
  });
}; 