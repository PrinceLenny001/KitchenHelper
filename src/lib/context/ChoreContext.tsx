"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useChoresApi, Chore, ChoreCompletion, RecurrencePattern, Priority } from '@/hooks/useChoresApi';
import { useFamilyMember } from '@/lib/context/FamilyMemberContext';

// Define the context type
interface ChoreContextType {
  chores: Chore[];
  completions: ChoreCompletion[];
  isLoading: boolean;
  error: string | null;
  fetchChores: (active?: boolean, familyMemberId?: string) => Promise<Chore[]>;
  createChore: (
    name: string,
    recurrencePattern: RecurrencePattern,
    startDate: string,
    familyMemberIds: string[],
    description?: string,
    customRecurrence?: string,
    endDate?: string,
    priority?: Priority,
    estimatedMinutes?: number,
    isActive?: boolean
  ) => Promise<Chore | null>;
  updateChore: (
    id: string,
    name: string,
    recurrencePattern: RecurrencePattern,
    startDate: string,
    familyMemberIds: string[],
    description?: string,
    customRecurrence?: string,
    endDate?: string,
    priority?: Priority,
    estimatedMinutes?: number,
    isActive?: boolean
  ) => Promise<Chore | null>;
  deleteChore: (id: string) => Promise<boolean>;
  fetchCompletions: (
    choreId?: string,
    familyMemberId?: string,
    startDate?: string,
    endDate?: string
  ) => Promise<ChoreCompletion[]>;
  createCompletion: (
    choreId: string,
    familyMemberId: string,
    completedAt?: string,
    notes?: string
  ) => Promise<ChoreCompletion | null>;
  deleteCompletion: (id: string) => Promise<boolean>;
  getChoreById: (id: string) => Chore | undefined;
  getCompletionById: (id: string) => ChoreCompletion | undefined;
  getChoresByFamilyMember: (familyMemberId: string) => Chore[];
  getCompletionsByFamilyMember: (familyMemberId: string) => ChoreCompletion[];
  getActiveChores: () => Chore[];
  getCompletedChores: (startDate?: string, endDate?: string) => Chore[];
}

// Create the context with a default value
const ChoreContext = createContext<ChoreContextType>({
  chores: [],
  completions: [],
  isLoading: false,
  error: null,
  fetchChores: async () => [],
  createChore: async () => null,
  updateChore: async () => null,
  deleteChore: async () => false,
  fetchCompletions: async () => [],
  createCompletion: async () => null,
  deleteCompletion: async () => false,
  getChoreById: () => undefined,
  getCompletionById: () => undefined,
  getChoresByFamilyMember: () => [],
  getCompletionsByFamilyMember: () => [],
  getActiveChores: () => [],
  getCompletedChores: () => [],
});

// Custom hook to use the chore context
export const useChore = () => useContext(ChoreContext);

// Provider component
export const ChoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    chores,
    completions,
    isLoading,
    error,
    fetchChores: apiFetchChores,
    createChore: apiCreateChore,
    updateChore: apiUpdateChore,
    deleteChore: apiDeleteChore,
    fetchCompletions: apiFetchCompletions,
    createCompletion: apiCreateCompletion,
    deleteCompletion: apiDeleteCompletion,
  } = useChoresApi();
  
  const { currentFamilyMember } = useFamilyMember();
  
  // Fetch chores on component mount
  useEffect(() => {
    const loadChores = async () => {
      await apiFetchChores();
    };
    
    loadChores();
  }, [apiFetchChores]);
  
  // Create a new chore
  const createChore = async (
    name: string,
    recurrencePattern: RecurrencePattern,
    startDate: string,
    familyMemberIds: string[],
    description?: string,
    customRecurrence?: string,
    endDate?: string,
    priority?: Priority,
    estimatedMinutes?: number,
    isActive?: boolean
  ) => {
    return apiCreateChore({
      name,
      recurrencePattern,
      startDate,
      familyMemberIds,
      description,
      customRecurrence,
      endDate,
      priority,
      estimatedMinutes,
      isActive,
    });
  };
  
  // Update a chore
  const updateChore = async (
    id: string,
    name: string,
    recurrencePattern: RecurrencePattern,
    startDate: string,
    familyMemberIds: string[],
    description?: string,
    customRecurrence?: string,
    endDate?: string,
    priority?: Priority,
    estimatedMinutes?: number,
    isActive?: boolean
  ) => {
    return apiUpdateChore(id, {
      name,
      recurrencePattern,
      startDate,
      familyMemberIds,
      description,
      customRecurrence,
      endDate,
      priority,
      estimatedMinutes,
      isActive,
    });
  };
  
  // Create a completion
  const createCompletion = async (
    choreId: string,
    familyMemberId: string,
    completedAt?: string,
    notes?: string
  ) => {
    return apiCreateCompletion({
      choreId,
      familyMemberId,
      completedAt,
      notes,
    });
  };
  
  // Helper functions
  const getChoreById = (id: string) => {
    return chores.find(chore => chore.id === id);
  };
  
  const getCompletionById = (id: string) => {
    return completions.find(completion => completion.id === id);
  };
  
  const getChoresByFamilyMember = (familyMemberId: string) => {
    return chores.filter(chore => 
      chore.assignments.some(assignment => assignment.familyMemberId === familyMemberId)
    );
  };
  
  const getCompletionsByFamilyMember = (familyMemberId: string) => {
    return completions.filter(completion => completion.familyMemberId === familyMemberId);
  };
  
  const getActiveChores = () => {
    return chores.filter(chore => chore.isActive);
  };
  
  const getCompletedChores = (startDate?: string, endDate?: string) => {
    // Get unique chore IDs from completions within the date range
    const completedChoreIds = new Set(
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
        .map(completion => completion.choreId)
    );
    
    // Return chores that have completions
    return chores.filter(chore => completedChoreIds.has(chore.id));
  };
  
  return (
    <ChoreContext.Provider
      value={{
        chores,
        completions,
        isLoading,
        error,
        fetchChores: apiFetchChores,
        createChore,
        updateChore,
        deleteChore: apiDeleteChore,
        fetchCompletions: apiFetchCompletions,
        createCompletion,
        deleteCompletion: apiDeleteCompletion,
        getChoreById,
        getCompletionById,
        getChoresByFamilyMember,
        getCompletionsByFamilyMember,
        getActiveChores,
        getCompletedChores,
      }}
    >
      {children}
    </ChoreContext.Provider>
  );
}; 