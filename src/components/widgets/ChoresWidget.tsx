"use client";

import { useState, useEffect } from 'react';
import { WidgetComponentProps } from '@/lib/types/dashboard';
import { useChoresApi } from '@/hooks/useChoresApi';
import { Chore, ChoreFilters, Priority } from '@/lib/types/chores';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Circle } from 'lucide-react';

export function ChoresWidget({ widget, isEditing }: WidgetComponentProps) {
  const { chores, fetchChores, createCompletion } = useChoresApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(5);
  
  // Get settings from widget or use defaults
  const settings = widget.settings || {};
  const showCompleted = settings.showCompleted || false;
  const familyMemberId = settings.familyMemberId || null;
  const sortBy = settings.sortBy || 'dueDate';
  
  useEffect(() => {
    const loadChores = async () => {
      try {
        setLoading(true);
        const filters: ChoreFilters = {
          isActive: true,
          familyMemberId: familyMemberId,
          includeCompleted: showCompleted,
        };
        await fetchChores(filters);
        setError(null);
      } catch (err) {
        setError('Failed to load chores');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadChores();
    
    // Set up polling for updates
    const interval = setInterval(loadChores, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [fetchChores, familyMemberId, showCompleted]);
  
  const handleMarkComplete = async (choreId: string) => {
    try {
      // Use the first family member as default if none is specified in settings
      const completionFamilyMemberId = familyMemberId || 'default';
      await createCompletion({
        choreId,
        familyMemberId: completionFamilyMemberId,
        completedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to mark chore as complete:', err);
    }
  };
  
  // Sort chores based on settings
  const sortedChores = [...chores].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime();
    } else if (sortBy === 'priority') {
      const priorityOrder: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return 0;
  });
  
  // Filter chores based on settings
  const filteredChores = sortedChores.filter(chore => {
    if (!showCompleted && chore.isCompleted) {
      return false;
    }
    return true;
  });
  
  // Limit the number of chores displayed
  const displayedChores = filteredChores.slice(0, displayCount);
  
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
        <Button size="sm" onClick={() => fetchChores()}>Retry</Button>
      </div>
    );
  }
  
  if (filteredChores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-gray-500 dark:text-gray-400">No chores to display</p>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-auto p-4">
      <ul className="space-y-2">
        {displayedChores.map((chore) => (
          <li key={chore.id} className="flex items-center justify-between">
            <div className="flex items-center">
              {!isEditing && !chore.isCompleted ? (
                <button 
                  onClick={() => handleMarkComplete(chore.id)}
                  className="mr-2 text-gray-400 hover:text-green-500"
                >
                  <Circle className="h-5 w-5" />
                </button>
              ) : chore.isCompleted ? (
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 mr-2 text-gray-400" />
              )}
              <span className={`${chore.isCompleted ? 'line-through text-gray-400' : ''}`}>
                {chore.name}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {chore.dueDate && new Date(chore.dueDate).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
      
      {filteredChores.length > displayCount && (
        <div className="mt-4 text-center">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setDisplayCount(prev => prev + 5)}
          >
            Show More
          </Button>
        </div>
      )}
    </div>
  );
} 