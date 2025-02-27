import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

// Widget types
export type WidgetType = 
  | 'calendar'
  | 'weather'
  | 'chores'
  | 'clock'
  | 'family'
  | 'notes';

// Widget data structure
export interface WidgetData {
  id: string;
  type: WidgetType;
  title: string;
  width: number;
  height: number;
  x: number;
  y: number;
  settings: Record<string, any>;
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
  defaultSettings: Record<string, any>;
  component: React.ComponentType<WidgetComponentProps>;
  settingsComponent?: React.ComponentType<WidgetSettingsProps>;
  icon: LucideIcon;
}

// Props for widget components
export interface WidgetComponentProps {
  widget: WidgetData;
  isEditing: boolean;
  onSettingsChange?: (settings: Record<string, any>) => void;
}

// Props for widget settings components
export interface WidgetSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (settings: Record<string, any>) => void;
  onClose: () => void;
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