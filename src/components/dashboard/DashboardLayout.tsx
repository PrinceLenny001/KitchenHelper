"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { Widget } from './Widget';
import { WidgetData } from '@/lib/types/dashboard';

interface DashboardLayoutProps {
  widgets: WidgetData[];
  onLayoutChange: (widgets: WidgetData[]) => void;
  editable?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  widgets,
  onLayoutChange,
  editable = false,
}) => {
  const [items, setItems] = useState<WidgetData[]>(widgets);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Update items when widgets prop changes
  useEffect(() => {
    setItems(widgets);
  }, [widgets]);
  
  // Configure sensors for touch-friendly drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
      },
    })
  );
  
  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };
  
  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        onLayoutChange(newItems);
        return newItems;
      });
    }
    
    setActiveId(null);
  };
  
  // Handle widget resize
  const handleResize = (id: string, size: { width: number; height: number }) => {
    setItems((prevItems) => {
      const newItems = prevItems.map((item) => {
        if (item.id === id) {
          return { ...item, width: size.width, height: size.height };
        }
        return item;
      });
      
      onLayoutChange(newItems);
      return newItems;
    });
  };
  
  // Handle widget settings change
  const handleSettingsChange = (id: string, settings: any) => {
    setItems((prevItems) => {
      const newItems = prevItems.map((item) => {
        if (item.id === id) {
          return { ...item, settings };
        }
        return item;
      });
      
      onLayoutChange(newItems);
      return newItems;
    });
  };
  
  // Handle widget removal
  const handleRemove = (id: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== id);
      onLayoutChange(newItems);
      return newItems;
    });
  };
  
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToParentElement]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <SortableContext items={items.map(item => item.id)}>
          {items.map((widget) => (
            <Widget
              key={widget.id}
              widget={widget}
              isActive={widget.id === activeId}
              onResize={editable ? (size) => handleResize(widget.id, size) : undefined}
              onSettingsChange={(settings) => handleSettingsChange(widget.id, settings)}
              onRemove={editable ? () => handleRemove(widget.id) : undefined}
              editable={editable}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}; 