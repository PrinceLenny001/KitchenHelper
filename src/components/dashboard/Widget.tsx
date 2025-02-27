"use client";

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WidgetData } from '@/lib/types/dashboard';
import { WidgetRegistry } from '@/lib/widgets/registry';
import { X as XIcon, Settings as SettingsIcon, Maximize as MaximizeIcon, Minimize as MinimizeIcon } from 'lucide-react';

export interface WidgetProps {
  widget: WidgetData;
  isActive: boolean;
  onResize: (id: string, width: number, height: number) => void;
  onSettingsChange: (id: string, settings: Record<string, any>) => void;
  onRemove: (id: string) => void;
  editable: boolean;
}

export function Widget({ widget, isActive, onResize, onSettingsChange, onRemove, editable }: WidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: widget.id,
    disabled: !editable || showSettings,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${widget.width} / span ${widget.width}`,
    gridRow: `span ${widget.height} / span ${widget.height}`,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };
  
  const widgetDef = WidgetRegistry.getInstance().getWidget(widget.type);
  
  if (!widgetDef) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-red-500"
      >
        <div className="text-red-500 font-semibold">Unknown widget type: {widget.type}</div>
      </div>
    );
  }
  
  const WidgetComponent = widgetDef.component;
  const SettingsComponent = widgetDef.settingsComponent;
  
  const handleIncreaseWidth = () => {
    if (widget.width < 12) {
      onResize(widget.id, widget.width + 1, widget.height);
    }
  };
  
  const handleDecreaseWidth = () => {
    if (widget.width > widgetDef.minWidth) {
      onResize(widget.id, widget.width - 1, widget.height);
    }
  };
  
  const handleIncreaseHeight = () => {
    onResize(widget.id, widget.width, widget.height + 1);
  };
  
  const handleDecreaseHeight = () => {
    if (widget.height > widgetDef.minHeight) {
      onResize(widget.id, widget.width, widget.height - 1);
    }
  };
  
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  const handleSettingsChange = (newSettings: Record<string, any>) => {
    onSettingsChange(widget.id, newSettings);
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden
        ${isActive ? 'ring-2 ring-blue-500' : ''}
        ${editable ? 'cursor-grab' : ''}
        ${isDragging ? 'cursor-grabbing' : ''}
      `}
    >
      <div
        className={`
          flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-700
          ${editable ? 'cursor-grab' : ''}
        `}
        {...(editable ? { ...attributes, ...listeners } : {})}
      >
        <h3 className="font-medium text-sm truncate">{widget.title}</h3>
        
        {editable && (
          <div className="flex items-center space-x-1">
            {SettingsComponent && (
              <button
                onClick={toggleSettings}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => setIsResizing(!isResizing)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isResizing ? (
                <MinimizeIcon className="w-4 h-4" />
              ) : (
                <MaximizeIcon className="w-4 h-4" />
              )}
            </button>
            
            <button
              onClick={() => onRemove(widget.id)}
              className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {isResizing && editable && (
        <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Width:</span>
            <button
              onClick={handleDecreaseWidth}
              disabled={widget.width <= widgetDef.minWidth}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            >
              -
            </button>
            <span className="text-xs">{widget.width}</span>
            <button
              onClick={handleIncreaseWidth}
              disabled={widget.width >= 12}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            >
              +
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Height:</span>
            <button
              onClick={handleDecreaseHeight}
              disabled={widget.height <= widgetDef.minHeight}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            >
              -
            </button>
            <span className="text-xs">{widget.height}</span>
            <button
              onClick={handleIncreaseHeight}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              +
            </button>
          </div>
        </div>
      )}
      
      <div className="p-3 h-full">
        {showSettings && SettingsComponent ? (
          <SettingsComponent
            settings={widget.settings}
            onSettingsChange={handleSettingsChange}
            onClose={toggleSettings}
          />
        ) : (
          <WidgetComponent
            widget={widget}
            isEditing={editable}
            onSettingsChange={(settings) => handleSettingsChange(settings)}
          />
        )}
      </div>
    </div>
  );
} 