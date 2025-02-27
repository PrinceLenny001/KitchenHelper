import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema for creating a chore completion
const choreCompletionSchema = z.object({
  choreId: z.string().min(1, 'Chore ID is required'),
  familyMemberId: z.string().min(1, 'Family member ID is required'),
  completedAt: z.string().transform(str => new Date(str)).optional(),
  notes: z.string().optional(),
});

// GET /api/chores/completion - Get completions for a chore
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
    const choreId = url.searchParams.get('choreId');
    const familyMemberId = url.searchParams.get('familyMemberId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    // Build the query
    const query: any = {
      where: {
        chore: {
          userId: user.id,
        },
      },
      include: {
        chore: true,
        familyMember: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    };
    
    // Filter by chore ID if provided
    if (choreId) {
      query.where.choreId = choreId;
    }
    
    // Filter by family member ID if provided
    if (familyMemberId) {
      query.where.familyMemberId = familyMemberId;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      query.where.completedAt = {};
      
      if (startDate) {
        query.where.completedAt.gte = new Date(startDate);
      }
      
      if (endDate) {
        query.where.completedAt.lte = new Date(endDate);
      }
    }
    
    const completions = await prisma.choreCompletion.findMany(query);
    
    return NextResponse.json(completions);
  } catch (error) {
    console.error('Error fetching chore completions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/chores/completion - Create a new chore completion
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
    const validationResult = choreCompletionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { choreId, familyMemberId, completedAt, notes } = validationResult.data;
    
    // Check if the chore exists and belongs to the user
    const chore = await prisma.chore.findFirst({
      where: {
        id: choreId,
        userId: user.id,
      },
    });
    
    if (!chore) {
      return NextResponse.json({ error: 'Chore not found' }, { status: 404 });
    }
    
    // Check if the family member exists and belongs to the user
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        id: familyMemberId,
        userId: user.id,
      },
    });
    
    if (!familyMember) {
      return NextResponse.json({ error: 'Family member not found' }, { status: 404 });
    }
    
    // Create the chore completion
    const completion = await prisma.choreCompletion.create({
      data: {
        choreId,
        familyMemberId,
        completedAt: completedAt || new Date(),
        notes,
      },
      include: {
        chore: true,
        familyMember: true,
      },
    });
    
    return NextResponse.json(completion, { status: 201 });
  } catch (error) {
    console.error('Error creating chore completion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/chores/completion?id={id} - Delete a chore completion
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
    
    // Get the completion ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Completion ID is required' }, { status: 400 });
    }
    
    // Check if the completion exists and belongs to the user's chore
    const completion = await prisma.choreCompletion.findFirst({
      where: {
        id,
        chore: {
          userId: user.id,
        },
      },
    });
    
    if (!completion) {
      return NextResponse.json({ error: 'Completion not found' }, { status: 404 });
    }
    
    // Delete the completion
    await prisma.choreCompletion.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chore completion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 