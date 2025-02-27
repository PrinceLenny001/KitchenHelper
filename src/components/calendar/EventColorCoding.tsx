"use client";

import React, { useState, useEffect } from 'react';
import { useFamilyMember } from '@/lib/context/FamilyMemberContext';
import { TouchButton } from '@/components/ui/TouchButton';
import { Palette, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface EventColorCodingProps {
  onClose?: () => void;
}

interface ColorAssignment {
  familyMemberId: string;
  color: string;
  enabled: boolean;
}

export const EventColorCoding: React.FC<EventColorCodingProps> = ({
  onClose,
}) => {
  const { familyMembers, isLoading } = useFamilyMember();
  const [colorAssignments, setColorAssignments] = useState<ColorAssignment[]>([]);
  
  // Initialize color assignments from localStorage or family member colors
  useEffect(() => {
    if (familyMembers.length > 0) {
      // Try to load from localStorage first
      const savedAssignments = localStorage.getItem('eventColorAssignments');
      
      if (savedAssignments) {
        try {
          const parsed = JSON.parse(savedAssignments);
          
          // Filter out any assignments for family members that no longer exist
          const validAssignments = parsed.filter((assignment: ColorAssignment) => 
            familyMembers.some(member => member.id === assignment.familyMemberId)
          );
          
          // Add any new family members that don't have assignments yet
          const newAssignments = familyMembers
            .filter(member => !validAssignments.some((a: ColorAssignment) => a.familyMemberId === member.id))
            .map(member => ({
              familyMemberId: member.id,
              color: member.color,
              enabled: true,
            }));
          
          setColorAssignments([...validAssignments, ...newAssignments]);
        } catch (error) {
          console.error('Error parsing saved color assignments:', error);
          initializeFromFamilyMembers();
        }
      } else {
        initializeFromFamilyMembers();
      }
    }
  }, [familyMembers]);
  
  // Initialize color assignments from family members
  const initializeFromFamilyMembers = () => {
    const initialAssignments = familyMembers.map(member => ({
      familyMemberId: member.id,
      color: member.color,
      enabled: true,
    }));
    
    setColorAssignments(initialAssignments);
  };
  
  // Save color assignments to localStorage
  const saveColorAssignments = (assignments: ColorAssignment[]) => {
    localStorage.setItem('eventColorAssignments', JSON.stringify(assignments));
  };
  
  // Handle toggling a color assignment
  const handleToggleEnabled = (familyMemberId: string) => {
    const updatedAssignments = colorAssignments.map(assignment => 
      assignment.familyMemberId === familyMemberId
        ? { ...assignment, enabled: !assignment.enabled }
        : assignment
    );
    
    setColorAssignments(updatedAssignments);
    saveColorAssignments(updatedAssignments);
  };
  
  // Handle changing a color
  const handleColorChange = (familyMemberId: string, color: string) => {
    const updatedAssignments = colorAssignments.map(assignment => 
      assignment.familyMemberId === familyMemberId
        ? { ...assignment, color }
        : assignment
    );
    
    setColorAssignments(updatedAssignments);
    saveColorAssignments(updatedAssignments);
  };
  
  // Handle resetting colors to default
  const handleResetColors = () => {
    const resetAssignments = colorAssignments.map(assignment => {
      const familyMember = familyMembers.find(member => member.id === assignment.familyMemberId);
      return {
        ...assignment,
        color: familyMember ? familyMember.color : assignment.color,
      };
    });
    
    setColorAssignments(resetAssignments);
    saveColorAssignments(resetAssignments);
    toast.success('Colors reset to default');
  };
  
  // Handle saving changes
  const handleSave = () => {
    saveColorAssignments(colorAssignments);
    toast.success('Color settings saved');
    if (onClose) onClose();
  };
  
  // Get family member name by ID
  const getFamilyMemberName = (familyMemberId: string) => {
    const member = familyMembers.find(m => m.id === familyMemberId);
    return member ? member.name : 'Unknown';
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Event Color Coding</h2>
          {onClose && (
            <TouchButton
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </TouchButton>
          )}
        </div>
        <div className="flex justify-center items-center h-40">
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-md w-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Event Color Coding
        </h2>
        {onClose && (
          <TouchButton
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </TouchButton>
        )}
      </div>
      
      <div className="p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Customize how events are color-coded based on family members. 
          Toggle visibility or change colors for each family member.
        </p>
        
        <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
          {colorAssignments.map((assignment) => (
            <div 
              key={assignment.familyMemberId}
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div className="flex items-center">
                <TouchButton
                  onClick={() => handleToggleEnabled(assignment.familyMemberId)}
                  className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                    assignment.enabled 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  aria-label={`Toggle ${getFamilyMemberName(assignment.familyMemberId)}`}
                  aria-pressed={assignment.enabled}
                >
                  {assignment.enabled && <Check className="w-4 h-4" />}
                </TouchButton>
                <span className={assignment.enabled ? '' : 'text-gray-400'}>
                  {getFamilyMemberName(assignment.familyMemberId)}
                </span>
              </div>
              
              <div className="flex items-center">
                <input
                  type="color"
                  value={assignment.color}
                  onChange={(e) => handleColorChange(assignment.familyMemberId, e.target.value)}
                  className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer"
                  disabled={!assignment.enabled}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-6">
          <TouchButton
            onClick={handleResetColors}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
          >
            Reset Colors
          </TouchButton>
          
          <TouchButton
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Save Changes
          </TouchButton>
        </div>
      </div>
    </div>
  );
}; 