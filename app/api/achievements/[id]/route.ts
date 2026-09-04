import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const achievementSchema = z.object({
  studentName: z.string().min(1).optional(),
  universityName: z.string().min(1).optional(),
  // Trilingual country fields (REQUIRED for updates)
  countryTJ: z.string().min(1).optional(),
  countryRU: z.string().min(1).optional(),
  countryEN: z.string().min(1).optional(),
  // Trilingual program name fields (REQUIRED for updates)
  programNameTJ: z.string().min(1).optional(),
  programNameRU: z.string().min(1).optional(),
  programNameEN: z.string().min(1).optional(),
  // Trilingual testimonial fields (REQUIRED for updates)
  testimonialTJ: z.string().min(1).optional(),
  testimonialRU: z.string().min(1).optional(),
  testimonialEN: z.string().min(1).optional(),
  studentImage: z.string().url().optional(),
  academicYear: z.string().min(1).optional(),
  category: z.enum(['BACHELOR', 'MASTER', 'PHD']).optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const achievement = await prisma.achievement.findUnique({
      where: { id: params.id },
    });

    if (!achievement) {
      return NextResponse.json(
        { success: false, error: 'Achievement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: achievement,
    });
  } catch (error) {
    console.error('Error fetching achievement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch achievement' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { requireGrowthManagerAPI } = await import('@/lib/rbac-api');
    const { canPerformAction, logAuditAction } = await import('@/lib/rbac');

    const { error, user } = await requireGrowthManagerAPI();
    if (error) return error;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check permission
    if (!(await canPerformAction('UPDATE', 'ACHIEVEMENT'))) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = achievementSchema.parse(body);

    const existingAchievement = await prisma.achievement.findUnique({
      where: { id: params.id },
    });

    if (!existingAchievement) {
      return NextResponse.json(
        { success: false, error: 'Achievement not found' },
        { status: 404 }
      );
    }

    const achievement = await prisma.achievement.update({
      where: { id: params.id },
      data: validatedData,
    });

    // Log audit action
    await logAuditAction(
      user.id,
      'UPDATE',
      'ACHIEVEMENT',
      achievement.id,
      `Updated achievement: ${achievement.studentName}`,
      {
        university: achievement.universityName,
        country: achievement.countryEN,
      }
    );

    return NextResponse.json({
      success: true,
      data: achievement,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating achievement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update achievement' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { requireGrowthManagerAPI } = await import('@/lib/rbac-api');
    const { canPerformAction, logAuditAction } = await import('@/lib/rbac');

    const { error, user } = await requireGrowthManagerAPI();
    if (error) return error;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check permission
    if (!(await canPerformAction('DELETE', 'ACHIEVEMENT'))) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const existingAchievement = await prisma.achievement.findUnique({
      where: { id: params.id },
    });

    if (!existingAchievement) {
      return NextResponse.json(
        { success: false, error: 'Achievement not found' },
        { status: 404 }
      );
    }

    await prisma.achievement.delete({
      where: { id: params.id },
    });

    // Log audit action
    await logAuditAction(
      user.id,
      'DELETE',
      'ACHIEVEMENT',
      params.id,
      `Deleted achievement: ${existingAchievement.studentName}`,
      {
        university: existingAchievement.universityName,
        country: existingAchievement.countryEN,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Achievement deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete achievement' },
      { status: 500 }
    );
  }
}

