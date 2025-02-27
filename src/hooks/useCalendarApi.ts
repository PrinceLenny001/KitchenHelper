"use client";

import { useState } from 'react';
import { toast } from 'react-toastify';
import { calendar_v3 } from 'googleapis';

interface CalendarEvent extends Omit<calendar_v3.Schema$Event, 'id'> {
  id?: string;
  calendarId?: string;
}

interface UseCalendarApiReturn {
  calendars: calendar_v3.Schema$CalendarListEntry[];
  events: calendar_v3.Schema$Event[];
  isLoading: boolean;
  error: string | null;
  fetchCalendars: () => Promise<void>;
  fetchEvents: (calendarId?: string, timeMin?: Date, timeMax?: Date) => Promise<void>;
  createEvent: (event: CalendarEvent) => Promise<calendar_v3.Schema$Event | null>;
  updateEvent: (eventId: string, event: CalendarEvent) => Promise<calendar_v3.Schema$Event | null>;
  deleteEvent: (eventId: string, calendarId?: string) => Promise<boolean>;
}

export function useCalendarApi(): UseCalendarApiReturn {
  const [calendars, setCalendars] = useState<calendar_v3.Schema$CalendarListEntry[]>([]);
  const [events, setEvents] = useState<calendar_v3.Schema$Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's calendars
  const fetchCalendars = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/calendar?type=calendars');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch calendars');
      }
      
      const data = await response.json();
      setCalendars(data.calendars);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error fetching calendars: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch events from a calendar
  const fetchEvents = async (
    calendarId: string = 'primary',
    timeMin?: Date,
    timeMax?: Date
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      let url = `/api/calendar?calendarId=${encodeURIComponent(calendarId)}`;
      
      if (timeMin) {
        url += `&timeMin=${encodeURIComponent(timeMin.toISOString())}`;
      }
      
      if (timeMax) {
        url += `&timeMax=${encodeURIComponent(timeMax.toISOString())}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch events');
      }
      
      const data = await response.json();
      setEvents(data.events);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error fetching events: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new event
  const createEvent = async (event: CalendarEvent): Promise<calendar_v3.Schema$Event | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }
      
      const data = await response.json();
      
      // Update local events state
      setEvents(prev => [...prev, data.event]);
      
      toast.success('Event created successfully');
      return data.event;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error creating event: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing event
  const updateEvent = async (
    eventId: string,
    event: CalendarEvent
  ): Promise<calendar_v3.Schema$Event | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/calendar/events?eventId=${encodeURIComponent(eventId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update event');
      }
      
      const data = await response.json();
      
      // Update local events state
      setEvents(prev => 
        prev.map(e => (e.id === eventId ? data.event : e))
      );
      
      toast.success('Event updated successfully');
      return data.event;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error updating event: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an event
  const deleteEvent = async (
    eventId: string,
    calendarId: string = 'primary'
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/calendar/events?eventId=${encodeURIComponent(eventId)}&calendarId=${encodeURIComponent(calendarId)}`,
        {
          method: 'DELETE',
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }
      
      // Update local events state
      setEvents(prev => prev.filter(e => e.id !== eventId));
      
      toast.success('Event deleted successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error deleting event: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    calendars,
    events,
    isLoading,
    error,
    fetchCalendars,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
} 