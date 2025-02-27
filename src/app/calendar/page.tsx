import { Calendar } from '@/components/calendar/Calendar';
import { VerticalLayout } from '@/components/layout/VerticalLayout';

export const dynamic = 'force-dynamic';

export default function CalendarPage() {
  return (
    <VerticalLayout>
      <div className="h-full p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full overflow-hidden">
          <Calendar />
        </div>
      </div>
    </VerticalLayout>
  );
} 