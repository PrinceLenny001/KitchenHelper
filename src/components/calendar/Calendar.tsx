"use client";

import React, { useState, useEffect } from 'react';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import AgendaView from './AgendaView';
import CalendarSelector from './CalendarSelector';
import CalendarSettings from './CalendarSettings';
import CalendarPermissions from './CalendarPermissions';
import { EventColorCoding } from './EventColorCoding';
import { TouchButton } from '@/components/ui/TouchButton';
import { Calendar as CalendarIcon, Clock, List, Grid, Plus, Settings, Share2, Palette } from 'lucide-react';
import { useCalendarSelection } from '@/lib/context/CalendarSelectionContext';
import { useCalendarApi } from '@/hooks/useCalendarApi';

export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda';

interface CalendarProps {
  initialView?: CalendarViewType;
  initialDate?: Date;
}

export const Calendar: React.FC<CalendarProps> = ({
  initialView = 'month',
  initialDate = new Date(),
}) => {
  const [currentView, setCurrentView] = useState<CalendarViewType>(initialView);
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showPermissions, setShowPermissions] = useState<boolean>(false);
  const [showColorCoding, setShowColorCoding] = useState<boolean>(false);
  const { selectedCalendarIds, setSelectedCalendarIds } = useCalendarSelection();
  const { fetchEvents, events, calendars, fetchCalendars } = useCalendarApi();
  
  // Fetch calendars on component mount
  useEffect(() => {
    fetchCalendars();
  }, [fetchCalendars]);
  
  // Fetch events from all selected calendars
  useEffect(() => {
    const fetchAllSelectedCalendars = async () => {
      // Calculate date range based on current view
      let timeMin = new Date();
      let timeMax = new Date();
      
      switch (currentView) {
        case 'month':
          // For month view, fetch 6 weeks (to cover the entire grid)
          timeMin = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
          timeMax = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);
          break;
        case 'week':
          // For week view, fetch 2 weeks
          const weekStart = new Date(currentDate);
          weekStart.setDate(currentDate.getDate() - currentDate.getDay());
          timeMin = new Date(weekStart);
          timeMax = new Date(weekStart);
          timeMax.setDate(timeMax.getDate() + 14);
          break;
        case 'day':
          // For day view, fetch 3 days
          timeMin = new Date(currentDate);
          timeMin.setHours(0, 0, 0, 0);
          timeMax = new Date(currentDate);
          timeMax.setDate(timeMax.getDate() + 2);
          timeMax.setHours(23, 59, 59, 999);
          break;
        case 'agenda':
          // For agenda view, fetch 30 days
          timeMin = new Date(currentDate);
          timeMax = new Date(currentDate);
          timeMax.setDate(timeMax.getDate() + 30);
          break;
      }
      
      // Fetch events for each selected calendar
      if (selectedCalendarIds.length > 0) {
        // For simplicity, we'll just use the first selected calendar for now
        // In a more advanced implementation, we would fetch from all calendars and merge the results
        await fetchEvents(selectedCalendarIds[0], timeMin, timeMax);
      }
    };
    
    fetchAllSelectedCalendars();
  }, [currentDate, currentView, selectedCalendarIds, fetchEvents]);

  // Handle calendar selection
  const handleCalendarSelect = (calendarIds: string[]) => {
    setSelectedCalendarIds(calendarIds);
  };

  // Get the name of the currently selected calendar
  const getSelectedCalendarName = () => {
    if (selectedCalendarIds.length === 0) return 'No calendar selected';
    
    const calendarId = selectedCalendarIds[0];
    if (calendarId === 'primary') return 'Primary Calendar';
    
    const calendar = calendars.find(cal => cal.id === calendarId);
    return calendar?.summary || calendarId;
  };

  // Render the appropriate view component
  const renderView = () => {
    // Pass the first selected calendar as the calendarId
    // In a more advanced implementation, we would handle multiple calendars in each view
    const calendarId = selectedCalendarIds[0] || 'primary';
    
    switch (currentView) {
      case 'month':
        return <MonthView initialDate={currentDate} calendarId={calendarId} />;
      case 'week':
        return <WeekView initialDate={currentDate} calendarId={calendarId} />;
      case 'day':
        return <DayView initialDate={currentDate} calendarId={calendarId} />;
      case 'agenda':
        return <AgendaView initialDate={currentDate} calendarId={calendarId} />;
      default:
        return <MonthView initialDate={currentDate} calendarId={calendarId} />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* View selector and calendar selector */}
      <div className="flex justify-between items-center p-2 border-b">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <ViewButton
            active={currentView === 'month'}
            onClick={() => setCurrentView('month')}
            icon={<Grid className="w-5 h-5" />}
            label="Month"
          />
          <ViewButton
            active={currentView === 'week'}
            onClick={() => setCurrentView('week')}
            icon={<CalendarIcon className="w-5 h-5" />}
            label="Week"
          />
          <ViewButton
            active={currentView === 'day'}
            onClick={() => setCurrentView('day')}
            icon={<Clock className="w-5 h-5" />}
            label="Day"
          />
          <ViewButton
            active={currentView === 'agenda'}
            onClick={() => setCurrentView('agenda')}
            icon={<List className="w-5 h-5" />}
            label="Agenda"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <TouchButton
            onClick={() => setShowColorCoding(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Color coding"
          >
            <Palette className="w-5 h-5" />
          </TouchButton>
          
          <TouchButton
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Calendar settings"
          >
            <Settings className="w-5 h-5" />
          </TouchButton>
          
          <TouchButton
            onClick={() => setShowPermissions(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Calendar sharing"
          >
            <Share2 className="w-5 h-5" />
          </TouchButton>
          
          <CalendarSelector 
            onCalendarSelect={handleCalendarSelect}
            selectedCalendarIds={selectedCalendarIds}
          />
        </div>
      </div>

      {/* Calendar view */}
      <div className="flex-grow overflow-hidden">
        {renderView()}
      </div>
      
      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <CalendarSettings onClose={() => setShowSettings(false)} />
        </div>
      )}
      
      {/* Permissions modal */}
      {showPermissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <CalendarPermissions 
            calendarId={selectedCalendarIds[0] || 'primary'} 
            calendarName={getSelectedCalendarName()}
            onClose={() => setShowPermissions(false)} 
          />
        </div>
      )}
      
      {/* Color coding modal */}
      {showColorCoding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <EventColorCoding onClose={() => setShowColorCoding(false)} />
        </div>
      )}
    </div>
  );
};

interface ViewButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const ViewButton: React.FC<ViewButtonProps> = ({ active, onClick, icon, label }) => {
  return (
    <TouchButton
      onClick={onClick}
      className={`
        flex items-center px-4 py-2 rounded-md transition-colors
        ${active 
          ? 'bg-white dark:bg-gray-700 shadow-sm' 
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }
      `}
      aria-pressed={active}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </TouchButton>
  );
};

export default Calendar; 