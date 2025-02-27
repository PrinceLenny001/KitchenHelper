"use client";

import React, { useState, useEffect } from 'react';
import { useChore } from '@/lib/context/ChoreContext';
import { useFamilyMember } from '@/lib/context/FamilyMemberContext';
import { TouchButton } from '@/components/ui/TouchButton';
import { X, Calendar, Clock, User, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Chore, RecurrencePattern, Priority } from '@/hooks/useChoresApi';

interface ChoreFormProps {
  chore?: Chore;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChoreForm: React.FC<ChoreFormProps> = ({
  chore,
  onClose,
  onSuccess,
}) => {
  // Form state
  const [name, setName] = useState(chore?.name || '');
  const [description, setDescription] = useState(chore?.description || '');
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>(
    chore?.recurrencePattern || 'DAILY'
  );
  const [customRecurrence, setCustomRecurrence] = useState(chore?.customRecurrence || '');
  const [startDate, setStartDate] = useState(
    chore?.startDate ? new Date(chore.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    chore?.endDate ? new Date(chore.endDate).toISOString().split('T')[0] : ''
  );
  const [priority, setPriority] = useState<Priority>(chore?.priority || 'MEDIUM');
  const [estimatedMinutes, setEstimatedMinutes] = useState(chore?.estimatedMinutes || 15);
  const [isActive, setIsActive] = useState(chore?.isActive !== undefined ? chore.isActive : true);
  const [selectedFamilyMembers, setSelectedFamilyMembers] = useState<string[]>(
    chore?.assignments.map(a => a.familyMemberId) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Context hooks
  const { createChore, updateChore } = useChore();
  const { familyMembers, isLoading: isFamilyMembersLoading } = useFamilyMember();
  
  const isEditing = !!chore;
  
  // Set default family member if none selected
  useEffect(() => {
    if (selectedFamilyMembers.length === 0 && familyMembers.length > 0) {
      const defaultMember = familyMembers.find(m => m.isDefault);
      if (defaultMember) {
        setSelectedFamilyMembers([defaultMember.id]);
      } else if (familyMembers[0]) {
        setSelectedFamilyMembers([familyMembers[0].id]);
      }
    }
  }, [familyMembers, selectedFamilyMembers]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    if (selectedFamilyMembers.length === 0) {
      toast.error('At least one family member must be assigned');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && chore) {
        // Update existing chore
        await updateChore(
          chore.id,
          name,
          recurrencePattern,
          startDate,
          selectedFamilyMembers,
          description,
          customRecurrence,
          endDate || undefined,
          priority,
          estimatedMinutes,
          isActive
        );
        toast.success('Chore updated successfully');
      } else {
        // Create new chore
        await createChore(
          name,
          recurrencePattern,
          startDate,
          selectedFamilyMembers,
          description,
          customRecurrence,
          endDate || undefined,
          priority,
          estimatedMinutes,
          isActive
        );
        toast.success('Chore created successfully');
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      toast.error('Failed to save chore');
      console.error('Error saving chore:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Toggle family member selection
  const toggleFamilyMember = (id: string) => {
    setSelectedFamilyMembers(prev => {
      if (prev.includes(id)) {
        return prev.filter(memberId => memberId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Recurrence pattern options
  const recurrenceOptions = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKDAYS', label: 'Weekdays' },
    { value: 'WEEKENDS', label: 'Weekends' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'BIWEEKLY', label: 'Biweekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'CUSTOM', label: 'Custom' },
    { value: 'ONCE', label: 'Once' },
  ];
  
  // Priority options
  const priorityOptions = [
    { value: 'LOW', label: 'Low', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { value: 'HIGH', label: 'High', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  ];
  
  // Time estimate options
  const timeOptions = [
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
    { value: 240, label: '4 hours' },
  ];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-md w-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">
          {isEditing ? 'Edit Chore' : 'Add Chore'}
        </h2>
        <TouchButton
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </TouchButton>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4">
        {/* Name input */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter chore name"
            required
          />
        </div>
        
        {/* Description input */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter description"
            rows={3}
          />
        </div>
        
        {/* Recurrence pattern */}
        <div className="mb-4">
          <label htmlFor="recurrence" className="block text-sm font-medium mb-1">
            Recurrence
          </label>
          <select
            id="recurrence"
            value={recurrencePattern}
            onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {recurrenceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Custom recurrence (if selected) */}
        {recurrencePattern === 'CUSTOM' && (
          <div className="mb-4">
            <label htmlFor="customRecurrence" className="block text-sm font-medium mb-1">
              Custom Recurrence
            </label>
            <input
              type="text"
              id="customRecurrence"
              value={customRecurrence}
              onChange={(e) => setCustomRecurrence(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Every 3 days"
              required
            />
          </div>
        )}
        
        {/* Date range */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-1">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-1">
              End Date (optional)
            </label>
            <div className="relative">
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Priority */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Priority
          </label>
          <div className="grid grid-cols-4 gap-2">
            {priorityOptions.map((option) => (
              <TouchButton
                key={option.value}
                type="button"
                onClick={() => setPriority(option.value as Priority)}
                className={`w-full p-2 rounded-md text-center text-sm ${
                  priority === option.value ? 'ring-2 ring-blue-500' : ''
                } ${option.color}`}
                aria-pressed={priority === option.value}
              >
                {option.label}
              </TouchButton>
            ))}
          </div>
        </div>
        
        {/* Estimated time */}
        <div className="mb-4">
          <label htmlFor="estimatedTime" className="block text-sm font-medium mb-1">
            Estimated Time
          </label>
          <div className="relative">
            <select
              id="estimatedTime"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {timeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Clock className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        {/* Active status */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2">Active</span>
          </label>
        </div>
        
        {/* Family member assignment */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Assign to Family Members
          </label>
          
          {isFamilyMembersLoading ? (
            <div className="flex justify-center items-center h-20">
              <p>Loading family members...</p>
            </div>
          ) : familyMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 border border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4">
              <AlertCircle className="w-6 h-6 text-yellow-500 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                No family members found. Please add family members first.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {familyMembers.map((member) => (
                <TouchButton
                  key={member.id}
                  type="button"
                  onClick={() => toggleFamilyMember(member.id)}
                  className={`flex items-center p-2 border rounded-md ${
                    selectedFamilyMembers.includes(member.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  aria-pressed={selectedFamilyMembers.includes(member.id)}
                >
                  <div 
                    className="w-8 h-8 rounded-full mr-2 flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="flex-grow text-sm">{member.name}</span>
                  {selectedFamilyMembers.includes(member.id) && (
                    <Check className="w-4 h-4 text-blue-500" />
                  )}
                </TouchButton>
              ))}
            </div>
          )}
        </div>
        
        {/* Submit button */}
        <div className="flex justify-end">
          <TouchButton
            type="button"
            onClick={onClose}
            className="mr-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            disabled={isSubmitting}
          >
            Cancel
          </TouchButton>
          <TouchButton
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting || selectedFamilyMembers.length === 0}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </TouchButton>
        </div>
      </form>
    </div>
  );
}; 