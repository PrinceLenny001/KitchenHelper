import { WidgetDefinition, WidgetType } from '@/lib/types/dashboard';
import { ChoresWidget } from '@/components/widgets/ChoresWidget';
import { CalendarWidget } from '@/components/widgets/CalendarWidget';
import { FamilyWidget } from '@/components/widgets/FamilyWidget';
import { NotesWidget } from '@/components/widgets/NotesWidget';
import { CheckSquare, Calendar, Users, StickyNote } from 'lucide-react';

export class WidgetRegistry {
  private static instance: WidgetRegistry;
  private widgets: Map<WidgetType, WidgetDefinition>;

  private constructor() {
    this.widgets = new Map();
  }

  public static getInstance(): WidgetRegistry {
    if (!WidgetRegistry.instance) {
      WidgetRegistry.instance = new WidgetRegistry();
    }
    return WidgetRegistry.instance;
  }

  public registerWidget(widget: WidgetDefinition): void {
    this.widgets.set(widget.type, widget);
  }

  public getWidget(type: WidgetType): WidgetDefinition | undefined {
    return this.widgets.get(type);
  }

  public getAllWidgets(): WidgetDefinition[] {
    return Array.from(this.widgets.values());
  }
}

// Register built-in widgets
WidgetRegistry.getInstance().registerWidget({
  type: 'chores',
  name: 'Chores',
  description: 'Display and manage your chores',
  defaultWidth: 3,
  defaultHeight: 3,
  minWidth: 2,
  minHeight: 2,
  component: ChoresWidget,
  icon: CheckSquare,
  defaultSettings: {
    showCompleted: false,
    familyMemberId: null,
    sortBy: 'dueDate',
  },
});

WidgetRegistry.getInstance().registerWidget({
  type: 'calendar',
  name: 'Calendar',
  description: 'View your calendar with events, chores, and routines',
  defaultWidth: 4,
  defaultHeight: 4,
  minWidth: 3,
  minHeight: 3,
  component: CalendarWidget,
  icon: Calendar,
  defaultSettings: {
    showChores: true,
    showRoutines: true,
    showEvents: true,
  },
});

WidgetRegistry.getInstance().registerWidget({
  type: 'family',
  name: 'Family Members',
  description: 'View and manage your family members',
  defaultWidth: 3,
  defaultHeight: 3,
  minWidth: 2,
  minHeight: 2,
  component: FamilyWidget,
  icon: Users,
  defaultSettings: {
    showAvatars: true,
    showBirthdays: true,
  },
});

WidgetRegistry.getInstance().registerWidget({
  type: 'notes',
  name: 'Notes',
  description: 'Quick notes and reminders',
  defaultWidth: 3,
  defaultHeight: 3,
  minWidth: 2,
  minHeight: 2,
  component: NotesWidget,
  icon: StickyNote,
  defaultSettings: {
    title: 'Quick Notes',
    note: '',
  },
}); 