import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserCalendars, getCalendarEvents } from '@/lib/google/calendar';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const calendarId = searchParams.get('calendarId') || 'primary';
    
    // Parse date parameters if provided
    let timeMin: Date | undefined;
    let timeMax: Date | undefined;
    
    const timeMinParam = searchParams.get('timeMin');
    const timeMaxParam = searchParams.get('timeMax');
    
    if (timeMinParam) {
      timeMin = new Date(timeMinParam);
    }
    
    if (timeMaxParam) {
      timeMax = new Date(timeMaxParam);
    }
    
    // Determine what to fetch based on the 'type' parameter
    const type = searchParams.get('type');
    
    if (type === 'calendars') {
      // Fetch list of calendars
      const calendars = await getUserCalendars();
      
      if (!calendars) {
        return NextResponse.json(
          { error: 'Failed to fetch calendars' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ calendars });
    } else {
      // Default: fetch events from the specified calendar
      const events = await getCalendarEvents(
        calendarId,
        timeMin,
        timeMax
      );
      
      if (!events) {
        return NextResponse.json(
          { error: 'Failed to fetch events' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ events });
    }
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 