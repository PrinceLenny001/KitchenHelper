"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { WidgetComponentProps } from '@/lib/types/dashboard';
import { CustomButton } from '@/components/ui/CustomButton';
import { User, UserPlus } from 'lucide-react';
import { FamilyMember } from '@/lib/types/chores';

export function FamilyWidget({ widget, isEditing }: WidgetComponentProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get settings from widget or use defaults
  const settings = widget.settings || {};
  const showAvatars = settings.showAvatars !== false;
  const showBirthdays = settings.showBirthdays !== false;
  
  useEffect(() => {
    const loadFamilyMembers = async () => {
      try {
        setLoading(true);
        
        // This would be replaced with actual API calls to fetch family members
        // For now, we'll use mock data
        const mockFamilyMembers: FamilyMember[] = [
          {
            id: '1',
            name: 'John Doe',
            userId: 'user1',
            avatarUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
            birthDate: '1980-05-15',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Jane Doe',
            userId: 'user1',
            avatarUrl: 'https://ui-avatars.com/api/?name=Jane+Doe&background=F06292&color=fff',
            birthDate: '1982-08-22',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Tommy Doe',
            userId: 'user1',
            avatarUrl: 'https://ui-avatars.com/api/?name=Tommy+Doe&background=4CAF50&color=fff',
            birthDate: '2010-03-10',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        
        setFamilyMembers(mockFamilyMembers);
        setError(null);
      } catch (err) {
        setError('Failed to load family members');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadFamilyMembers();
  }, []);
  
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const formatBirthday = (birthDate: string) => {
    const date = new Date(birthDate);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-red-500 mb-2">{error}</p>
        <CustomButton size="sm" onClick={() => setError(null)}>Retry</CustomButton>
      </div>
    );
  }
  
  if (familyMembers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-gray-500 dark:text-gray-400 mb-2">No family members added yet</p>
        {!isEditing && (
          <CustomButton size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Family Member
          </CustomButton>
        )}
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-auto p-4">
      <ul className="space-y-3">
        {familyMembers.map((member) => (
          <li key={member.id} className="flex items-center">
            {showAvatars ? (
              <img 
                src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`} 
                alt={member.name}
                className="w-10 h-10 rounded-full mr-3"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
            )}
            <div>
              <div className="font-medium">{member.name}</div>
              {showBirthdays && member.birthDate && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatBirthday(member.birthDate)} • {calculateAge(member.birthDate)} years
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      
      {!isEditing && (
        <div className="mt-4 text-center">
          <CustomButton size="sm" variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Family Member
          </CustomButton>
        </div>
      )}
    </div>
  );
} 