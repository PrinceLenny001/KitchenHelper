"use client";

import React, { useState, useEffect } from 'react';
import { useRoutine } from '@/lib/context/RoutineContext';
import { useFamilyMember } from '@/lib/context/FamilyMemberContext';
import { Routine, RoutineStep } from '@/hooks/useRoutinesApi';
import { RecurrencePattern } from '@/hooks/useChoresApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { Plus, Trash, ArrowUp, ArrowDown } from 'lucide-react';

interface StepInput {
  description: string;
  order: number;
}

interface RoutineFormProps {
  routine?: Routine;
  onClose?: () => void;
  onSuccess?: (routine: Routine) => void;
}

export const RoutineForm: React.FC<RoutineFormProps> = ({
  routine,
  onClose,
  onSuccess,
}) => {
  // Form state
  const [name, setName] = useState(routine?.name || '');
  const [description, setDescription] = useState(routine?.description || '');
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>(
    routine?.recurrencePattern || 'DAILY'
  );
  const [customRecurrence, setCustomRecurrence] = useState(routine?.customRecurrence || '');
  const [startDate, setStartDate] = useState(routine?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(routine?.endDate || '');
  const [estimatedMinutes, setEstimatedMinutes] = useState(routine?.estimatedMinutes || 15);
  const [isActive, setIsActive] = useState(routine?.isActive !== false);
  const [steps, setSteps] = useState<StepInput[]>(
    routine?.steps?.map(step => ({ 
      description: step.description || '', 
      order: step.order 
    })) || [{ description: '', order: 0 }]
  );
  
  // Context hooks
  const { createRoutine, updateRoutine } = useRoutine();
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (steps.length === 0) {
      newErrors.steps = 'At least one step is required';
    } else {
      const invalidSteps = steps.filter(step => !step.description.trim());
      if (invalidSteps.length > 0) {
        newErrors.steps = 'All steps must have a description';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      // Prepare steps with correct order and convert to RoutineStep format
      const orderedSteps: RoutineStep[] = steps.map((step, index) => ({
        description: step.description,
        order: index,
        name: `Step ${index + 1}`,
        estimatedMinutes: 5 // Default value
      }));
      
      let result: Routine | null;
      
      if (routine) {
        // Update existing routine
        result = await updateRoutine(
          routine.id,
          name,
          recurrencePattern,
          startDate,
          orderedSteps,
          description,
          customRecurrence,
          endDate || undefined,
          estimatedMinutes,
          isActive
        );
        
        if (result) {
          toast.success('Routine updated successfully');
        }
      } else {
        // Create new routine
        result = await createRoutine(
          name,
          recurrencePattern,
          startDate,
          orderedSteps,
          description,
          customRecurrence,
          endDate || undefined,
          estimatedMinutes,
          isActive
        );
        
        if (result) {
          toast.success('Routine created successfully');
        }
      }
      
      if (result && onSuccess) {
        onSuccess(result);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving routine:', error);
      toast.error('Failed to save routine');
    }
  };
  
  // Handle adding a new step
  const addStep = () => {
    setSteps([...steps, { description: '', order: steps.length }]);
  };
  
  // Handle removing a step
  const removeStep = (index: number) => {
    if (steps.length === 1) {
      toast.error('Routine must have at least one step');
      return;
    }
    
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };
  
  // Handle updating a step
  const updateStep = (index: number, description: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], description };
    setSteps(newSteps);
  };
  
  // Handle moving a step up
  const moveStepUp = (index: number) => {
    if (index === 0) return;
    
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[index - 1];
    newSteps[index - 1] = temp;
    setSteps(newSteps);
  };
  
  // Handle moving a step down
  const moveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[index + 1];
    newSteps[index + 1] = temp;
    setSteps(newSteps);
  };
  
  // Recurrence pattern options
  const recurrenceOptions = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'BIWEEKLY', label: 'Bi-weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'CUSTOM', label: 'Custom' },
  ];
  
  // Time estimate options
  const timeEstimateOptions = [
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
    { value: 240, label: '4+ hours' },
  ];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Routine Name*
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter routine name"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter routine description"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recurrence Pattern
          </label>
          <select
            id="recurrence"
            value={recurrencePattern}
            onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          >
            {recurrenceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {recurrencePattern === 'CUSTOM' && (
          <div>
            <label htmlFor="customRecurrence" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Custom Recurrence
            </label>
            <Input
              id="customRecurrence"
              value={customRecurrence}
              onChange={(e) => setCustomRecurrence(e.target.value)}
              placeholder="E.g., Every 3 days"
            />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Start Date
          </label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            End Date (Optional)
          </label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Estimated Time
        </label>
        <select
          id="estimatedTime"
          value={estimatedMinutes.toString()}
          onChange={(e) => setEstimatedMinutes(parseInt(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        >
          {timeEstimateOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Active
        </label>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Steps*
          </label>
          <Button
            type="button"
            onClick={addStep}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Step
          </Button>
        </div>
        
        {errors.steps && <p className="mt-1 text-sm text-red-500 mb-2">{errors.steps}</p>}
        
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-grow">
                <Input
                  value={step.description}
                  onChange={(e) => updateStep(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                />
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => moveStepUp(index)}
                  disabled={index === 0}
                  className={`p-1 rounded ${
                    index === 0 ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveStepDown(index)}
                  disabled={index === steps.length - 1}
                  className={`p-1 rounded ${
                    index === steps.length - 1 ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        {onClose && (
          <Button type="button" onClick={onClose} variant="outline">
            Cancel
          </Button>
        )}
        <Button type="submit">
          {routine ? 'Update Routine' : 'Create Routine'}
        </Button>
      </div>
    </form>
  );
}; 