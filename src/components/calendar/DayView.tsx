"use client";

import React, { useState, useEffect } from 'react';
import { calendar_v3 } from 'googleapis';
import { 
  formatDate, 
  nextDay, 
  prevDay,
  getEventsForDate,
  sortEventsByTime
} from '@/lib/utils/calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarApi } from '@/hooks/useCalendarApi';
import { TouchButton } from '@/components/ui/TouchButton';
import { isToday, parseISO, format, addDays } from 'date-fns';

interface DayViewProps {
  initialDate?: Date;
  calendarId?: string;
}

export const DayView: React.FC<DayViewProps> = ({
  initialDate = new Date(),
  calendarId = 'primary',
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const { events, isLoading, error, fetchEvents } = useCalendarApi();

  // Fetch events when the day changes
  useEffect(() => {
    // Fetch events for a 24-hour period
    const endDate = addDays(currentDate, 1);
    fetchEvents(calendarId, currentDate, endDate);
  }, [currentDate, calendarId, fetchEvents]);

  // Navigate to previous day
  const handlePrevDay = () => {
    setCurrentDate(prevDay(currentDate));
  };

  // Navigate to next day
  const handleNextDay = () => {
    setCurrentDate(nextDay(currentDate));
  };

  // Navigate to today
  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate hours for the day (5am to 11pm)
  const hours = Array.from({ length: 19 }, (_, i) => i + 5);

  // Get all-day events
  const allDayEvents = events.filter(event => 
    event.start?.date && 
    parseISO(event.start.date).toDateString() === currentDate.toDateString()
  );

  // Get timed events for the current day
  const dayEvents = getEventsForDate(currentDate, events);
  const timedEvents = dayEvents.filter(event => event.start?.dateTime);
  const sortedTimedEvents = sortEventsByTime(timedEvents);

  return (
    <div className="flex flex-col h-full">
      {/* Day navigation header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-2xl font-bold">
          {formatDate(currentDate, 'EEEE, MMMM d, yyyy')}
          {isToday(currentDate) && (
            <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded-full">
              Today
            </span>
          )}
        </h2>
        <div className="flex space-x-2">
          <TouchButton onClick={handleGoToToday} className="px-4 py-2">
            Today
          </TouchButton>
          <TouchButton onClick={handlePrevDay} aria-label="Previous day">
            <ChevronLeft className="w-6 h-6" />
          </TouchButton>
          <TouchButton onClick={handleNextDay} aria-label="Next day">
            <ChevronRight className="w-6 h-6" />
          </TouchButton>
        </div>
      </div>

      {/* All-day events section */}
      {allDayEvents.length > 0 && (
        <div className="border-b p-2">
          <h3 className="font-semibold mb-2">All-day Events</h3>
          <div className="space-y-1">
            {allDayEvents.map((event, idx) => (
              <AllDayEventItem key={event.id || idx} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Day timeline */}
      <div className="flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading calendar...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500">Error: {error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-h-full relative">
            {/* Time column */}
            <div>
              {hours.map((hour) => (
                <div key={hour} className="h-24 border-b flex">
                  <div className="w-16 p-1 text-xs text-right pr-2 border-r">
                    {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </div>
                  <div className="flex-grow"></div>
                </div>
              ))}
            </div>
            
            {/* Events */}
            <div className="absolute top-0 left-16 right-0 bottom-0">
              {sortedTimedEvents.map((event, idx) => (
                <TimedEventItem 
                  key={event.id || idx} 
                  event={event} 
                  startHour={5} // First hour in our grid
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface AllDayEventItemProps {
  event: calendar_v3.Schema$Event;
}

const AllDayEventItem: React.FC<AllDayEventItemProps> = ({ event }) => {
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
        px-3 py-2 rounded text-sm
        ${getEventColor()}
      `}
      title={event.summary || 'Untitled Event'}
    >
      {event.summary || 'Untitled Event'}
    </div>
  );
};

interface TimedEventItemProps {
  event: calendar_v3.Schema$Event;
  startHour: number;
}

const TimedEventItem: React.FC<TimedEventItemProps> = ({ event, startHour }) => {
  if (!event.start?.dateTime || !event.end?.dateTime) return null;
  
  const startTime = parseISO(event.start.dateTime);
  const endTime = parseISO(event.end.dateTime);
  
  // Calculate position and height based on time
  const startHourDecimal = startTime.getHours() + startTime.getMinutes() / 60;
  const endHourDecimal = endTime.getHours() + endTime.getMinutes() / 60;
  
  // Adjust for our grid starting at startHour
  const topPosition = (startHourDecimal - startHour) * 96; // 96px per hour (h-24)
  const height = (endHourDecimal - startHourDecimal) * 96;
  
  // Get color based on colorId or default
  const getEventColor = () => {
    const colorMap: Record<string, string> = {
      '1': 'bg-blue-200 text-blue-800 border-blue-300',
      '2': 'bg-green-200 text-green-800 border-green-300',
      '3': 'bg-purple-200 text-purple-800 border-purple-300',
      '4': 'bg-red-200 text-red-800 border-red-300',
      '5': 'bg-yellow-200 text-yellow-800 border-yellow-300',
      '6': 'bg-orange-200 text-orange-800 border-orange-300',
      '7': 'bg-teal-200 text-teal-800 border-teal-300',
      '8': 'bg-pink-200 text-pink-800 border-pink-300',
      '9': 'bg-indigo-200 text-indigo-800 border-indigo-300',
      '10': 'bg-gray-200 text-gray-800 border-gray-300',
      '11': 'bg-amber-200 text-amber-800 border-amber-300',
    };
    
    return colorMap[event.colorId || '1'] || 'bg-blue-200 text-blue-800 border-blue-300';
  };
  
  return (
    <div
      className={`
        absolute left-2 right-2 p-2 rounded text-sm overflow-hidden
        border-l-4 shadow-sm
        ${getEventColor()}
      `}
      style={{
        top: `${topPosition}px`,
        height: `${Math.max(height, 24)}px`, // Minimum height of 24px
      }}
      title={event.summary || 'Untitled Event'}
    >
      <div className="font-semibold">
        {event.summary || 'Untitled Event'}
      </div>
      <div className="text-xs opacity-80">
        {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
      </div>
      {event.location && (
        <div className="text-xs mt-1 opacity-80">
          📍 {event.location}
        </div>
      )}
    </div>
  );
};

export default DayView; 