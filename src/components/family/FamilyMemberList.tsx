"use client";

import React, { useState, useEffect } from 'react';
import { useFamilyMember } from '@/lib/context/FamilyMemberContext';
import { FamilyMemberForm } from './FamilyMemberForm';
import { TouchButton } from '@/components/ui/TouchButton';
import { Plus, Edit, Trash2, User, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { FamilyMember } from '@/hooks/useFamilyMembersApi';

export const FamilyMemberList: React.FC = () => {
  const { 
    familyMembers, 
    currentFamilyMember, 
    setCurrentFamilyMember, 
    isLoading, 
    error, 
    refreshFamilyMembers,
    deleteFamilyMember
  } = useFamilyMember();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Refresh family members on component mount
  useEffect(() => {
    refreshFamilyMembers();
  }, [refreshFamilyMembers]);
  
  // Handle selecting a family member
  const handleSelectMember = (member: FamilyMember) => {
    setCurrentFamilyMember(member);
  };
  
  // Handle editing a family member
  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
  };
  
  // Handle deleting a family member
  const handleDeleteMember = async (id: string) => {
    try {
      const success = await deleteFamilyMember(id);
      if (success) {
        toast.success('Family member deleted successfully');
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      toast.error('Failed to delete family member');
      console.error('Error deleting family member:', error);
    }
  };
  
  // Handle form success
  const handleFormSuccess = () => {
    refreshFamilyMembers();
    setShowAddForm(false);
    setEditingMember(null);
  };
  
  if (isLoading && familyMembers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading family members...</p>
      </div>
    );
  }
  
  if (error && familyMembers.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-red-500 mb-4">Error loading family members</p>
        <TouchButton
          onClick={() => refreshFamilyMembers()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Retry
        </TouchButton>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Family Members</h2>
        <TouchButton
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          <Plus className="w-5 h-5 mr-1" />
          Add Member
        </TouchButton>
      </div>
      
      {familyMembers.length === 0 ? (
        <div className="text-center py-8">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">No family members yet</p>
          <TouchButton
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Add your first family member
          </TouchButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {familyMembers.map((member) => (
            <div 
              key={member.id}
              className={`p-4 border rounded-lg flex items-center ${
                currentFamilyMember?.id === member.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div 
                className="w-12 h-12 rounded-full mr-4 flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: member.color }}
              >
                {member.image ? (
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              
              <div className="flex-grow">
                <h3 className="font-medium">{member.name}</h3>
                {member.isDefault && (
                  <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                    <Check className="w-3 h-3 mr-1" />
                    Default
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <TouchButton
                  onClick={() => handleSelectMember(member)}
                  className={`p-2 rounded-full ${
                    currentFamilyMember?.id === member.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                  aria-label={`Select ${member.name}`}
                  aria-pressed={currentFamilyMember?.id === member.id}
                >
                  <User className="w-5 h-5" />
                </TouchButton>
                
                <TouchButton
                  onClick={() => handleEditMember(member)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  aria-label={`Edit ${member.name}`}
                >
                  <Edit className="w-5 h-5" />
                </TouchButton>
                
                {!member.isDefault && (
                  <TouchButton
                    onClick={() => setShowDeleteConfirm(member.id)}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-red-500"
                    aria-label={`Delete ${member.name}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </TouchButton>
                )}
              </div>
              
              {/* Delete confirmation */}
              {showDeleteConfirm === member.id && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
                    <h3 className="text-lg font-medium mb-4">Delete Family Member</h3>
                    <p className="mb-6">
                      Are you sure you want to delete <strong>{member.name}</strong>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3">
                      <TouchButton
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                      >
                        Cancel
                      </TouchButton>
                      <TouchButton
                        onClick={() => handleDeleteMember(member.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md"
                      >
                        Delete
                      </TouchButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Add/Edit form modal */}
      {(showAddForm || editingMember) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <FamilyMemberForm
            familyMember={editingMember || undefined}
            onClose={() => {
              setShowAddForm(false);
              setEditingMember(null);
            }}
            onSuccess={handleFormSuccess}
          />
        </div>
      )}
    </div>
  );
}; 