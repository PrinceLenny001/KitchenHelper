"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { WidgetData, WidgetType } from '@/lib/types/dashboard';
import { useDashboard } from '@/hooks/useDashboard';
import { WidgetRegistry } from '@/lib/widgets/registry';
import { Widget } from '@/components/dashboard/Widget';
import { Button } from '@/components/ui/Button';
import { PlusIcon } from 'lucide-react';

export default function DashboardPage() {
  const { widgets, isLoading, error, fetchWidgets, saveWidgets, addWidget, removeWidget } = useDashboard();
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
  
  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex(widget => widget.id === active.id);
      const newIndex = widgets.findIndex(widget => widget.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newWidgets = arrayMove(widgets, oldIndex, newIndex);
        saveWidgets(newWidgets);
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
    
    saveWidgets(newWidgets);
  };
  
  const handleSettingsChange = (id: string, settings: Record<string, any>) => {
    const newWidgets = widgets.map(widget => {
      if (widget.id === id) {
        return { ...widget, settings };
      }
      return widget;
    });
    
    saveWidgets(newWidgets);
  };
  
  const handleAddWidget = async (type: WidgetType) => {
    try {
      const widgetDef = WidgetRegistry.getWidget(type);
      
      if (!widgetDef) {
        toast.error(`Widget type ${type} not found`);
        return;
      }
      
      await addWidget({
        type,
        title: widgetDef.name,
        width: widgetDef.defaultWidth,
        height: widgetDef.defaultHeight,
        x: 0,
        y: 0,
        settings: widgetDef.defaultSettings || {},
      });
      
      toast.success('Widget added successfully');
    } catch (error) {
      console.error('Error adding widget:', error);
      toast.error('Failed to add widget');
    }
  };
  
  const handleRemoveWidget = async (id: string) => {
    try {
      await removeWidget(id);
      toast.success('Widget removed successfully');
    } catch (error) {
      console.error('Error removing widget:', error);
      toast.error('Failed to remove widget');
    }
  };
  
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error loading dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button onClick={fetchWidgets}>Retry</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex space-x-4">
          <Button onClick={toggleEditMode} variant={isEditing ? "primary" : "outline"}>
            {isEditing ? 'Done' : 'Edit Dashboard'}
          </Button>
          {isEditing && (
            <div className="relative group">
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Widget
              </Button>
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
                <div className="py-1">
                  {WidgetRegistry.getAllWidgets().map((widget) => (
                    <button
                      key={widget.type}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleAddWidget(widget.type)}
                    >
                      {widget.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
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
                onRemove={handleRemoveWidget}
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
            <Button onClick={() => handleAddWidget('chores')}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Your First Widget
            </Button>
          ) : (
            <Button onClick={toggleEditMode}>
              Edit Dashboard
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 