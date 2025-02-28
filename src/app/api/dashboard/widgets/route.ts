import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { WidgetType } from '@/lib/types/dashboard';
import { errorResponse, successResponse, handleApiError, safeParseJson } from '@/lib/utils/api';

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
      return errorResponse('Unauthorized', 401);
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return errorResponse('User not found', 404);
    }
    
    const widgets = await prisma.dashboardWidget.findMany({
      where: { userId: user.id },
      orderBy: { positionY: 'asc' },
    });
    
    return successResponse({ widgets });
  } catch (error) {
    console.error('Error fetching widgets:', error);
    return handleApiError(error);
  }
}

// POST /api/dashboard/widgets - Create a new widget
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return errorResponse('Unauthorized', 401);
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return errorResponse('User not found', 404);
    }
    
    const body = await safeParseJson(req);
    
    if (!body) {
      return errorResponse('Invalid request body', 400);
    }
    
    // Validate with Zod
    const result = widgetCreateSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(`Validation error: ${result.error.message}`, 400);
    }
    
    const { type, title, width, height, positionX, positionY, settings } = result.data;
    
    const widget = await prisma.dashboardWidget.create({
      data: {
        userId: user.id,
        type,
        title,
        width,
        height,
        positionX,
        positionY,
        settings: settings || '{}',
      },
    });
    
    return successResponse(widget, 201);
  } catch (error) {
    console.error('Error creating widget:', error);
    return handleApiError(error);
  }
}

// PUT /api/dashboard/widgets - Update widgets
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return errorResponse('Unauthorized', 401);
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return errorResponse('User not found', 404);
    }
    
    const body = await safeParseJson(req);
    
    if (!body || !body.widgets || !Array.isArray(body.widgets)) {
      return errorResponse('Widgets array is required', 400);
    }
    
    // Update each widget in a transaction
    await prisma.$transaction(
      body.widgets.map((widget: any) => {
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
            settings: widget.settings,
          },
        });
      })
    );
    
    return successResponse({ success: true });
  } catch (error) {
    console.error('Error updating widgets:', error);
    return handleApiError(error);
  }
}

// DELETE /api/dashboard/widgets?id=... - Delete a widget
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return errorResponse('Unauthorized', 401);
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return errorResponse('User not found', 404);
    }
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return errorResponse('Widget ID is required', 400);
    }
    
    await prisma.dashboardWidget.delete({
      where: {
        id,
        userId: user.id, // Ensure the widget belongs to the user
      },
    });
    
    return successResponse({ success: true });
  } catch (error) {
    console.error('Error deleting widget:', error);
    return handleApiError(error);
  }
} 