"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Clock, Home, Settings, Sun, Users, CheckSquare } from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();
  
  const navigationItems: NavigationItem[] = [
    {
      name: 'Home',
      href: '/',
      icon: <Home size={32} />,
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: <Calendar size={32} />,
    },
    {
      name: 'Chores',
      href: '/chores',
      icon: <CheckSquare size={32} />,
    },
    {
      name: 'Family',
      href: '/family',
      icon: <Users size={32} />,
    },
    {
      name: 'Weather',
      href: '/weather',
      icon: <Sun size={32} />,
    },
    {
      name: 'Clock',
      href: '/clock',
      icon: <Clock size={32} />,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: <Settings size={32} />,
    },
  ];
  
  return (
    <nav className="flex items-center justify-around w-full h-full bg-background">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center h-full w-full min-w-[100px] transition-colors ${
              isActive
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
            }`}
          >
            <div className="flex items-center justify-center w-12 h-12 mb-1">
              {item.icon}
            </div>
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}; 