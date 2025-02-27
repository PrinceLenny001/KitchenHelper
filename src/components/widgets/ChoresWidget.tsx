"use client";

import { useState, useEffect } from 'react';
import { WidgetComponentProps } from '@/lib/types/dashboard';
import { prisma } from '@/lib/db';
import { CheckIcon, XIcon } from 'lucide-react';

export function ChoresWidget({ widget, isEditing }: WidgetComponentProps) {
  const [chores, setChores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchChores = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/chores?limit=5');
        
        if (!response.ok) {
          throw new Error('Failed to fetch chores');
        }
        
        const data = await response.json();
        setChores(data.chores || []);
      } catch (err) {
        console.error('Error fetching chores:', err);
        setError('Failed to load chores');
      } finally {
        setLoading(false);
      }
    };
    
    if (!isEditing) {
      fetchChores();
    } else {
      // Show placeholder data in edit mode
      setChores([
        { id: '1', name: 'Take out trash', priority: 'HIGH' },
        { id: '2', name: 'Do laundry', priority: 'MEDIUM' },
        { id: '3', name: 'Clean kitchen', priority: 'LOW' },
      ]);
      setLoading(false);
    }
  }, [isEditing]);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'URGENT':
        return 'text-red-500';
      case 'MEDIUM':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
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
      <div className="flex flex-col items-center justify-center h-full">
        <XIcon className="text-red-500 mb-2" />
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }
  
  if (chores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <CheckIcon className="text-green-500 mb-2" />
        <p className="text-sm text-gray-500">No chores to display</p>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-auto">
      <ul className="space-y-2">
        {chores.map((chore) => (
          <li key={chore.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <span className="text-sm truncate">{chore.name}</span>
            <span className={`text-xs font-medium ${getPriorityColor(chore.priority)}`}>
              {chore.priority}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
} 