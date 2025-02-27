import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, addWeeks, subWeeks, addDays, isToday, isSameMonth, isSameDay } from 'date-fns';

/**
 * Format a date with the specified format string
 */
export const formatDate = (date: Date, formatStr: string = 'PPP'): string => {
  return format(date, formatStr);
};

/**
 * Get an array of dates for a month view calendar
 */
export const getMonthDates = (date: Date): Date[] => {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  
  return eachDayOfInterval({ start, end });
};

/**
 * Get an array of dates for a week view calendar
 */
export const getWeekDates = (date: Date): Date[] => {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  
  return eachDayOfInterval({ start, end });
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
  return addDays(date, -1);
};

/**
 * Check if a date is today
 */
export const isDateToday = (date: Date): boolean => {
  return isToday(date);
};

/**
 * Check if a date is in the current month
 */
export const isDateInMonth = (date: Date, currentMonth: Date): boolean => {
  return isSameMonth(date, currentMonth);
};

/**
 * Check if two dates are the same day
 */
export const isSameDate = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};

/**
 * Generate a random color
 */
export const generateRandomColor = (): string => {
  const colors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // yellow
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format time from 24h to 12h format
 */
export const formatTime = (hours: number, minutes: number): string => {
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  
  return `${formattedHours}:${formattedMinutes} ${period}`;
};

/**
 * Convert temperature from Celsius to Fahrenheit
 */
export const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

/**
 * Convert temperature from Fahrenheit to Celsius
 */
export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return (fahrenheit - 32) * 5/9;
}; 