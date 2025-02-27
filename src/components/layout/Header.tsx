"use client";

import React from 'react';
import { formatDate } from '@/lib/utils/shared';
import { useFamilyMember } from '@/lib/context/FamilyMemberContext';
import { useCalendar } from '@/lib/context/CalendarContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { FamilyMemberSelector } from '@/components/family/FamilyMemberSelector';
import { TouchButton } from '@/components/ui/TouchButton';

export const Header: React.FC = () => {
  const { currentDate, view, goToNextPeriod, goToPrevPeriod, goToToday } = useCalendar();
  
  // Format the current date based on the view
  const getFormattedDate = () => {
    if (view === 'month') {
      return formatDate(currentDate, 'MMMM yyyy');
    } else if (view === 'week') {
      return formatDate(currentDate, "'Week of' MMM d, yyyy");
    } else if (view === 'day') {
      return formatDate(currentDate, 'EEEE, MMMM d, yyyy');
    } else {
      return formatDate(currentDate, 'MMMM yyyy');
    }
  };
  
  return (
    <div className="flex items-center justify-between w-full h-full px-6">
      {/* Left: Date navigation */}
      <div className="flex items-center space-x-4">
        <TouchButton 
          onClick={goToPrevPeriod}
          className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft size={28} />
        </TouchButton>
        
        <h1 className="text-2xl font-semibold">{getFormattedDate()}</h1>
        
        <TouchButton 
          onClick={goToNextPeriod}
          className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Next"
        >
          <ChevronRight size={28} />
        </TouchButton>
        
        <TouchButton 
          onClick={goToToday}
          className="ml-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Today
        </TouchButton>
      </div>
      
      {/* Right: Family member selection and time */}
      <div className="flex items-center space-x-4">
        <FamilyMemberSelector />
        
        <div className="text-xl font-medium">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}; 