"use client";

import React, { useState } from 'react';
import { VerticalLayout } from '@/components/layout/VerticalLayout';
import { Header } from '@/components/layout/Header';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { WidgetType } from '@/lib/types/dashboard';

// Mock widget data
const mockWidgets = [
  {
    id: '1',
    type: 'calendar' as WidgetType,
    title: 'Upcoming Events',
    width: 2,
    height: 2,
    x: 0,
    y: 0,
    settings: {},
  },
  {
    id: '2',
    type: 'chores' as WidgetType,
    title: 'Today\'s Chores',
    width: 2,
    height: 2,
    x: 2,
    y: 0,
    settings: {},
  },
  {
    id: '3',
    type: 'family' as WidgetType,
    title: 'Family Members',
    width: 2,
    height: 1,
    x: 0,
    y: 2,
    settings: {},
  },
  {
    id: '4',
    type: 'notes' as WidgetType,
    title: 'Notes',
    width: 2,
    height: 1,
    x: 2,
    y: 2,
    settings: {},
  },
];

export default function DashboardPage() {
  const [widgets, setWidgets] = useState(mockWidgets);
  
  return (
    <VerticalLayout
      header={<Header />}
      footer={<BottomNavigation />}
    >
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-4 gap-4">
          {widgets.map((widget) => (
            <div 
              key={widget.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
              style={{
                gridColumn: `span ${widget.width}`,
                gridRow: `span ${widget.height}`,
              }}
            >
              <h2 className="text-xl font-semibold mb-2">{widget.title}</h2>
              <div className="h-full">
                {widget.type === 'calendar' && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="font-medium">Doctor Appointment</p>
                    <p className="text-sm text-gray-500">Today, 10:00 AM</p>
                    <p className="font-medium mt-2">School Pickup</p>
                    <p className="text-sm text-gray-500">Today, 3:00 PM</p>
                  </div>
                )}
                
                {widget.type === 'chores' && (
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="flex items-center mb-2">
                      <input type="checkbox" className="mr-2" />
                      <span>Take out trash</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <input type="checkbox" className="mr-2" />
                      <span>Do laundry</span>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Clean kitchen</span>
                    </div>
                  </div>
                )}
                
                {widget.type === 'family' && (
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full mr-2"></div>
                      <span>John Doe</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-pink-500 rounded-full mr-2"></div>
                      <span>Jane Doe</span>
                    </div>
                  </div>
                )}
                
                {widget.type === 'notes' && (
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <p>Remember to buy groceries for dinner!</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </VerticalLayout>
  );
} 