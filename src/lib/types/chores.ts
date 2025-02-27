export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type RecurrencePattern = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'CUSTOM';

export interface Chore {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  isCompleted: boolean;
  isActive: boolean;
  priority: Priority;
  recurrencePattern?: RecurrencePattern;
  recurrenceCount?: number;
  recurrenceEndDate?: string;
  estimatedMinutes?: number;
  familyMemberId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChoreCompletion {
  id: string;
  choreId: string;
  familyMemberId: string;
  completedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  chore?: Chore;
  familyMember?: FamilyMember;
}

export interface FamilyMember {
  id: string;
  name: string;
  userId: string;
  avatarUrl?: string;
  birthDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChoreInput {
  name: string;
  description?: string;
  dueDate?: string;
  isActive: boolean;
  priority: Priority;
  recurrencePattern?: RecurrencePattern;
  recurrenceCount?: number;
  recurrenceEndDate?: string;
  estimatedMinutes?: number;
  familyMemberId?: string;
}

export interface ChoreCompletionInput {
  choreId: string;
  familyMemberId: string;
  completedAt?: string;
  notes?: string;
}

export interface ChoreFilters {
  isActive?: boolean;
  familyMemberId?: string;
  includeCompleted?: boolean;
  startDate?: string;
  endDate?: string;
} 