import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema for creating/updating a chore
const choreSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  recurrencePattern: z.enum(['DAILY', 'WEEKDAYS', 'WEEKENDS', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM', 'ONCE']),
  customRecurrence: z.string().optional(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  estimatedMinutes: z.number().int().positive().default(15),
  isActive: z.boolean().default(true),
  familyMemberIds: z.array(z.string()).optional(),
});

// GET /api/chores - Get all chores for the current user
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
    const familyMemberId = url.searchParams.get('familyMemberId');
    
    // Build the query
    const query: any = {
      where: {
        userId: user.id,
      },
      include: {
        assignments: {
          include: {
            familyMember: true,
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
    
    // Filter by family member if provided
    if (familyMemberId) {
      query.where.assignments = {
        some: {
          familyMemberId,
        },
      };
    }
    
    const chores = await prisma.chore.findMany(query);
    
    return NextResponse.json(chores);
  } catch (error) {
    console.error('Error fetching chores:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/chores - Create a new chore
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
    const validationResult = choreSchema.safeParse(body);
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
      priority, 
      estimatedMinutes, 
      isActive,
      familyMemberIds 
    } = validationResult.data;
    
    // Create the chore in a transaction to ensure assignments are created atomically
    const chore = await prisma.$transaction(async (tx) => {
      // Create the chore
      const newChore = await tx.chore.create({
        data: {
          name,
          description,
          recurrencePattern,
          customRecurrence,
          startDate,
          endDate,
          priority,
          estimatedMinutes,
          isActive,
          userId: user.id,
        },
      });
      
      // Create assignments if family members are provided
      if (familyMemberIds && familyMemberIds.length > 0) {
        await Promise.all(
          familyMemberIds.map(async (familyMemberId) => {
            await tx.choreAssignment.create({
              data: {
                choreId: newChore.id,
                familyMemberId,
              },
            });
          })
        );
      }
      
      // Return the chore with assignments
      return tx.chore.findUnique({
        where: { id: newChore.id },
        include: {
          assignments: {
            include: {
              familyMember: true,
            },
          },
        },
      });
    });
    
    return NextResponse.json(chore, { status: 201 });
  } catch (error) {
    console.error('Error creating chore:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/chores?id={id} - Update a chore
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
    
    // Get the chore ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Chore ID is required' }, { status: 400 });
    }
    
    // Check if the chore exists and belongs to the user
    const existingChore = await prisma.chore.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });
    
    if (!existingChore) {
      return NextResponse.json({ error: 'Chore not found' }, { status: 404 });
    }
    
    const body = await request.json();
    
    // Validate the request body
    const validationResult = choreSchema.safeParse(body);
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
      priority, 
      estimatedMinutes, 
      isActive,
      familyMemberIds 
    } = validationResult.data;
    
    // Update the chore in a transaction to ensure assignments are updated atomically
    const chore = await prisma.$transaction(async (tx) => {
      // Update the chore
      const updatedChore = await tx.chore.update({
        where: { id },
        data: {
          name,
          description,
          recurrencePattern,
          customRecurrence,
          startDate,
          endDate,
          priority,
          estimatedMinutes,
          isActive,
        },
      });
      
      // Update assignments if family members are provided
      if (familyMemberIds) {
        // Delete existing assignments
        await tx.choreAssignment.deleteMany({
          where: { choreId: id },
        });
        
        // Create new assignments
        if (familyMemberIds.length > 0) {
          await Promise.all(
            familyMemberIds.map(async (familyMemberId) => {
              await tx.choreAssignment.create({
                data: {
                  choreId: id,
                  familyMemberId,
                },
              });
            })
          );
        }
      }
      
      // Return the chore with assignments
      return tx.chore.findUnique({
        where: { id },
        include: {
          assignments: {
            include: {
              familyMember: true,
            },
          },
        },
      });
    });
    
    return NextResponse.json(chore);
  } catch (error) {
    console.error('Error updating chore:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/chores?id={id} - Delete a chore
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
    
    // Get the chore ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Chore ID is required' }, { status: 400 });
    }
    
    // Check if the chore exists and belongs to the user
    const existingChore = await prisma.chore.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });
    
    if (!existingChore) {
      return NextResponse.json({ error: 'Chore not found' }, { status: 404 });
    }
    
    // Delete the chore (cascade will delete assignments)
    await prisma.chore.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chore:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 