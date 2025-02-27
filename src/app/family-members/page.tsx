"use client";

import React from 'react';
import { FamilyMemberList } from '@/components/family/FamilyMemberList';
import { TouchButton } from '@/components/ui/TouchButton';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FamilyMembersPage() {
  const router = useRouter();
  
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex items-center mb-6">
        <TouchButton
          onClick={() => router.back()}
          className="p-2 mr-4 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </TouchButton>
        <h1 className="text-3xl font-bold">Family Members</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <FamilyMemberList />
      </div>
      
      <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
        <p>
          Family members are used to organize and color-code events in your calendar.
          Each family member can have their own color and avatar.
        </p>
      </div>
    </div>
  );
} 