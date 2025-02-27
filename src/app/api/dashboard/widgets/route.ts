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
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get widgets
    // @ts-ignore - Prisma client has been generated with the DashboardWidget model
    const widgets = await prisma.dashboardWidget.findMany({
      where: { userId: user.id },
      orderBy: [
        { positionY: 'asc' },
        { positionX: 'asc' },
      ],
    });
    
    return NextResponse.json({ widgets });
  } catch (error) {
    console.error('Error fetching widgets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/widgets - Create a new widget
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    
    const validationResult = widgetCreateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid widget data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { type, title, width, height, positionX, positionY, settings } = validationResult.data;
    
    // Create widget
    // @ts-ignore - Prisma client has been generated with the DashboardWidget model
    const widget = await prisma.dashboardWidget.create({
      data: {
        userId: user.id,
        type,
        title,
        width,
        height,
        positionX,
        positionY,
        settings,
      },
    });
    
    return NextResponse.json(widget, { status: 201 });
  } catch (error) {
    console.error('Error creating widget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/dashboard/widgets - Update multiple widgets
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    
    if (!body.widgets || !Array.isArray(body.widgets)) {
      return NextResponse.json(
        { error: 'Invalid request body, expected widgets array' },
        { status: 400 }
      );
    }
    
    // Validate each widget
    const validationResults = body.widgets.map((widget: any) => 
      widgetUpdateSchema.safeParse(widget)
    );
    
    // @ts-ignore - We know the type is z.SafeParseReturnType<any, any>
    const invalidWidgets = validationResults.filter((result) => !result.success);
    
    if (invalidWidgets.length > 0) {
      return NextResponse.json(
        { 
          error: 'Invalid widget data', 
          // @ts-ignore - We know these are errors
          details: invalidWidgets.map((result) => 
            result.error.format()
          ) 
        },
        { status: 400 }
      );
    }
    
    // Get valid widgets
    // @ts-ignore - We know the type is z.SafeParseReturnType<any, any>
    const validWidgets = validationResults
      .filter((result: any): result is z.SafeParseSuccess<ValidatedWidgetUpdate> => result.success)
      // @ts-ignore - We know the type is z.SafeParseSuccess<ValidatedWidgetUpdate>
      .map((result) => result.data);
    
    // Verify all widgets belong to the user
    const widgetIds = validWidgets.map((widget: ValidatedWidgetUpdate) => widget.id);
    
    // @ts-ignore - Prisma client has been generated with the DashboardWidget model
    const existingWidgets = await prisma.dashboardWidget.findMany({
      where: {
        id: { in: widgetIds },
        userId: user.id,
      },
    });
    
    if (existingWidgets.length !== widgetIds.length) {
      return NextResponse.json(
        { error: 'One or more widgets not found or do not belong to the user' },
        { status: 404 }
      );
    }
    
    // Update widgets
    const updatePromises = validWidgets.map((widget: ValidatedWidgetUpdate) => 
      // @ts-ignore - Prisma client has been generated with the DashboardWidget model
      prisma.dashboardWidget.update({
        where: { id: widget.id },
        data: {
          type: widget.type,
          title: widget.title,
          width: widget.width,
          height: widget.height,
          positionX: widget.positionX,
          positionY: widget.positionY,
          settings: widget.settings,
        },
      })
    );
    
    await Promise.all(updatePromises);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating widgets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboard/widgets?id={id} - Delete a widget
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get widget ID from query params
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Widget ID is required' },
        { status: 400 }
      );
    }
    
    // Check if widget exists and belongs to the user
    // @ts-ignore - Prisma client has been generated with the DashboardWidget model
    const widget = await prisma.dashboardWidget.findUnique({
      where: { id },
    });
    
    if (!widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      );
    }
    
    if (widget.userId !== user.id) {
      return NextResponse.json(
        { error: 'Widget does not belong to the user' },
        { status: 403 }
      );
    }
    
    // Delete widget
    // @ts-ignore - Prisma client has been generated with the DashboardWidget model
    await prisma.dashboardWidget.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting widget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 