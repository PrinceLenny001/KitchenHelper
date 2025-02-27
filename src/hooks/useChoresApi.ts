import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export type RecurrencePattern = 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'CUSTOM' | 'ONCE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ChoreAssignment {
  id: string;
  choreId: string;
  familyMemberId: string;
  familyMember?: {
    id: string;
    name: string;
    color: string;
    image?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Chore {
  id: string;
  name: string;
  description?: string;
  recurrencePattern: RecurrencePattern;
  customRecurrence?: string;
  startDate: string;
  endDate?: string;
  priority: Priority;
  estimatedMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  assignments: ChoreAssignment[];
}

export interface ChoreCompletion {
  id: string;
  choreId: string;
  familyMemberId: string;
  completedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  chore?: Chore;
  familyMember?: {
    id: string;
    name: string;
    color: string;
    image?: string | null;
  };
}

interface ChoreInput {
  name: string;
  description?: string;
  recurrencePattern: RecurrencePattern;
  customRecurrence?: string;
  startDate: string;
  endDate?: string;
  priority?: Priority;
  estimatedMinutes?: number;
  isActive?: boolean;
  familyMemberIds?: string[];
}

interface ChoreCompletionInput {
  choreId: string;
  familyMemberId: string;
  completedAt?: string;
  notes?: string;
}

export const useChoresApi = () => {
  const [chores, setChores] = useState<Chore[]>([]);
  const [completions, setCompletions] = useState<ChoreCompletion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all chores
  const fetchChores = useCallback(async (active?: boolean, familyMemberId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let url = '/api/chores';
      const params = new URLSearchParams();
      
      if (active !== undefined) {
        params.append('active', active.toString());
      }
      
      if (familyMemberId) {
        params.append('familyMemberId', familyMemberId);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch chores');
      }
      
      const data = await response.json();
      setChores(data);
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

  // Create a new chore
  const createChore = useCallback(async (chore: ChoreInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/chores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chore),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create chore');
      }
      
      const newChore = await response.json();
      setChores(prev => [newChore, ...prev]);
      toast.success('Chore created successfully');
      return newChore;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a chore
  const updateChore = useCallback(async (id: string, chore: ChoreInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/chores?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chore),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update chore');
      }
      
      const updatedChore = await response.json();
      setChores(prev => 
        prev.map(c => c.id === id ? updatedChore : c)
      );
      toast.success('Chore updated successfully');
      return updatedChore;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a chore
  const deleteChore = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/chores?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete chore');
      }
      
      setChores(prev => prev.filter(chore => chore.id !== id));
      toast.success('Chore deleted successfully');
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

  // Fetch chore completions
  const fetchCompletions = useCallback(async (
    choreId?: string, 
    familyMemberId?: string, 
    startDate?: string, 
    endDate?: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let url = '/api/chores/completion';
      const params = new URLSearchParams();
      
      if (choreId) {
        params.append('choreId', choreId);
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

  // Create a chore completion
  const createCompletion = useCallback(async (completion: ChoreCompletionInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/chores/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completion),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark chore as complete');
      }
      
      const newCompletion = await response.json();
      setCompletions(prev => [newCompletion, ...prev]);
      toast.success('Chore marked as complete');
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

  // Delete a chore completion
  const deleteCompletion = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/chores/completion?id=${id}`, {
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
    chores,
    completions,
    isLoading,
    error,
    fetchChores,
    createChore,
    updateChore,
    deleteChore,
    fetchCompletions,
    createCompletion,
    deleteCompletion,
  };
}; 