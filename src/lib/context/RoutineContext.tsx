"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRoutinesApi, Routine, RoutineCompletion, RoutineStep } from '@/hooks/useRoutinesApi';
import { useFamilyMember } from '@/lib/context/FamilyMemberContext';
import { RecurrencePattern } from '@/hooks/useChoresApi';

// Define the context type
interface RoutineContextType {
  routines: Routine[];
  completions: RoutineCompletion[];
  isLoading: boolean;
  error: string | null;
  fetchRoutines: (active?: boolean) => Promise<Routine[]>;
  createRoutine: (
    name: string,
    recurrencePattern: RecurrencePattern,
    startDate: string,
    steps: RoutineStep[],
    description?: string,
    customRecurrence?: string,
    endDate?: string,
    estimatedMinutes?: number,
    isActive?: boolean
  ) => Promise<Routine | null>;
  updateRoutine: (
    id: string,
    name: string,
    recurrencePattern: RecurrencePattern,
    startDate: string,
    steps: RoutineStep[],
    description?: string,
    customRecurrence?: string,
    endDate?: string,
    estimatedMinutes?: number,
    isActive?: boolean
  ) => Promise<Routine | null>;
  deleteRoutine: (id: string) => Promise<boolean>;
  fetchCompletions: (
    routineId?: string,
    familyMemberId?: string,
    startDate?: string,
    endDate?: string
  ) => Promise<RoutineCompletion[]>;
  createCompletion: (
    routineId: string,
    familyMemberId: string,
    completedAt?: string,
    notes?: string
  ) => Promise<RoutineCompletion | null>;
  deleteCompletion: (id: string) => Promise<boolean>;
  getRoutineById: (id: string) => Routine | undefined;
  getCompletionById: (id: string) => RoutineCompletion | undefined;
  getActiveRoutines: () => Routine[];
  getCompletedRoutines: (startDate?: string, endDate?: string) => Routine[];
}

// Create the context with a default value
const RoutineContext = createContext<RoutineContextType>({
  routines: [],
  completions: [],
  isLoading: false,
  error: null,
  fetchRoutines: async () => [],
  createRoutine: async () => null,
  updateRoutine: async () => null,
  deleteRoutine: async () => false,
  fetchCompletions: async () => [],
  createCompletion: async () => null,
  deleteCompletion: async () => false,
  getRoutineById: () => undefined,
  getCompletionById: () => undefined,
  getActiveRoutines: () => [],
  getCompletedRoutines: () => [],
});

// Custom hook to use the routine context
export const useRoutine = () => useContext(RoutineContext);

// Provider component
export const RoutineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    routines,
    completions,
    isLoading,
    error,
    fetchRoutines: apiFetchRoutines,
    createRoutine: apiCreateRoutine,
    updateRoutine: apiUpdateRoutine,
    deleteRoutine: apiDeleteRoutine,
    fetchCompletions: apiFetchCompletions,
    createCompletion: apiCreateCompletion,
    deleteCompletion: apiDeleteCompletion,
  } = useRoutinesApi();
  
  const { currentFamilyMember } = useFamilyMember();
  
  // Fetch routines on component mount
  useEffect(() => {
    const loadRoutines = async () => {
      await apiFetchRoutines();
    };
    
    loadRoutines();
  }, [apiFetchRoutines]);
  
  // Create a new routine
  const createRoutine = async (
    name: string,
    recurrencePattern: RecurrencePattern,
    startDate: string,
    steps: RoutineStep[],
    description?: string,
    customRecurrence?: string,
    endDate?: string,
    estimatedMinutes?: number,
    isActive?: boolean
  ) => {
    return apiCreateRoutine({
      name,
      recurrencePattern,
      startDate,
      steps,
      description,
      customRecurrence,
      endDate,
      estimatedMinutes,
      isActive,
    });
  };
  
  // Update a routine
  const updateRoutine = async (
    id: string,
    name: string,
    recurrencePattern: RecurrencePattern,
    startDate: string,
    steps: RoutineStep[],
    description?: string,
    customRecurrence?: string,
    endDate?: string,
    estimatedMinutes?: number,
    isActive?: boolean
  ) => {
    return apiUpdateRoutine(id, {
      name,
      recurrencePattern,
      startDate,
      steps,
      description,
      customRecurrence,
      endDate,
      estimatedMinutes,
      isActive,
    });
  };
  
  // Create a completion
  const createCompletion = async (
    routineId: string,
    familyMemberId: string,
    completedAt?: string,
    notes?: string
  ) => {
    return apiCreateCompletion({
      routineId,
      familyMemberId,
      completedAt,
      notes,
    });
  };
  
  // Helper functions
  const getRoutineById = (id: string) => {
    return routines.find(routine => routine.id === id);
  };
  
  const getCompletionById = (id: string) => {
    return completions.find(completion => completion.id === id);
  };
  
  const getActiveRoutines = () => {
    return routines.filter(routine => routine.isActive);
  };
  
  const getCompletedRoutines = (startDate?: string, endDate?: string) => {
    // Get unique routine IDs from completions within the date range
    const completedRoutineIds = new Set(
      completions
        .filter(completion => {
          if (!startDate && !endDate) return true;
          
          const completedAt = new Date(completion.completedAt);
          
          if (startDate && !endDate) {
            return completedAt >= new Date(startDate);
          }
          
          if (!startDate && endDate) {
            return completedAt <= new Date(endDate);
          }
          
          return completedAt >= new Date(startDate!) && completedAt <= new Date(endDate!);
        })
        .map(completion => completion.routineId)
    );
    
    // Return routines that have completions
    return routines.filter(routine => completedRoutineIds.has(routine.id));
  };
  
  return (
    <RoutineContext.Provider
      value={{
        routines,
        completions,
        isLoading,
        error,
        fetchRoutines: apiFetchRoutines,
        createRoutine,
        updateRoutine,
        deleteRoutine: apiDeleteRoutine,
        fetchCompletions: apiFetchCompletions,
        createCompletion,
        deleteCompletion: apiDeleteCompletion,
        getRoutineById,
        getCompletionById,
        getActiveRoutines,
        getCompletedRoutines,
      }}
    >
      {children}
    </RoutineContext.Provider>
  );
}; 