import { WidgetDefinition, WidgetType } from '../types/dashboard';
import { ChoresWidget } from '@/components/widgets/ChoresWidget';
import { CalendarWidget } from '@/components/widgets/CalendarWidget';
import { FamilyWidget } from '@/components/widgets/FamilyWidget';
import { NotesWidget } from '@/components/widgets/NotesWidget';

class WidgetRegistryClass {
  private widgets: Map<WidgetType, WidgetDefinition> = new Map();

  registerWidget(widget: WidgetDefinition) {
    this.widgets.set(widget.type, widget);
  }

  getWidget(type: WidgetType): WidgetDefinition | undefined {
    return this.widgets.get(type);
  }

  getAllWidgets(): WidgetDefinition[] {
    return Array.from(this.widgets.values());
  }
}

export const WidgetRegistry = new WidgetRegistryClass();

// Register built-in widgets
WidgetRegistry.registerWidget({
  type: 'chores',
  name: 'Chores',
  description: 'Display and manage your chores',
  defaultWidth: 3,
  defaultHeight: 3,
  minWidth: 2,
  minHeight: 2,
  component: ChoresWidget,
  defaultSettings: {
    showCompleted: false,
    familyMemberId: null,
    sortBy: 'dueDate',
  },
});

WidgetRegistry.registerWidget({
  type: 'calendar',
  name: 'Calendar',
  description: 'View your calendar with events, chores, and routines',
  defaultWidth: 4,
  defaultHeight: 4,
  minWidth: 3,
  minHeight: 3,
  component: CalendarWidget,
  defaultSettings: {
    showChores: true,
    showRoutines: true,
    showEvents: true,
  },
});

WidgetRegistry.registerWidget({
  type: 'family',
  name: 'Family Members',
  description: 'View and manage your family members',
  defaultWidth: 3,
  defaultHeight: 3,
  minWidth: 2,
  minHeight: 2,
  component: FamilyWidget,
  defaultSettings: {
    showAvatars: true,
    showBirthdays: true,
  },
});

WidgetRegistry.registerWidget({
  type: 'notes',
  name: 'Notes',
  description: 'Quick notes and reminders',
  defaultWidth: 3,
  defaultHeight: 3,
  minWidth: 2,
  minHeight: 2,
  component: NotesWidget,
  defaultSettings: {
    title: 'Quick Notes',
    note: '',
  },
}); 