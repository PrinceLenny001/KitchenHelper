import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  image?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface FamilyMemberInput {
  name: string;
  color: string;
  image?: string | null;
  isDefault?: boolean;
}

export const useFamilyMembersApi = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all family members
  const fetchFamilyMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/family-members');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch family members');
      }
      
      const data = await response.json();
      setFamilyMembers(data);
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

  // Create a new family member
  const createFamilyMember = useCallback(async (familyMember: FamilyMemberInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/family-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(familyMember),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create family member');
      }
      
      const newFamilyMember = await response.json();
      setFamilyMembers(prev => [...prev, newFamilyMember]);
      toast.success('Family member created successfully');
      return newFamilyMember;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a family member
  const updateFamilyMember = useCallback(async (id: string, familyMember: FamilyMemberInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/family-members?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(familyMember),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update family member');
      }
      
      const updatedFamilyMember = await response.json();
      setFamilyMembers(prev => 
        prev.map(member => member.id === id ? updatedFamilyMember : member)
      );
      toast.success('Family member updated successfully');
      return updatedFamilyMember;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a family member
  const deleteFamilyMember = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/family-members?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete family member');
      }
      
      setFamilyMembers(prev => prev.filter(member => member.id !== id));
      toast.success('Family member deleted successfully');
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

  // Upload an image for a family member
  const uploadImage = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/family-members/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      
      const data = await response.json();
      return data.path;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    familyMembers,
    isLoading,
    error,
    fetchFamilyMembers,
    createFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    uploadImage,
  };
}; 