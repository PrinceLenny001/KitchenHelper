"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FamilyMember, useFamilyMembersApi } from '@/hooks/useFamilyMembersApi';

// Define the context type
interface FamilyMemberContextType {
  currentFamilyMember: FamilyMember | null;
  familyMembers: FamilyMember[];
  setCurrentFamilyMember: (member: FamilyMember) => void;
  isLoading: boolean;
  error: string | null;
  refreshFamilyMembers: () => Promise<FamilyMember[]>;
  createFamilyMember: (name: string, color: string, image?: string | null, isDefault?: boolean) => Promise<FamilyMember | null>;
  updateFamilyMember: (id: string, name: string, color: string, image?: string | null, isDefault?: boolean) => Promise<FamilyMember | null>;
  deleteFamilyMember: (id: string) => Promise<boolean>;
  uploadImage: (file: File) => Promise<string | null>;
}

// Create the context with a default value
const FamilyMemberContext = createContext<FamilyMemberContextType>({
  currentFamilyMember: null,
  familyMembers: [],
  setCurrentFamilyMember: () => {},
  isLoading: true,
  error: null,
  refreshFamilyMembers: async () => [],
  createFamilyMember: async () => null,
  updateFamilyMember: async () => null,
  deleteFamilyMember: async () => false,
  uploadImage: async () => null,
});

// Custom hook to use the family member context
export const useFamilyMember = () => useContext(FamilyMemberContext);

// Provider component
export const FamilyMemberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentFamilyMember, setCurrentFamilyMember] = useState<FamilyMember | null>(null);
  const {
    familyMembers,
    isLoading,
    error,
    fetchFamilyMembers,
    createFamilyMember: apiCreateFamilyMember,
    updateFamilyMember: apiUpdateFamilyMember,
    deleteFamilyMember: apiDeleteFamilyMember,
    uploadImage,
  } = useFamilyMembersApi();

  // Fetch family members on component mount
  useEffect(() => {
    const loadFamilyMembers = async () => {
      const members = await fetchFamilyMembers();
      
      // Set the default family member
      if (members.length > 0) {
        const defaultMember = members.find((member: FamilyMember) => member.isDefault) || members[0];
        setCurrentFamilyMember(defaultMember);
      }
    };

    loadFamilyMembers();
  }, [fetchFamilyMembers]);

  // Refresh family members
  const refreshFamilyMembers = async () => {
    const members = await fetchFamilyMembers();
    
    // Update current family member if it exists in the new list
    if (currentFamilyMember) {
      const updatedCurrentMember = members.find((member: FamilyMember) => member.id === currentFamilyMember.id);
      if (updatedCurrentMember) {
        setCurrentFamilyMember(updatedCurrentMember);
      } else if (members.length > 0) {
        // If current member no longer exists, set to default or first
        const defaultMember = members.find((member: FamilyMember) => member.isDefault) || members[0];
        setCurrentFamilyMember(defaultMember);
      } else {
        setCurrentFamilyMember(null);
      }
    }
    
    return members;
  };

  // Create a new family member
  const createFamilyMember = async (
    name: string,
    color: string,
    image?: string | null,
    isDefault?: boolean
  ) => {
    const newMember = await apiCreateFamilyMember({
      name,
      color,
      image,
      isDefault,
    });
    
    // If this is the first family member or it's set as default, make it the current one
    if (newMember && (familyMembers.length === 0 || newMember.isDefault)) {
      setCurrentFamilyMember(newMember);
    }
    
    return newMember;
  };

  // Update a family member
  const updateFamilyMember = async (
    id: string,
    name: string,
    color: string,
    image?: string | null,
    isDefault?: boolean
  ) => {
    const updatedMember = await apiUpdateFamilyMember(id, {
      name,
      color,
      image,
      isDefault,
    });
    
    // If the updated member is the current one, update the current member state
    if (updatedMember && currentFamilyMember && currentFamilyMember.id === id) {
      setCurrentFamilyMember(updatedMember);
    }
    
    // If the updated member is now the default, make it the current one
    if (updatedMember && updatedMember.isDefault) {
      setCurrentFamilyMember(updatedMember);
    }
    
    return updatedMember;
  };

  // Delete a family member
  const deleteFamilyMember = async (id: string) => {
    const success = await apiDeleteFamilyMember(id);
    
    // If the deleted member was the current one, update the current member
    if (success && currentFamilyMember && currentFamilyMember.id === id) {
      // Find a new current member (should be the new default or the first one)
      const remainingMembers = familyMembers.filter(member => member.id !== id);
      if (remainingMembers.length > 0) {
        const newDefault = remainingMembers.find((member: FamilyMember) => member.isDefault) || remainingMembers[0];
        setCurrentFamilyMember(newDefault);
      } else {
        setCurrentFamilyMember(null);
      }
    }
    
    return success;
  };

  return (
    <FamilyMemberContext.Provider
      value={{
        currentFamilyMember,
        familyMembers,
        setCurrentFamilyMember,
        isLoading,
        error,
        refreshFamilyMembers,
        createFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,
        uploadImage,
      }}
    >
      {children}
    </FamilyMemberContext.Provider>
  );
}; 