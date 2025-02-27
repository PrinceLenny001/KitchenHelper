"use client";

import React, { useState, useEffect } from 'react';
import { calendar_v3 } from 'googleapis';
import { 
  getWeekDates, 
  formatDate, 
  nextWeek, 
  prevWeek,
  getEventsForDate,
  sortEventsByTime
} from '@/lib/utils/calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarApi } from '@/hooks/useCalendarApi';
import { TouchButton } from '@/components/ui/TouchButton';
import { isToday, parseISO, format, addHours } from 'date-fns';

interface WeekViewProps {
  initialDate?: Date;
  calendarId?: string;
}

export const WeekView: React.FC<WeekViewProps> = ({
  initialDate = new Date(),
  calendarId = 'primary',
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const { events, isLoading, error, fetchEvents } = useCalendarApi();

  // Calculate the dates to display in the week view
  useEffect(() => {
    const dates = getWeekDates(currentDate);
    setWeekDates(dates);
  }, [currentDate]);

  // Fetch events when the week changes
  useEffect(() => {
    if (weekDates.length > 0) {
      const firstDate = weekDates[0];
      const lastDate = weekDates[weekDates.length - 1];
      fetchEvents(calendarId, firstDate, lastDate);
    }
  }, [weekDates, calendarId, fetchEvents]);

  // Navigate to previous week
  const handlePrevWeek = () => {
    setCurrentDate(prevWeek(currentDate));
  };

  // Navigate to next week
  const handleNextWeek = () => {
    setCurrentDate(nextWeek(currentDate));
  };

  // Navigate to today
  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate hours for the day (5am to 11pm)
  const hours = Array.from({ length: 19 }, (_, i) => i + 5);

  return (
    <div className="flex flex-col h-full">
      {/* Week navigation header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-2xl font-bold">
          {weekDates.length > 0 && (
            <>
              {formatDate(weekDates[0], 'MMM d')} - {formatDate(weekDates[6], 'MMM d, yyyy')}
            </>
          )}
        </h2>
        <div className="flex space-x-2">
          <TouchButton onClick={handleGoToToday} className="px-4 py-2">
            Today
          </TouchButton>
          <TouchButton onClick={handlePrevWeek} aria-label="Previous week">
            <ChevronLeft className="w-6 h-6" />
          </TouchButton>
          <TouchButton onClick={handleNextWeek} aria-label="Next week">
            <ChevronRight className="w-6 h-6" />
          </TouchButton>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-8 border-b">
        {/* Empty cell for time column */}
        <div className="border-r p-2 text-center"></div>
        
        {/* Day headers */}
        {weekDates.map((date, index) => (
          <div 
            key={index} 
            className={`
              p-2 text-center border-r
              ${isToday(date) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
            `}
          >
            <div className="font-semibold">{formatDate(date, 'EEE')}</div>
            <div 
              className={`
                text-lg w-8 h-8 mx-auto flex items-center justify-center rounded-full
                ${isToday(date) ? 'bg-blue-500 text-white' : ''}
              `}
            >
              {formatDate(date, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Week grid with hours */}
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
          <div className="grid grid-cols-8 min-h-full">
            {/* Time column */}
            <div className="border-r">
              {hours.map((hour) => (
                <div key={hour} className="h-20 border-b p-1 text-xs text-right pr-2">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
              ))}
            </div>
            
            {/* Day columns */}
            {weekDates.map((date, dateIndex) => (
              <div key={dateIndex} className="border-r relative">
                {/* Hour cells */}
                {hours.map((hour) => (
                  <div 
                    key={hour} 
                    className={`
                      h-20 border-b
                      ${isToday(date) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                    `}
                  ></div>
                ))}
                
                {/* Events for this day */}
                <EventsForDay 
                  date={date} 
                  events={events} 
                  startHour={5} // First hour in our grid
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface EventsForDayProps {
  date: Date;
  events: calendar_v3.Schema$Event[];
  startHour: number;
}

const EventsForDay: React.FC<EventsForDayProps> = ({ date, events, startHour }) => {
  // Get events for this day
  const dayEvents = getEventsForDate(date, events);
  
  // Filter out all-day events (we'll display those separately)
  const timedEvents = dayEvents.filter(event => event.start?.dateTime);
  
  // Sort events by start time
  const sortedEvents = sortEventsByTime(timedEvents);
  
  return (
    <>
      {sortedEvents.map((event, idx) => {
        if (!event.start?.dateTime || !event.end?.dateTime) return null;
        
        const startTime = parseISO(event.start.dateTime);
        const endTime = parseISO(event.end.dateTime);
        
        // Calculate position and height based on time
        const startHourDecimal = startTime.getHours() + startTime.getMinutes() / 60;
        const endHourDecimal = endTime.getHours() + endTime.getMinutes() / 60;
        
        // Adjust for our grid starting at startHour
        const topPosition = (startHourDecimal - startHour) * 80; // 80px per hour (h-20)
        const height = (endHourDecimal - startHourDecimal) * 80;
        
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
            key={event.id || idx}
            className={`
              absolute left-0 right-0 mx-1 p-1 rounded text-xs overflow-hidden
              border-l-4 shadow-sm
              ${getEventColor()}
            `}
            style={{
              top: `${topPosition}px`,
              height: `${Math.max(height, 20)}px`, // Minimum height of 20px
            }}
            title={event.summary || 'Untitled Event'}
          >
            <div className="font-semibold truncate">
              {event.summary || 'Untitled Event'}
            </div>
            <div className="text-xs opacity-80">
              {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default WeekView; 