import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdminAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const teamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'CONTENT_DIRECTOR', 'GROWTH_MANAGER', 'CONSULTANT', 'USER']),
});

// Get all team members (non-USER roles)
export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireSuperAdminAPI();
    if (error) return error;

    const members = await prisma.user.findMany({
      where: {
        role: {
          not: 'USER',
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// Add or update team member role
export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireSuperAdminAPI();
    if (error) return error;

    const body = await request.json();
    const validatedData = teamMemberSchema.parse(body);

    // Find user by email
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email does not exist. Please ask them to sign up first.' },
        { status: 404 }
      );
    }

    // Prevent downgrading SUPER_ADMIN unless it's the same user
    if (existingUser.role === 'SUPER_ADMIN' && existingUser.id !== user?.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot modify another SUPER_ADMIN user' },
        { status: 403 }
      );
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { email: validatedData.email },
      data: { role: validatedData.role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Team member role updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error adding team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add team member' },
      { status: 500 }
    );
  }
}

