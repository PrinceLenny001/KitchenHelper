import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema for creating/updating a family member
const familyMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'),
  image: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
});

// GET /api/family-members - Get all family members for the current user
export async function GET() {
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
    
    const familyMembers = await prisma.familyMember.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });
    
    return NextResponse.json(familyMembers);
  } catch (error) {
    console.error('Error fetching family members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/family-members - Create a new family member
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
    const validationResult = familyMemberSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { name, color, image, isDefault } = validationResult.data;
    
    // If this family member is set as default, unset any existing default
    if (isDefault) {
      await prisma.familyMember.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }
    
    // Create the new family member
    const familyMember = await prisma.familyMember.create({
      data: {
        name,
        color,
        image,
        isDefault: isDefault ?? false,
        userId: user.id,
      },
    });
    
    return NextResponse.json(familyMember, { status: 201 });
  } catch (error) {
    console.error('Error creating family member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/family-members?id={id} - Update a family member
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
    
    // Get the family member ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Family member ID is required' }, { status: 400 });
    }
    
    // Check if the family member exists and belongs to the user
    const existingFamilyMember = await prisma.familyMember.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });
    
    if (!existingFamilyMember) {
      return NextResponse.json({ error: 'Family member not found' }, { status: 404 });
    }
    
    const body = await request.json();
    
    // Validate the request body
    const validationResult = familyMemberSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { name, color, image, isDefault } = validationResult.data;
    
    // If this family member is set as default, unset any existing default
    if (isDefault) {
      await prisma.familyMember.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }
    
    // Update the family member
    const updatedFamilyMember = await prisma.familyMember.update({
      where: { id },
      data: {
        name,
        color,
        image,
        isDefault: isDefault ?? existingFamilyMember.isDefault,
      },
    });
    
    return NextResponse.json(updatedFamilyMember);
  } catch (error) {
    console.error('Error updating family member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/family-members?id={id} - Delete a family member
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
    
    // Get the family member ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Family member ID is required' }, { status: 400 });
    }
    
    // Check if the family member exists and belongs to the user
    const existingFamilyMember = await prisma.familyMember.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });
    
    if (!existingFamilyMember) {
      return NextResponse.json({ error: 'Family member not found' }, { status: 404 });
    }
    
    // Check if this is the last family member
    const count = await prisma.familyMember.count({
      where: { userId: user.id },
    });
    
    if (count <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last family member' },
        { status: 400 }
      );
    }
    
    // If deleting the default family member, set another one as default
    if (existingFamilyMember.isDefault) {
      const anotherFamilyMember = await prisma.familyMember.findFirst({
        where: {
          userId: user.id,
          id: { not: id },
        },
      });
      
      if (anotherFamilyMember) {
        await prisma.familyMember.update({
          where: { id: anotherFamilyMember.id },
          data: { isDefault: true },
        });
      }
    }
    
    // Delete the family member
    await prisma.familyMember.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting family member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 