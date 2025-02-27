"use client";

import React, { useState, useEffect } from 'react';
import { calendar_v3 } from 'googleapis';
import { 
  formatDate,
  sortEventsByTime
} from '@/lib/utils/calendar';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { useCalendarApi } from '@/hooks/useCalendarApi';
import { TouchButton } from '@/components/ui/TouchButton';
import { isToday, parseISO, format, addDays, isSameDay, startOfDay, addWeeks } from 'date-fns';

interface AgendaViewProps {
  initialDate?: Date;
  calendarId?: string;
  daysToShow?: number;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  initialDate = new Date(),
  calendarId = 'primary',
  daysToShow = 14, // Show 2 weeks by default
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredEvents, setFilteredEvents] = useState<calendar_v3.Schema$Event[]>([]);
  const { events, isLoading, error, fetchEvents } = useCalendarApi();

  // Fetch events when the date range changes
  useEffect(() => {
    const endDate = addDays(currentDate, daysToShow);
    fetchEvents(calendarId, currentDate, endDate);
  }, [currentDate, calendarId, daysToShow, fetchEvents]);

  // Filter events based on search term
  useEffect(() => {
    if (!events) {
      setFilteredEvents([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredEvents(events);
      return;
    }

    const filtered = events.filter(event => {
      const summary = event.summary?.toLowerCase() || '';
      const description = event.description?.toLowerCase() || '';
      const location = event.location?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();

      return (
        summary.includes(term) ||
        description.includes(term) ||
        location.includes(term)
      );
    });

    setFilteredEvents(filtered);
  }, [events, searchTerm]);

  // Navigate to previous period
  const handlePrevPeriod = () => {
    setCurrentDate(prev => addDays(prev, -daysToShow));
  };

  // Navigate to next period
  const handleNextPeriod = () => {
    setCurrentDate(prev => addDays(prev, daysToShow));
  };

  // Navigate to today
  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  // Group events by day
  const groupEventsByDay = (events: calendar_v3.Schema$Event[]): Record<string, calendar_v3.Schema$Event[]> => {
    const grouped: Record<string, calendar_v3.Schema$Event[]> = {};

    events.forEach(event => {
      let dateKey: string;

      if (event.start?.date) {
        // All-day event
        dateKey = event.start.date;
      } else if (event.start?.dateTime) {
        // Timed event
        const date = parseISO(event.start.dateTime);
        dateKey = format(date, 'yyyy-MM-dd');
      } else {
        return; // Skip events without start date/time
      }

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(event);
    });

    // Sort events within each day
    Object.keys(grouped).forEach(date => {
      grouped[date] = sortEventsByTime(grouped[date]);
    });

    return grouped;
  };

  const groupedEvents = groupEventsByDay(filteredEvents);
  const sortedDates = Object.keys(groupedEvents).sort();

  return (
    <div className="flex flex-col h-full">
      {/* Header with navigation and search */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            Agenda
          </h2>
          <div className="flex space-x-2">
            <TouchButton onClick={handleGoToToday} className="px-4 py-2">
              Today
            </TouchButton>
            <TouchButton onClick={handlePrevPeriod} aria-label="Previous period">
              <ChevronLeft className="w-6 h-6" />
            </TouchButton>
            <TouchButton onClick={handleNextPeriod} aria-label="Next period">
              <ChevronRight className="w-6 h-6" />
            </TouchButton>
          </div>
        </div>
        
        {/* Search input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search events..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Events list */}
      <div className="flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading events...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500">Error: {error}</p>
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-xl">No events found</p>
            {searchTerm && (
              <p className="mt-2">Try adjusting your search</p>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {sortedDates.map(dateKey => (
              <DayEvents 
                key={dateKey} 
                dateString={dateKey} 
                events={groupedEvents[dateKey]} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface DayEventsProps {
  dateString: string;
  events: calendar_v3.Schema$Event[];
}

const DayEvents: React.FC<DayEventsProps> = ({ dateString, events }) => {
  const date = parseISO(dateString);
  const isCurrentDay = isToday(date);
  
  return (
    <div className={`p-4 ${isCurrentDay ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
      <h3 className="font-bold text-lg mb-2 flex items-center">
        <span className={`
          ${isCurrentDay ? 'text-blue-600 dark:text-blue-400' : ''}
        `}>
          {formatDate(date, 'EEEE, MMMM d')}
        </span>
        {isCurrentDay && (
          <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-0.5 rounded-full">
            Today
          </span>
        )}
      </h3>
      
      <div className="space-y-3">
        {events.map((event, idx) => (
          <AgendaEventItem key={event.id || idx} event={event} />
        ))}
      </div>
    </div>
  );
};

interface AgendaEventItemProps {
  event: calendar_v3.Schema$Event;
}

const AgendaEventItem: React.FC<AgendaEventItemProps> = ({ event }) => {
  // Determine if it's an all-day event
  const isAllDay = Boolean(event.start?.date);
  
  // Get event time for display
  const getEventTime = () => {
    if (isAllDay) return 'All day';
    
    if (event.start?.dateTime && event.end?.dateTime) {
      const startTime = parseISO(event.start.dateTime);
      const endTime = parseISO(event.end.dateTime);
      return `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
    }
    
    return '';
  };
  
  // Get color based on colorId or default
  const getEventColor = () => {
    const colorMap: Record<string, string> = {
      '1': 'border-blue-500',
      '2': 'border-green-500',
      '3': 'border-purple-500',
      '4': 'border-red-500',
      '5': 'border-yellow-500',
      '6': 'border-orange-500',
      '7': 'border-teal-500',
      '8': 'border-pink-500',
      '9': 'border-indigo-500',
      '10': 'border-gray-500',
      '11': 'border-amber-500',
    };
    
    return colorMap[event.colorId || '1'] || 'border-blue-500';
  };

  return (
    <div 
      className={`
        p-3 rounded-md border-l-4 shadow-sm bg-white dark:bg-gray-800
        ${getEventColor()}
      `}
    >
      <div className="font-semibold text-lg">
        {event.summary || 'Untitled Event'}
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
        {getEventTime()}
      </div>
      
      {event.location && (
        <div className="text-sm mt-2 text-gray-600 dark:text-gray-300">
          📍 {event.location}
        </div>
      )}
      
      {event.description && (
        <div className="text-sm mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">
          {event.description}
        </div>
      )}
    </div>
  );
};

export default AgendaView; 