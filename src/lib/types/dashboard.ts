import { ReactNode } from 'react';

// Widget types
export type WidgetType = 
  | 'chores'
  | 'calendar'
  | 'weather'
  | 'shopping'
  | 'family'
  | 'notes'
  | 'routines';

// Widget data structure
export interface WidgetData {
  id: string;
  type: WidgetType;
  title: string;
  width: number;
  height: number;
  x: number;
  y: number;
  settings?: Record<string, any>;
}

// Widget definition for registry
export interface WidgetDefinition {
  type: WidgetType;
  name: string;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  component: React.ComponentType<WidgetComponentProps>;
  settingsComponent?: React.ComponentType<WidgetSettingsProps>;
  defaultSettings?: Record<string, any>;
}

// Props for widget components
export interface WidgetComponentProps {
  widget: WidgetData;
  isEditing: boolean;
}

// Props for widget settings components
export interface WidgetSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (settings: Record<string, any>) => void;
}

// Dashboard layout
export interface DashboardLayout {
  widgets: WidgetData[];
}

// Widget position
export interface WidgetPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Widget resize event
export interface WidgetResizeEvent {
  id: string;
  width: number;
  height: number;
}

// Widget settings change event
export interface WidgetSettingsChangeEvent {
  id: string;
  settings: Record<string, any>;
}

// Widget remove event
export interface WidgetRemoveEvent {
  id: string;
} 