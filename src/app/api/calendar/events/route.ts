import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent 
} from '@/lib/google/calendar';
import { z } from 'zod';

// Schema for event creation/update
const eventSchema = z.object({
  calendarId: z.string().optional().default('primary'),
  summary: z.string().min(1, 'Event title is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  start: z.object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
    timeZone: z.string().optional(),
  }).refine(data => data.dateTime || data.date, {
    message: 'Either dateTime or date must be provided',
  }),
  end: z.object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
    timeZone: z.string().optional(),
  }).refine(data => data.dateTime || data.date, {
    message: 'Either dateTime or date must be provided',
  }),
  colorId: z.string().optional(),
  attendees: z.array(
    z.object({
      email: z.string().email(),
      displayName: z.string().optional(),
      optional: z.boolean().optional(),
    })
  ).optional(),
  recurrence: z.array(z.string()).optional(),
  reminders: z.object({
    useDefault: z.boolean().optional(),
    overrides: z.array(
      z.object({
        method: z.string(),
        minutes: z.number(),
      })
    ).optional(),
  }).optional(),
});

// POST: Create a new event
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate event data
    const validationResult = eventSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid event data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const eventData = validationResult.data;
    const calendarId = eventData.calendarId || 'primary';
    
    // Remove calendarId from event data before sending to Google
    const { calendarId: _, ...eventDataWithoutCalendarId } = eventData;
    
    // Create the event
    const createdEvent = await createCalendarEvent(calendarId, eventDataWithoutCalendarId);
    
    if (!createdEvent) {
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ event: createdEvent });
  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing event
export async function PUT(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Get eventId from query parameters
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    // Validate event data
    const validationResult = eventSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid event data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const eventData = validationResult.data;
    const calendarId = eventData.calendarId || 'primary';
    
    // Remove calendarId from event data before sending to Google
    const { calendarId: _, ...eventDataWithoutCalendarId } = eventData;
    
    // Update the event
    const updatedEvent = await updateCalendarEvent(calendarId, eventId, eventDataWithoutCalendarId);
    
    if (!updatedEvent) {
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error('Event update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an event
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get parameters from query
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const calendarId = searchParams.get('calendarId') || 'primary';
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    // Delete the event
    const success = await deleteCalendarEvent(calendarId, eventId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Event deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 