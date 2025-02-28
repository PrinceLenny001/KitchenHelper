import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { WidgetType } from '@/lib/types/dashboard';

// Schema for widget creation
const widgetCreateSchema = z.object({
  type: z.string() as z.ZodType<WidgetType>,
  title: z.string(),
  width: z.number().int().positive().default(1),
  height: z.number().int().positive().default(1),
  positionX: z.number().int().default(0),
  positionY: z.number().int().default(0),
  settings: z.string().optional(),
});

// Schema for widget update
const widgetUpdateSchema = z.object({
  id: z.string(),
  type: z.string() as z.ZodType<WidgetType>,
  title: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  positionX: z.number().int(),
  positionY: z.number().int(),
  settings: z.string().optional(),
});

// Type for validated widget update data
type ValidatedWidgetUpdate = z.infer<typeof widgetUpdateSchema>;

// GET /api/dashboard/widgets - Get all widgets for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const widgets = await prisma.dashboardWidget.findMany({
      where: { userId: user.id },
      orderBy: { positionY: 'asc' },
    });
    
    return NextResponse.json({ widgets });
  } catch (error) {
    console.error('Error fetching widgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch widgets' },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/widgets - Create a new widget
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const body = await req.json();
    
    const { type, title, width, height, positionX, positionY, settings } = body;
    
    if (!type || !title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      );
    }
    
    // Validate settings is valid JSON if provided
    let settingsString = '{}';
    if (settings) {
      try {
        // If settings is already a string, use it directly
        if (typeof settings === 'string') {
          // Verify it's valid JSON by parsing and stringifying
          JSON.parse(settings);
          settingsString = settings;
        } else {
          // If it's an object, stringify it
          settingsString = JSON.stringify(settings);
        }
      } catch (error) {
        console.error('Invalid settings JSON:', error);
        return NextResponse.json(
          { error: 'Invalid settings format' },
          { status: 400 }
        );
      }
    }
    
    const widget = await prisma.dashboardWidget.create({
      data: {
        userId: user.id,
        type,
        title,
        width: width || 1,
        height: height || 1,
        positionX: positionX || 0,
        positionY: positionY || 0,
        settings: settingsString,
      },
    });
    
    return NextResponse.json(widget, { status: 201 });
  } catch (error) {
    console.error('Error creating widget:', error);
    return NextResponse.json(
      { error: 'Failed to create widget' },
      { status: 500 }
    );
  }
}

// PUT /api/dashboard/widgets - Update widgets
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const body = await req.json();
    
    if (!body.widgets || !Array.isArray(body.widgets)) {
      return NextResponse.json(
        { error: 'Widgets array is required' },
        { status: 400 }
      );
    }
    
    // Update each widget in a transaction
    await prisma.$transaction(
      body.widgets.map((widget: any) => {
        // Validate settings is valid JSON if provided
        let settingsString = widget.settings;
        if (widget.settings) {
          try {
            // If settings is already a string, use it directly
            if (typeof widget.settings === 'string') {
              // Verify it's valid JSON by parsing and stringifying
              JSON.parse(widget.settings);
              settingsString = widget.settings;
            } else {
              // If it's an object, stringify it
              settingsString = JSON.stringify(widget.settings);
            }
          } catch (error) {
            console.error(`Invalid settings JSON for widget ${widget.id}:`, error);
            // Use empty object as fallback
            settingsString = '{}';
          }
        }

        return prisma.dashboardWidget.update({
          where: {
            id: widget.id,
            userId: user.id, // Ensure the widget belongs to the user
          },
          data: {
            type: widget.type,
            title: widget.title,
            width: widget.width,
            height: widget.height,
            positionX: widget.positionX,
            positionY: widget.positionY,
            settings: settingsString,
          },
        });
      })
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating widgets:', error);
    return NextResponse.json(
      { error: 'Failed to update widgets' },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboard/widgets?id=... - Delete a widget
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Widget ID is required' },
        { status: 400 }
      );
    }
    
    await prisma.dashboardWidget.delete({
      where: {
        id,
        userId: user.id, // Ensure the widget belongs to the user
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting widget:', error);
    return NextResponse.json(
      { error: 'Failed to delete widget' },
      { status: 500 }
    );
  }
} 