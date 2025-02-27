"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { RoutineList } from '@/components/routines/RoutineList';
import { RoutineForm } from '@/components/routines/RoutineForm';
import { Routine } from '@/hooks/useRoutinesApi';
import { Dialog } from '@/components/ui/Dialog';

export default function RoutinesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | undefined>();

  const handleCreateClick = () => {
    setSelectedRoutine(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (routine: Routine) => {
    setSelectedRoutine(routine);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedRoutine(undefined);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedRoutine(undefined);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Routines"
        description="Create and manage your daily, weekly, or custom routines"
      />

      <RoutineList
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
      />

      <Dialog
        open={isFormOpen}
        onClose={handleFormClose}
        className="max-w-2xl w-full"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {selectedRoutine ? 'Edit Routine' : 'Create Routine'}
          </h2>
          <RoutineForm
            routine={selectedRoutine}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        </div>
      </Dialog>
    </div>
  );
} 