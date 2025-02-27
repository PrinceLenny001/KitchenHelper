"use client";

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings, X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WidgetData } from '@/lib/types/dashboard';
import { WidgetRegistry } from '@/lib/widgets/registry';

interface WidgetProps {
  widget: WidgetData;
  isActive: boolean;
  onResize?: (size: { width: number; height: number }) => void;
  onSettingsChange: (settings: Record<string, any>) => void;
  onRemove?: () => void;
  editable?: boolean;
}

export const Widget: React.FC<WidgetProps> = ({
  widget,
  isActive,
  onResize,
  onSettingsChange,
  onRemove,
  editable = false,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: widget.id,
    disabled: !editable,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const widgetDefinition = WidgetRegistry.getWidget(widget.type);
  
  if (!widgetDefinition) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
      >
        <div className="text-red-500">Unknown widget type: {widget.type}</div>
      </div>
    );
  }
  
  const WidgetComponent = widgetDefinition.component;
  const SettingsComponent = widgetDefinition.settingsComponent;
  
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    
    if (onResize) {
      if (!isExpanded) {
        // Expand to full width and double height
        onResize({ width: 12, height: widget.height * 2 });
      } else {
        // Restore original size
        onResize({ width: widgetDefinition.defaultWidth, height: widgetDefinition.defaultHeight });
      }
    }
  };
  
  const expandedClass = isExpanded
    ? 'col-span-full row-span-2'
    : `col-span-${widget.width} row-span-${widget.height}`;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col ${expandedClass} ${
        isActive ? 'ring-2 ring-blue-500 z-10' : ''
      }`}
      {...attributes}
    >
      {/* Widget Header */}
      <div
        className={`flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 ${
          editable ? 'cursor-move' : ''
        }`}
        {...(editable ? listeners : {})}
      >
        <h3 className="font-medium truncate">{widget.title}</h3>
        
        <div className="flex items-center space-x-1">
          {SettingsComponent && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          )}
          
          {onResize && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleExpand}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isExpanded ? 'Minimize' : 'Maximize'}
              </span>
            </Button>
          )}
          
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Widget Content */}
      <div className="flex-grow overflow-auto p-4">
        {showSettings && SettingsComponent ? (
          <SettingsComponent
            settings={widget.settings}
            onSettingsChange={onSettingsChange}
          />
        ) : (
          <WidgetComponent
            data={widget}
            onSettingsChange={onSettingsChange}
          />
        )}
      </div>
    </div>
  );
}; 