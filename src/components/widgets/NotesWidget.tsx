"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { WidgetComponentProps } from '@/lib/types/dashboard';
import { CustomButton } from '@/components/ui/CustomButton';
import { Textarea } from '@/components/ui/textarea';
import { Save, Edit, Trash } from 'lucide-react';

export function NotesWidget({ widget, isEditing }: WidgetComponentProps) {
  const [note, setNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get settings from widget or use defaults
  const settings = widget.settings || {};
  const title = settings.title || 'Quick Notes';
  const savedNote = settings.note || '';
  
  useEffect(() => {
    const loadNote = async () => {
      try {
        setLoading(true);
        // In a real implementation, we might fetch the note from an API
        // For now, we'll just use the note from settings
        setNote(savedNote);
        setError(null);
      } catch (err) {
        setError('Failed to load note');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadNote();
  }, [savedNote]);
  
  const handleSaveNote = async () => {
    try {
      // In a real implementation, we would save the note to an API
      // For now, we'll just update the local state
      setIsEditingNote(false);
      // We would also update the widget settings here
    } catch (err) {
      setError('Failed to save note');
      console.error(err);
    }
  };
  
  const handleClearNote = () => {
    if (window.confirm('Are you sure you want to clear this note?')) {
      setNote('');
      setIsEditingNote(false);
      // We would also update the widget settings here
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
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-red-500 mb-2">{error}</p>
        <CustomButton size="sm" onClick={() => setError(null)}>Retry</CustomButton>
      </div>
    );
  }
  
  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {!isEditing && (
          <div className="flex space-x-1">
            {isEditingNote ? (
              <button 
                onClick={handleSaveNote}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-blue-500"
                title="Save note"
              >
                <Save className="h-4 w-4" />
              </button>
            ) : (
              <button 
                onClick={() => setIsEditingNote(true)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                title="Edit note"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            <button 
              onClick={handleClearNote}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-red-500"
              title="Clear note"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      {isEditingNote && !isEditing ? (
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="flex-1 w-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          placeholder="Type your note here..."
        />
      ) : (
        <div className="flex-1 overflow-auto">
          {note ? (
            <p className="whitespace-pre-wrap text-sm">{note}</p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic">
              {isEditing ? 'Note content will appear here' : 'Click the edit button to add a note'}
            </p>
          )}
        </div>
      )}
      
      {isEditingNote && !isEditing && (
        <div className="mt-2 flex justify-end">
          <CustomButton size="sm" onClick={handleSaveNote}>
            Save
          </CustomButton>
        </div>
      )}
    </div>
  );
} 