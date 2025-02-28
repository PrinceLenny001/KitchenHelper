"use client";

import React from 'react';
import { formatDate } from '@/lib/utils/shared';
import { useFamilyMember } from '@/lib/context/FamilyMemberContext';
import { useCalendar } from '@/lib/context/CalendarContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { FamilyMemberSelector } from '@/components/family/FamilyMemberSelector';
import { TouchButton } from '@/components/ui/TouchButton';

export function Header() {
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
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4 px-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Kitchen Helper</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            JD
          </div>
        </div>
      </div>
    </header>
  );
} 