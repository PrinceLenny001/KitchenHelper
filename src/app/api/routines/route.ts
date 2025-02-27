import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema for creating/updating a routine
const routineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  recurrencePattern: z.enum(['DAILY', 'WEEKDAYS', 'WEEKENDS', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM', 'ONCE']),
  customRecurrence: z.string().optional(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  estimatedMinutes: z.number().int().positive().default(30),
  isActive: z.boolean().default(true),
  steps: z.array(z.object({
    id: z.string().optional(), // Optional for new steps
    name: z.string().min(1, 'Step name is required'),
    description: z.string().optional(),
    order: z.number().int().nonnegative(),
    estimatedMinutes: z.number().int().positive().default(5),
  })),
});

// GET /api/routines - Get all routines for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const active = url.searchParams.get('active');
    
    // Build the query
    const query: any = {
      where: {
        userId: user.id,
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    };
    
    // Filter by active status if provided
    if (active !== null) {
      query.where.isActive = active === 'true';
    }
    
    const routines = await prisma.routine.findMany(query);
    
    return NextResponse.json(routines);
  } catch (error) {
    console.error('Error fetching routines:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/routines - Create a new routine
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const body = await request.json();
    
    // Validate the request body
    const validationResult = routineSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { 
      name, 
      description, 
      recurrencePattern, 
      customRecurrence, 
      startDate, 
      endDate, 
      estimatedMinutes, 
      isActive,
      steps 
    } = validationResult.data;
    
    // Create the routine in a transaction to ensure steps are created atomically
    const routine = await prisma.$transaction(async (tx) => {
      // Create the routine
      const newRoutine = await tx.routine.create({
        data: {
          name,
          description,
          recurrencePattern,
          customRecurrence,
          startDate,
          endDate,
          estimatedMinutes,
          isActive,
          userId: user.id,
        },
      });
      
      // Create steps if provided
      if (steps && steps.length > 0) {
        await Promise.all(
          steps.map(async (step) => {
            await tx.routineStep.create({
              data: {
                routineId: newRoutine.id,
                name: step.name,
                description: step.description,
                order: step.order,
                estimatedMinutes: step.estimatedMinutes,
              },
            });
          })
        );
      }
      
      // Return the routine with steps
      return tx.routine.findUnique({
        where: { id: newRoutine.id },
        include: {
          steps: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    });
    
    return NextResponse.json(routine, { status: 201 });
  } catch (error) {
    console.error('Error creating routine:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/routines?id={id} - Update a routine
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get the routine ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Routine ID is required' }, { status: 400 });
    }
    
    // Check if the routine exists and belongs to the user
    const existingRoutine = await prisma.routine.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });
    
    if (!existingRoutine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }
    
    const body = await request.json();
    
    // Validate the request body
    const validationResult = routineSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { 
      name, 
      description, 
      recurrencePattern, 
      customRecurrence, 
      startDate, 
      endDate, 
      estimatedMinutes, 
      isActive,
      steps 
    } = validationResult.data;
    
    // Update the routine in a transaction to ensure steps are updated atomically
    const routine = await prisma.$transaction(async (tx) => {
      // Update the routine
      const updatedRoutine = await tx.routine.update({
        where: { id },
        data: {
          name,
          description,
          recurrencePattern,
          customRecurrence,
          startDate,
          endDate,
          estimatedMinutes,
          isActive,
        },
      });
      
      // Delete existing steps
      await tx.routineStep.deleteMany({
        where: { routineId: id },
      });
      
      // Create new steps
      if (steps && steps.length > 0) {
        await Promise.all(
          steps.map(async (step) => {
            await tx.routineStep.create({
              data: {
                routineId: id,
                name: step.name,
                description: step.description,
                order: step.order,
                estimatedMinutes: step.estimatedMinutes,
              },
            });
          })
        );
      }
      
      // Return the routine with steps
      return tx.routine.findUnique({
        where: { id },
        include: {
          steps: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    });
    
    return NextResponse.json(routine);
  } catch (error) {
    console.error('Error updating routine:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/routines?id={id} - Delete a routine
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get the routine ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Routine ID is required' }, { status: 400 });
    }
    
    // Check if the routine exists and belongs to the user
    const existingRoutine = await prisma.routine.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });
    
    if (!existingRoutine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }
    
    // Delete the routine (cascade will delete steps)
    await prisma.routine.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting routine:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 