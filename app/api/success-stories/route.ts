import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const successStorySchema = z.object({
  name: z.string().min(1),
  nameRu: z.string().optional(),
  nameTj: z.string().optional(),
  program: z.string().min(1),
  programRu: z.string().optional(),
  programTj: z.string().optional(),
  country: z.string().min(1),
  university: z.string().optional(),
  field: z.string().optional(),
  keyToSuccess: z.string().min(1),
  keyToSuccessRu: z.string().optional(),
  keyToSuccessTj: z.string().optional(),
  quote: z.string().min(1),
  quoteRu: z.string().optional(),
  quoteTj: z.string().optional(),
  fullStory: z.string().min(1),
  fullStoryRu: z.string().optional(),
  fullStoryTj: z.string().optional(),
  photoUrl: z.string().url(),
  achievement: z.string().min(1),
  achievementRu: z.string().optional(),
  achievementTj: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
  year: z.number().int().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';

    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
    }

    const stories = await prisma.successStory.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: stories,
    });
  } catch (error) {
    console.error('Error fetching success stories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch success stories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    if (!(await canPerformAction('CREATE', 'SUCCESS_STORY'))) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = successStorySchema.parse(body);

    const story = await prisma.successStory.create({
      data: validatedData,
    });

    // Log audit action
    await logAuditAction(
      user.id,
      'CREATE',
      'SUCCESS_STORY',
      story.id,
      `Created success story: ${story.name}`,
      {
        program: story.program,
        country: story.country,
      }
    );

    return NextResponse.json({
      success: true,
      data: story,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating success story:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create success story' },
      { status: 500 }
    );
  }
}

