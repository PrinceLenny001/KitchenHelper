"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useFamilyMember } from '@/lib/context/FamilyMemberContext';
import { TouchButton } from '@/components/ui/TouchButton';
import { User, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const FamilyMemberSelector: React.FC = () => {
  const { currentFamilyMember, familyMembers, setCurrentFamilyMember, isLoading } = useFamilyMember();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle selecting a family member
  const handleSelectMember = (memberId: string) => {
    const member = familyMembers.find(m => m.id === memberId);
    if (member) {
      setCurrentFamilyMember(member);
    }
    setIsOpen(false);
  };
  
  // Navigate to family members management page
  const handleManageMembers = () => {
    router.push('/family-members');
    setIsOpen(false);
  };
  
  if (isLoading || !currentFamilyMember) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600">
        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }
  
  return (
    <div className="relative" ref={dropdownRef}>
      <TouchButton
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: currentFamilyMember.color }}
        >
          {currentFamilyMember.image ? (
            <img 
              src={currentFamilyMember.image} 
              alt={currentFamilyMember.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-3 h-3 text-white" />
          )}
        </div>
        <span className="font-medium">{currentFamilyMember.name}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </TouchButton>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {familyMembers.map((member) => (
              <TouchButton
                key={member.id}
                onClick={() => handleSelectMember(member.id)}
                className={`flex items-center w-full px-4 py-2 text-left ${
                  currentFamilyMember.id === member.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div 
                  className="w-6 h-6 rounded-full mr-3 flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: member.color }}
                >
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-3 h-3 text-white" />
                  )}
                </div>
                <span>{member.name}</span>
              </TouchButton>
            ))}
            
            <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
              <TouchButton
                onClick={handleManageMembers}
                className="flex items-center w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings className="w-4 h-4 mr-3" />
                <span>Manage Family Members</span>
              </TouchButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 