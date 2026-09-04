import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdminAPI } from '@/lib/rbac-api';
import { requireGrowthManagerAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const redirectUpdateSchema = z.object({
  toPath: z.string().min(1).optional(),
  statusCode: z.number().int().min(301).max(302).optional(),
  isActive: z.boolean().optional(),
  isExternal: z.boolean().optional(),
  description: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireGrowthManagerAPI();
    if (error) return error;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = redirectUpdateSchema.parse(body);

    // Clean up empty strings
    const updateData: any = {};
    Object.keys(validatedData).forEach((key) => {
      const value = (validatedData as any)[key];
      if (value !== undefined) {
        updateData[key] = value === '' ? null : value;
      }
    });

    const redirect = await prisma.redirect.update({
      where: { id: params.id },
      data: updateData,
    });

    // Log audit action
    await logAuditAction(
      user.id,
      'UPDATE',
      'REDIRECT',
      params.id,
      `Updated redirect: ${redirect.fromPath}`,
      updateData
    );

    return NextResponse.json({
      success: true,
      data: redirect,
    });
  } catch (error) {
    console.error('Error updating redirect:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update redirect' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireSuperAdminAPI();
    if (error) return error;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const redirect = await prisma.redirect.findUnique({
      where: { id: params.id },
    });

    if (!redirect) {
      return NextResponse.json(
        { success: false, error: 'Redirect not found' },
        { status: 404 }
      );
    }

    await prisma.redirect.delete({
      where: { id: params.id },
    });

    // Log audit action
    await logAuditAction(
      user.id,
      'DELETE',
      'REDIRECT',
      params.id,
      `Deleted redirect: ${redirect.fromPath}`,
      {}
    );

    return NextResponse.json({
      success: true,
      message: 'Redirect deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting redirect:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete redirect' },
      { status: 500 }
    );
  }
}

