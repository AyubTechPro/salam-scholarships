import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdminAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateRoleSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'CONTENT_DIRECTOR', 'GROWTH_MANAGER', 'CONSULTANT', 'USER']),
});

// Update team member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireSuperAdminAPI();
    if (error) return error;

    const body = await request.json();
    const validatedData = updateRoleSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { role: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent modifying another SUPER_ADMIN
    if (existingUser.role === 'SUPER_ADMIN' && params.id !== user?.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot modify another SUPER_ADMIN user' },
        { status: 403 }
      );
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
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
      message: 'Role updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// Remove team member (set role to USER)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireSuperAdminAPI();
    if (error) return error;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { role: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent removing another SUPER_ADMIN
    if (existingUser.role === 'SUPER_ADMIN' && params.id !== user?.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove another SUPER_ADMIN user' },
        { status: 403 }
      );
    }

    // Downgrade to USER (remove admin access)
    await prisma.user.update({
      where: { id: params.id },
      data: { role: 'USER' },
    });

    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully',
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}

