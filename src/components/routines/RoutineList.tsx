"use client";

import React from 'react';
import { useRoutine } from '@/lib/context/RoutineContext';
import { Routine } from '@/hooks/useRoutinesApi';
import { CustomButton } from '@/components/ui/CustomButton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Plus, Check, Clock, Calendar } from 'lucide-react';

interface RoutineListProps {
  onCreateClick: () => void;
  onEditClick: (routine: Routine) => void;
}

export const RoutineList: React.FC<RoutineListProps> = ({
  onCreateClick,
  onEditClick,
}) => {
  const {
    routines,
    completions,
    isLoading,
    error,
    getActiveRoutines,
    getCompletedRoutines,
  } = useRoutine();

  const activeRoutines = getActiveRoutines();
  const completedRoutines = getCompletedRoutines();

  if (isLoading) {
    return <div className="p-4 text-center">Loading routines...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  const renderRoutineCard = (routine: Routine) => {
    const routineCompletions = completions.filter(c => c.routineId === routine.id);
    const lastCompletion = routineCompletions[routineCompletions.length - 1];

    return (
      <div
        key={routine.id}
        className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{routine.name}</h3>
            {routine.description && (
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {routine.description}
              </p>
            )}
          </div>
          <CustomButton
            variant="ghost"
            size="sm"
            onClick={() => onEditClick(routine)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Edit
          </CustomButton>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{routine.estimatedMinutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{routine.recurrencePattern.toLowerCase()}</span>
          </div>
          {lastCompletion && (
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              <span>
                Last completed{' '}
                {new Date(lastCompletion.completedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Steps:
          </div>
          <ul className="space-y-2">
            {routine.steps.map((step, index) => (
              <li
                key={step.id}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
              >
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  {index + 1}
                </span>
                <span>{step.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Routines</h2>
        <CustomButton onClick={onCreateClick} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Routine
        </CustomButton>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {activeRoutines.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No active routines. Create one to get started!
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeRoutines.map(renderRoutineCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completedRoutines.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No completed routines yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedRoutines.map(renderRoutineCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}; 