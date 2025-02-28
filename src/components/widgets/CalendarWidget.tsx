"use client";

import { useState, useEffect } from 'react';
import { WidgetComponentProps } from '@/lib/types/dashboard';
import { CalendarIcon, XIcon } from 'lucide-react';
import { fetchWithErrorHandling } from '@/lib/utils/fetch';

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
}

export function CalendarWidget({ widget, isEditing }: WidgetComponentProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await fetchWithErrorHandling('/api/calendar/events?days=3');
        
        if (!data || !Array.isArray(data.events)) {
          throw new Error('Invalid response format');
        }
        
        setEvents(data.events || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    
    if (!isEditing) {
      fetchEvents();
    } else {
      // Show placeholder data in edit mode
      setEvents([
        { 
          id: '1', 
          title: 'Doctor Appointment', 
          start: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), 
          end: new Date(new Date().setHours(11, 0, 0, 0)).toISOString() 
        },
        { 
          id: '2', 
          title: 'School Pickup', 
          start: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(), 
          end: new Date(new Date().setHours(15, 30, 0, 0)).toISOString() 
        },
        { 
          id: '3', 
          title: 'Family Dinner', 
          start: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(), 
          end: new Date(new Date().setHours(19, 0, 0, 0)).toISOString() 
        },
      ]);
      setLoading(false);
    }
  }, [isEditing]);
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  const groupEventsByDay = () => {
    const grouped: Record<string, Event[]> = {};
    
    events.forEach(event => {
      const day = new Date(event.start).toDateString();
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(event);
    });
    
    return Object.entries(grouped).map(([day, events]) => ({
      day,
      date: new Date(day),
      events: events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    }));
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <XIcon className="text-red-500 mb-2" />
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }
  
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <CalendarIcon className="text-blue-500 mb-2" />
        <p className="text-sm text-gray-500">No upcoming events</p>
      </div>
    );
  }
  
  const groupedEvents = groupEventsByDay();
  
  return (
    <div className="h-full overflow-auto">
      {groupedEvents.map(({ day, date, events }) => (
        <div key={day} className="mb-4">
          <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            {formatDate(date.toISOString())}
          </h4>
          <ul className="space-y-2">
            {events.map((event) => (
              <li key={event.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium">{event.title}</span>
                  <span className="text-xs text-gray-500">
                    {event.allDay ? 'All day' : formatTime(event.start)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
} 