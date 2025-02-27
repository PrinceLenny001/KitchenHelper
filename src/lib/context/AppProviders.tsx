"use client";

import React from 'react';
import { FamilyMemberProvider } from './FamilyMemberContext';
import { CalendarProvider } from './CalendarContext';
import { PreferencesProvider } from './PreferencesContext';
import { TextScaleProvider } from '@/components/accessibility/TextScaler';
import CalendarSelectionProvider from './CalendarSelectionContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <TextScaleProvider>
      <PreferencesProvider>
        <FamilyMemberProvider>
          <CalendarSelectionProvider>
            <CalendarProvider>
              {children}
            </CalendarProvider>
          </CalendarSelectionProvider>
        </FamilyMemberProvider>
      </PreferencesProvider>
    </TextScaleProvider>
  );
}; 