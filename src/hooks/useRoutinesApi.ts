import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { RecurrencePattern } from '@/hooks/useChoresApi';

export interface RoutineStep {
  id?: string;
  name: string;
  description?: string;
  order: number;
  estimatedMinutes: number;
  createdAt?: string;
  updatedAt?: string;
  routineId?: string;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  recurrencePattern: RecurrencePattern;
  customRecurrence?: string;
  startDate: string;
  endDate?: string;
  estimatedMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  steps: RoutineStep[];
}

export interface RoutineCompletion {
  id: string;
  routineId: string;
  familyMemberId: string;
  completedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  routine?: Routine;
  familyMember?: {
    id: string;
    name: string;
    color: string;
    image?: string | null;
  };
}

interface RoutineInput {
  name: string;
  description?: string;
  recurrencePattern: RecurrencePattern;
  customRecurrence?: string;
  startDate: string;
  endDate?: string;
  estimatedMinutes?: number;
  isActive?: boolean;
  steps: RoutineStep[];
}

interface RoutineCompletionInput {
  routineId: string;
  familyMemberId: string;
  completedAt?: string;
  notes?: string;
}

export const useRoutinesApi = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [completions, setCompletions] = useState<RoutineCompletion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all routines
  const fetchRoutines = useCallback(async (active?: boolean) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let url = '/api/routines';
      const params = new URLSearchParams();
      
      if (active !== undefined) {
        params.append('active', active.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch routines');
      }
      
      const data = await response.json();
      setRoutines(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new routine
  const createRoutine = useCallback(async (routine: RoutineInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routine),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create routine');
      }
      
      const newRoutine = await response.json();
      setRoutines(prev => [newRoutine, ...prev]);
      toast.success('Routine created successfully');
      return newRoutine;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a routine
  const updateRoutine = useCallback(async (id: string, routine: RoutineInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/routines?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routine),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update routine');
      }
      
      const updatedRoutine = await response.json();
      setRoutines(prev => 
        prev.map(r => r.id === id ? updatedRoutine : r)
      );
      toast.success('Routine updated successfully');
      return updatedRoutine;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a routine
  const deleteRoutine = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/routines?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete routine');
      }
      
      setRoutines(prev => prev.filter(routine => routine.id !== id));
      toast.success('Routine deleted successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch routine completions
  const fetchCompletions = useCallback(async (
    routineId?: string, 
    familyMemberId?: string, 
    startDate?: string, 
    endDate?: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let url = '/api/routines/completion';
      const params = new URLSearchParams();
      
      if (routineId) {
        params.append('routineId', routineId);
      }
      
      if (familyMemberId) {
        params.append('familyMemberId', familyMemberId);
      }
      
      if (startDate) {
        params.append('startDate', startDate);
      }
      
      if (endDate) {
        params.append('endDate', endDate);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch completions');
      }
      
      const data = await response.json();
      setCompletions(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a routine completion
  const createCompletion = useCallback(async (completion: RoutineCompletionInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/routines/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completion),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark routine as complete');
      }
      
      const newCompletion = await response.json();
      setCompletions(prev => [newCompletion, ...prev]);
      toast.success('Routine marked as complete');
      return newCompletion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a routine completion
  const deleteCompletion = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/routines/completion?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete completion');
      }
      
      setCompletions(prev => prev.filter(completion => completion.id !== id));
      toast.success('Completion record deleted');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    routines,
    completions,
    isLoading,
    error,
    fetchRoutines,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    fetchCompletions,
    createCompletion,
    deleteCompletion,
  };
}; 