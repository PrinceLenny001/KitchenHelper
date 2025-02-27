"use client";

import { useState, useEffect } from 'react';
import { WidgetComponentProps } from '@/lib/types/dashboard';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'chore' | 'routine' | 'event';
}

export function CalendarWidget({ widget, isEditing }: WidgetComponentProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get settings from widget or use defaults
  const settings = widget.settings || {};
  const showChores = settings.showChores !== false;
  const showRoutines = settings.showRoutines !== false;
  const showEvents = settings.showEvents !== false;
  
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        
        // This would be replaced with actual API calls to fetch events
        // For now, we'll use mock data
        const mockEvents: CalendarEvent[] = [
          {
            id: '1',
            title: 'Clean Kitchen',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
            type: 'chore',
          },
          {
            id: '2',
            title: 'Morning Routine',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
            type: 'routine',
          },
          {
            id: '3',
            title: 'Family Dinner',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20),
            type: 'event',
          },
        ];
        
        // Filter events based on settings
        const filteredEvents = mockEvents.filter(event => {
          if (event.type === 'chore' && !showChores) return false;
          if (event.type === 'routine' && !showRoutines) return false;
          if (event.type === 'event' && !showEvents) return false;
          return true;
        });
        
        setEvents(filteredEvents);
        setError(null);
      } catch (err) {
        setError('Failed to load calendar events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, [currentDate, showChores, showRoutines, showEvents]);
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 text-center text-gray-400"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = events.filter(event => 
        event.date.getDate() === day &&
        event.date.getMonth() === currentDate.getMonth() &&
        event.date.getFullYear() === currentDate.getFullYear()
      );
      
      const isToday = new Date().toDateString() === date.toDateString();
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`h-8 text-center relative ${isToday ? 'bg-blue-100 dark:bg-blue-900/30 rounded-full' : ''}`}
        >
          <span className={`inline-block w-6 h-6 leading-6 ${isToday ? 'font-bold' : ''}`}>
            {day}
          </span>
          {dayEvents.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center">
              {dayEvents.map((event, index) => (
                <div 
                  key={event.id}
                  className={`w-1.5 h-1.5 rounded-full mx-0.5 ${
                    event.type === 'chore' ? 'bg-green-500' : 
                    event.type === 'routine' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}
                  title={event.title}
                ></div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return days;
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
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-red-500 mb-2">{error}</p>
        <Button size="sm" onClick={() => setError(null)}>Retry</Button>
      </div>
    );
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return (
    <div className="h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={handlePrevMonth}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-medium">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button 
          onClick={handleNextMonth}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-xs mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-xs">
        {renderCalendar()}
      </div>
      
      {!isEditing && (
        <div className="mt-2 text-xs">
          <div className="flex items-center justify-center space-x-4">
            {showChores && (
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                <span>Chores</span>
              </div>
            )}
            {showRoutines && (
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                <span>Routines</span>
              </div>
            )}
            {showEvents && (
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-1"></div>
                <span>Events</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 