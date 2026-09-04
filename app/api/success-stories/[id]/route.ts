import { NextRequest, NextResponse } from 'next/server';
import { requireGrowthManagerAPI } from '@/lib/rbac-api';
import { canPerformAction, logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const successStorySchema = z.object({
  name: z.string().min(1).optional(),
  nameRu: z.string().optional(),
  nameTj: z.string().optional(),
  program: z.string().min(1).optional(),
  programRu: z.string().optional(),
  programTj: z.string().optional(),
  country: z.string().min(1).optional(),
  university: z.string().optional(),
  field: z.string().optional(),
  keyToSuccess: z.string().min(1).optional(),
  keyToSuccessRu: z.string().optional(),
  keyToSuccessTj: z.string().optional(),
  quote: z.string().min(1).optional(),
  quoteRu: z.string().optional(),
  quoteTj: z.string().optional(),
  fullStory: z.string().min(1).optional(),
  fullStoryRu: z.string().optional(),
  fullStoryTj: z.string().optional(),
  photoUrl: z.string().url().optional(),
  achievement: z.string().min(1).optional(),
  achievementRu: z.string().optional(),
  achievementTj: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
});

export async function PUT(
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

    // Check permission
    if (!(await canPerformAction('UPDATE', 'SUCCESS_STORY'))) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = successStorySchema.parse(body);

    const existingStory = await prisma.successStory.findUnique({
      where: { id: params.id },
    });

    if (!existingStory) {
      return NextResponse.json(
        { success: false, error: 'Success story not found' },
        { status: 404 }
      );
    }

    const story = await prisma.successStory.update({
      where: { id: params.id },
      data: validatedData,
    });

    // Log audit action
    await logAuditAction(
      user.id,
      'UPDATE',
      'SUCCESS_STORY',
      story.id,
      `Updated success story: ${story.name}`,
      {
        previous: {
          name: existingStory.name,
          isActive: existingStory.isActive,
        },
        current: {
          name: story.name,
          isActive: story.isActive,
        },
      }
    );

    return NextResponse.json({
      success: true,
      data: story,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating success story:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update success story' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check permission
    if (!(await canPerformAction('DELETE', 'SUCCESS_STORY'))) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const story = await prisma.successStory.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        program: true,
      },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: 'Success story not found' },
        { status: 404 }
      );
    }

    await prisma.successStory.delete({
      where: { id: params.id },
    });

    // Log audit action
    await logAuditAction(
      user.id,
      'DELETE',
      'SUCCESS_STORY',
      params.id,
      `Deleted success story: ${story.name}`,
      {
        deletedStory: {
          name: story.name,
          program: story.program,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Success story deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting success story:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete success story' },
      { status: 500 }
    );
  }
}

