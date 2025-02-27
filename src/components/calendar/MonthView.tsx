"use client";

import React, { useState, useEffect } from 'react';
import { calendar_v3 } from 'googleapis';
import { 
  getMonthDates, 
  isCurrentMonth, 
  formatDate, 
  nextMonth, 
  prevMonth,
  getEventsForDate,
  sortEventsByTime,
  hasEvents
} from '@/lib/utils/calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarApi } from '@/hooks/useCalendarApi';
import { TouchButton } from '@/components/ui/TouchButton';
import { isToday } from 'date-fns';

interface MonthViewProps {
  initialDate?: Date;
  calendarId?: string;
}

export const MonthView: React.FC<MonthViewProps> = ({
  initialDate = new Date(),
  calendarId = 'primary',
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [monthDates, setMonthDates] = useState<Date[]>([]);
  const { events, isLoading, error, fetchEvents } = useCalendarApi();

  // Calculate the dates to display in the month grid
  useEffect(() => {
    const dates = getMonthDates(currentDate);
    setMonthDates(dates);
  }, [currentDate]);

  // Fetch events when the month changes
  useEffect(() => {
    const firstDate = monthDates[0];
    const lastDate = monthDates[monthDates.length - 1];
    
    if (firstDate && lastDate) {
      fetchEvents(calendarId, firstDate, lastDate);
    }
  }, [monthDates, calendarId, fetchEvents]);

  // Navigate to previous month
  const handlePrevMonth = () => {
    setCurrentDate(prevMonth(currentDate));
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setCurrentDate(nextMonth(currentDate));
  };

  // Navigate to today
  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Month navigation header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-2xl font-bold">
          {formatDate(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <TouchButton onClick={handleGoToToday} className="px-4 py-2">
            Today
          </TouchButton>
          <TouchButton onClick={handlePrevMonth} aria-label="Previous month">
            <ChevronLeft className="w-6 h-6" />
          </TouchButton>
          <TouchButton onClick={handleNextMonth} aria-label="Next month">
            <ChevronRight className="w-6 h-6" />
          </TouchButton>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center py-2 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="font-semibold">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-grow">
        {isLoading ? (
          <div className="col-span-7 flex items-center justify-center">
            <p>Loading calendar...</p>
          </div>
        ) : error ? (
          <div className="col-span-7 flex items-center justify-center">
            <p className="text-red-500">Error: {error}</p>
          </div>
        ) : (
          monthDates.map((date, index) => (
            <DayCell 
              key={index} 
              date={date} 
              currentMonth={currentDate}
              events={events}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface DayCellProps {
  date: Date;
  currentMonth: Date;
  events: calendar_v3.Schema$Event[];
}

const DayCell: React.FC<DayCellProps> = ({ date, currentMonth, events }) => {
  const isCurrentMonthDate = isCurrentMonth(date, currentMonth);
  const isTodayDate = isToday(date);
  const dateEvents = getEventsForDate(date, events);
  const sortedEvents = sortEventsByTime(dateEvents);
  
  // Limit the number of events to display
  const displayEvents = sortedEvents.slice(0, 3);
  const hasMoreEvents = sortedEvents.length > 3;

  return (
    <div 
      className={`
        min-h-[100px] p-2 border border-gray-200 
        ${isCurrentMonthDate ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-500'}
        ${isTodayDate ? 'ring-2 ring-blue-500' : ''}
      `}
    >
      <div className="flex justify-between items-start">
        <span 
          className={`
            text-lg font-medium w-8 h-8 flex items-center justify-center rounded-full
            ${isTodayDate ? 'bg-blue-500 text-white' : ''}
          `}
        >
          {formatDate(date, 'd')}
        </span>
        {hasEvents(date, events) && !isTodayDate && (
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        )}
      </div>
      
      <div className="mt-1 space-y-1 overflow-hidden">
        {displayEvents.map((event, idx) => (
          <EventItem key={event.id || idx} event={event} />
        ))}
        
        {hasMoreEvents && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            +{sortedEvents.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};

interface EventItemProps {
  event: calendar_v3.Schema$Event;
}

const EventItem: React.FC<EventItemProps> = ({ event }) => {
  // Determine if it's an all-day event
  const isAllDay = Boolean(event.start?.date);
  
  // Get event time for display
  const getEventTime = () => {
    if (isAllDay) return 'All day';
    if (event.start?.dateTime) {
      return formatDate(new Date(event.start.dateTime), 'h:mm a');
    }
    return '';
  };
  
  // Get color based on colorId or default
  const getEventColor = () => {
    const colorMap: Record<string, string> = {
      '1': 'bg-blue-200 text-blue-800',
      '2': 'bg-green-200 text-green-800',
      '3': 'bg-purple-200 text-purple-800',
      '4': 'bg-red-200 text-red-800',
      '5': 'bg-yellow-200 text-yellow-800',
      '6': 'bg-orange-200 text-orange-800',
      '7': 'bg-teal-200 text-teal-800',
      '8': 'bg-pink-200 text-pink-800',
      '9': 'bg-indigo-200 text-indigo-800',
      '10': 'bg-gray-200 text-gray-800',
      '11': 'bg-amber-200 text-amber-800',
    };
    
    return colorMap[event.colorId || '1'] || 'bg-blue-200 text-blue-800';
  };

  return (
    <div 
      className={`
        px-2 py-1 rounded text-xs truncate
        ${getEventColor()}
      `}
      title={event.summary || 'Untitled Event'}
    >
      {!isAllDay && <span className="mr-1">{getEventTime()}</span>}
      {event.summary || 'Untitled Event'}
    </div>
  );
};

export default MonthView; 