import { google, calendar_v3 } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Create a Google Calendar API client
export const getGoogleCalendarClient = async (): Promise<calendar_v3.Calendar | null> => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      console.error('No access token found in session');
      return null;
    }
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });
    
    return google.calendar({ version: 'v3', auth: oauth2Client });
  } catch (error) {
    console.error('Error creating Google Calendar client:', error);
    return null;
  }
};

// Get a list of the user's calendars
export const getUserCalendars = async (): Promise<calendar_v3.Schema$CalendarListEntry[] | null> => {
  try {
    const calendarClient = await getGoogleCalendarClient();
    
    if (!calendarClient) {
      return null;
    }
    
    const response = await calendarClient.calendarList.list();
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching user calendars:', error);
    return null;
  }
};

// Get events from a specific calendar
export const getCalendarEvents = async (
  calendarId: string = 'primary',
  timeMin: Date = new Date(),
  timeMax: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
): Promise<calendar_v3.Schema$Event[] | null> => {
  try {
    const calendarClient = await getGoogleCalendarClient();
    
    if (!calendarClient) {
      return null;
    }
    
    const response = await calendarClient.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return null;
  }
};

// Create a new event in a calendar
export const createCalendarEvent = async (
  calendarId: string = 'primary',
  event: calendar_v3.Schema$Event
): Promise<calendar_v3.Schema$Event | null> => {
  try {
    const calendarClient = await getGoogleCalendarClient();
    
    if (!calendarClient) {
      return null;
    }
    
    const response = await calendarClient.events.insert({
      calendarId,
      requestBody: event,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
};

// Update an existing event
export const updateCalendarEvent = async (
  calendarId: string = 'primary',
  eventId: string,
  event: calendar_v3.Schema$Event
): Promise<calendar_v3.Schema$Event | null> => {
  try {
    const calendarClient = await getGoogleCalendarClient();
    
    if (!calendarClient) {
      return null;
    }
    
    const response = await calendarClient.events.update({
      calendarId,
      eventId,
      requestBody: event,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return null;
  }
};

// Delete an event
export const deleteCalendarEvent = async (
  calendarId: string = 'primary',
  eventId: string
): Promise<boolean> => {
  try {
    const calendarClient = await getGoogleCalendarClient();
    
    if (!calendarClient) {
      return false;
    }
    
    await calendarClient.events.delete({
      calendarId,
      eventId,
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
}; 