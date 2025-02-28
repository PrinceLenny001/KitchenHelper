"use client";

import React from 'react';
import { usePreferences } from '@/lib/context/PreferencesContext';

interface VerticalLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const VerticalLayout: React.FC<VerticalLayoutProps> = ({
  children,
  header,
  footer,
  sidebar,
}) => {
  const { preferences } = usePreferences();
  
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Header */}
      {header && (
        <header className="flex-shrink-0 h-24 border-b border-border">
          {header}
        </header>
      )}
      
      {/* Main content area */}
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar (optional) */}
        {sidebar && (
          <aside className="w-80 border-r border-border overflow-y-auto">
            {sidebar}
          </aside>
        )}
        
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </main>
      
      {/* Footer with navigation */}
      {footer && (
        <footer className="flex-shrink-0 h-24 border-t border-border">
          {footer}
        </footer>
      )}
    </div>
  );
}; 