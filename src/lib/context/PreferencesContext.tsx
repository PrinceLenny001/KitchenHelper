"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the preferences type
export interface UserPreferences {
  theme: 'light' | 'dark';
  defaultView: 'month' | 'week' | 'day' | 'agenda';
  startOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  showWeekends: boolean;
  defaultFamilyMemberId?: string;
  weatherUnit: 'fahrenheit' | 'celsius';
  screensaverTimeout: number; // seconds until screensaver activates
}

// Define the context type
interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => void;
  isLoading: boolean;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'light',
  defaultView: 'month',
  startOfWeek: 0,
  showWeekends: true,
  weatherUnit: 'fahrenheit',
  screensaverTimeout: 300,
};

// Create the context with a default value
const PreferencesContext = createContext<PreferencesContextType>({
  preferences: defaultPreferences,
  updatePreferences: () => {},
  isLoading: true,
});

// Custom hook to use the preferences context
export const usePreferences = () => useContext(PreferencesContext);

// Provider component
export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch preferences on component mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        // In a real implementation, this would be an API call
        // For now, we'll just simulate it
        // const response = await fetch('/api/preferences');
        // const data = await response.json();
        
        // Simulate loading
        setTimeout(() => {
          // Use default preferences for now
          setPreferences(defaultPreferences);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching preferences:', error);
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  // Update preferences
  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      
      // In a real implementation, this would be an API call
      // await fetch('/api/preferences', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedPreferences),
      // });
      
      // Update local state
      setPreferences(updatedPreferences);
      
      // Save to localStorage for persistence
      localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        isLoading,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}; 