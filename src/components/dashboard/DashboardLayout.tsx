"use client";

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { WidgetData } from '@/lib/types/dashboard';
import { Widget } from '@/components/dashboard/Widget';
import { PlusIcon } from 'lucide-react';

export interface DashboardLayoutProps {
  widgets: WidgetData[];
  isLoading: boolean;
  onRemoveWidget: (id: string) => void;
  onUpdateLayout: (widgets: WidgetData[]) => void;
}

export function DashboardLayout({ widgets, isLoading, onRemoveWidget, onUpdateLayout }: DashboardLayoutProps) {
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex(widget => widget.id === active.id);
      const newIndex = widgets.findIndex(widget => widget.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newWidgets = arrayMove(widgets, oldIndex, newIndex);
        onUpdateLayout(newWidgets);
      }
    }
    
    setActiveWidget(null);
  };
  
  const handleResize = (id: string, width: number, height: number) => {
    const newWidgets = widgets.map(widget => {
      if (widget.id === id) {
        return { ...widget, width, height };
      }
      return widget;
    });
    
    onUpdateLayout(newWidgets);
  };
  
  const handleSettingsChange = (id: string, settings: Record<string, any>) => {
    const newWidgets = widgets.map(widget => {
      if (widget.id === id) {
        return { ...widget, settings };
      }
      return widget;
    });
    
    onUpdateLayout(newWidgets);
  };
  
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleEditMode}
          className={`px-4 py-2 rounded transition-colors ${
            isEditing 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {isEditing ? 'Done' : 'Edit Dashboard'}
        </button>
      </div>
      
      <DndContext
        sensors={sensors}
        modifiers={[restrictToParentElement]}
        onDragStart={(event) => setActiveWidget(event.active.id as string)}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-12 gap-4 auto-rows-[100px]">
          <SortableContext items={widgets.map(w => w.id)}>
            {widgets.map((widget) => (
              <Widget
                key={widget.id}
                widget={widget}
                isActive={activeWidget === widget.id}
                onResize={handleResize}
                onSettingsChange={handleSettingsChange}
                onRemove={onRemoveWidget}
                editable={isEditing}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
      
      {widgets.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Your dashboard is empty</p>
          {isEditing ? (
            <button
              onClick={() => {
                // This would typically trigger adding a default widget
                // But we'll let the parent component handle this
              }}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Your First Widget
            </button>
          ) : (
            <button
              onClick={toggleEditMode}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Edit Dashboard
            </button>
          )}
        </div>
      )}
    </div>
  );
} 