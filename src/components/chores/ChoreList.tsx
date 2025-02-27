"use client";

import React, { useState, useEffect } from 'react';
import { useChore } from '@/lib/context/ChoreContext';
import { useFamilyMember } from '@/lib/context/FamilyMemberContext';
import { ChoreForm } from './ChoreForm';
import { TouchButton } from '@/components/ui/TouchButton';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  User, 
  Clock, 
  Calendar, 
  AlertCircle,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Chore, Priority } from '@/hooks/useChoresApi';
import { formatDistanceToNow, format, isToday, isTomorrow, isPast, addDays } from 'date-fns';

interface ChoreListProps {
  familyMemberId?: string;
  showCompleted?: boolean;
}

export const ChoreList: React.FC<ChoreListProps> = ({
  familyMemberId,
  showCompleted = false,
}) => {
  // State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterPriority, setFilterPriority] = useState<Priority | 'ALL'>('ALL');
  const [filterFamilyMember, setFilterFamilyMember] = useState<string | 'ALL'>(familyMemberId || 'ALL');
  const [expandedChores, setExpandedChores] = useState<Set<string>>(new Set());
  
  // Context hooks
  const { 
    chores, 
    completions,
    isLoading, 
    error, 
    fetchChores, 
    deleteChore,
    createCompletion,
    fetchCompletions
  } = useChore();
  const { familyMembers, currentFamilyMember } = useFamilyMember();
  
  // Fetch chores on component mount
  useEffect(() => {
    fetchChores();
    fetchCompletions();
  }, [fetchChores, fetchCompletions]);
  
  // Filter chores based on criteria
  const filteredChores = chores.filter(chore => {
    // Filter by active status
    if (!showCompleted && !chore.isActive) {
      return false;
    }
    
    // Filter by priority
    if (filterPriority !== 'ALL' && chore.priority !== filterPriority) {
      return false;
    }
    
    // Filter by family member
    if (filterFamilyMember !== 'ALL') {
      const isAssigned = chore.assignments.some(
        assignment => assignment.familyMemberId === filterFamilyMember
      );
      if (!isAssigned) {
        return false;
      }
    }
    
    return true;
  });
  
  // Sort chores by priority and due date
  const sortedChores = [...filteredChores].sort((a, b) => {
    // First by priority (URGENT > HIGH > MEDIUM > LOW)
    const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by start date (earliest first)
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
  
  // Handle editing a chore
  const handleEditChore = (chore: Chore) => {
    setEditingChore(chore);
  };
  
  // Handle deleting a chore
  const handleDeleteChore = async (id: string) => {
    try {
      const success = await deleteChore(id);
      if (success) {
        toast.success('Chore deleted successfully');
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      toast.error('Failed to delete chore');
      console.error('Error deleting chore:', error);
    }
  };
  
  // Handle marking a chore as complete
  const handleCompleteChore = async (choreId: string) => {
    try {
      const familyMemberId = currentFamilyMember?.id;
      if (!familyMemberId) {
        toast.error('Please select a family member first');
        return;
      }
      
      await createCompletion(
        choreId,
        familyMemberId,
        new Date().toISOString(),
        ''
      );
      
      // Refresh the chores list
      fetchChores();
      fetchCompletions();
    } catch (error) {
      toast.error('Failed to mark chore as complete');
      console.error('Error completing chore:', error);
    }
  };
  
  // Handle form success
  const handleFormSuccess = () => {
    fetchChores();
    setShowAddForm(false);
    setEditingChore(null);
  };
  
  // Toggle chore expansion
  const toggleChoreExpansion = (choreId: string) => {
    setExpandedChores(prev => {
      const newSet = new Set(prev);
      if (newSet.has(choreId)) {
        newSet.delete(choreId);
      } else {
        newSet.add(choreId);
      }
      return newSet;
    });
  };
  
  // Format the due date
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };
  
  // Get the status of a chore
  const getChoreStatus = (chore: Chore) => {
    const startDate = new Date(chore.startDate);
    
    if (isPast(startDate) && isPast(addDays(startDate, 1))) {
      return {
        label: 'Overdue',
        color: 'text-red-500 dark:text-red-400',
      };
    } else if (isToday(startDate)) {
      return {
        label: 'Due today',
        color: 'text-yellow-500 dark:text-yellow-400',
      };
    } else if (isTomorrow(startDate)) {
      return {
        label: 'Due tomorrow',
        color: 'text-blue-500 dark:text-blue-400',
      };
    } else {
      return {
        label: `Due ${formatDistanceToNow(startDate, { addSuffix: true })}`,
        color: 'text-green-500 dark:text-green-400',
      };
    }
  };
  
  // Get the color for a priority
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'HIGH':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'MEDIUM':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  // Get family member by ID
  const getFamilyMemberById = (id: string) => {
    return familyMembers.find(member => member.id === id);
  };
  
  if (isLoading && chores.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading chores...</p>
      </div>
    );
  }
  
  if (error && chores.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-red-500 mb-4">Error loading chores</p>
        <TouchButton
          onClick={() => fetchChores()}
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
        <h2 className="text-2xl font-semibold">Chores</h2>
        <div className="flex space-x-2">
          <TouchButton
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md"
          >
            <Filter className="w-5 h-5 mr-1" />
            Filters
          </TouchButton>
          
          <TouchButton
            onClick={() => {
              fetchChores();
              fetchCompletions();
            }}
            className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md"
            aria-label="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </TouchButton>
          
          <TouchButton
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            <Plus className="w-5 h-5 mr-1" />
            Add Chore
          </TouchButton>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-medium mb-3">Filter Chores</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority filter */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Priority
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as Priority | 'ALL')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            
            {/* Family member filter */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Family Member
              </label>
              <select
                value={filterFamilyMember}
                onChange={(e) => setFilterFamilyMember(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="ALL">All Family Members</option>
                {familyMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      
      {sortedChores.length === 0 ? (
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <p className="text-gray-500 mb-4">No chores found</p>
          <TouchButton
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Add your first chore
          </TouchButton>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedChores.map((chore) => {
            const status = getChoreStatus(chore);
            const isExpanded = expandedChores.has(chore.id);
            
            return (
              <div 
                key={chore.id}
                className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
              >
                {/* Chore header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center flex-grow">
                    <TouchButton
                      onClick={() => handleCompleteChore(chore.id)}
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mr-3"
                      aria-label="Mark as complete"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </TouchButton>
                    
                    <div className="flex-grow">
                      <div className="flex items-center">
                        <h3 className="font-medium text-lg">{chore.name}</h3>
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getPriorityColor(chore.priority)}`}>
                          {chore.priority}
                        </span>
                      </div>
                      <p className={`text-sm ${status.color}`}>{status.label}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <TouchButton
                      onClick={() => toggleChoreExpansion(chore.id)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </TouchButton>
                    
                    <TouchButton
                      onClick={() => handleEditChore(chore)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                      aria-label="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </TouchButton>
                    
                    <TouchButton
                      onClick={() => setShowDeleteConfirm(chore.id)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </TouchButton>
                  </div>
                </div>
                
                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t">
                    {chore.description && (
                      <div className="mb-3">
                        <p className="text-gray-600 dark:text-gray-400">{chore.description}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Date info */}
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Due Date</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDueDate(chore.startDate)}
                            {chore.endDate && ` to ${formatDueDate(chore.endDate)}`}
                          </p>
                        </div>
                      </div>
                      
                      {/* Time estimate */}
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Estimated Time</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {chore.estimatedMinutes < 60 
                              ? `${chore.estimatedMinutes} minutes` 
                              : `${chore.estimatedMinutes / 60} hours`}
                          </p>
                        </div>
                      </div>
                      
                      {/* Recurrence */}
                      <div className="flex items-center">
                        <RefreshCw className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Recurrence</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {chore.recurrencePattern === 'CUSTOM' 
                              ? chore.customRecurrence 
                              : chore.recurrencePattern.charAt(0) + chore.recurrencePattern.slice(1).toLowerCase()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Assigned to */}
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Assigned to</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {chore.assignments.map(assignment => {
                              const member = getFamilyMemberById(assignment.familyMemberId);
                              if (!member) return null;
                              
                              return (
                                <div 
                                  key={assignment.id}
                                  className="flex items-center px-2 py-1 rounded-full text-xs"
                                  style={{ backgroundColor: member.color, color: 'white' }}
                                >
                                  {member.name}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Delete confirmation */}
                {showDeleteConfirm === chore.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
                      <h3 className="text-lg font-medium mb-4">Delete Chore</h3>
                      <p className="mb-6">
                        Are you sure you want to delete <strong>{chore.name}</strong>? This action cannot be undone.
                      </p>
                      <div className="flex justify-end space-x-3">
                        <TouchButton
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                        >
                          Cancel
                        </TouchButton>
                        <TouchButton
                          onClick={() => handleDeleteChore(chore.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-md"
                        >
                          Delete
                        </TouchButton>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Add/Edit form modal */}
      {(showAddForm || editingChore) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ChoreForm
            chore={editingChore || undefined}
            onClose={() => {
              setShowAddForm(false);
              setEditingChore(null);
            }}
            onSuccess={handleFormSuccess}
          />
        </div>
      )}
    </div>
  );
}; 