import { NextRequest, NextResponse } from 'next/server';
import { requireGrowthManagerAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const videoContentSchema = z.object({
  title: z.string().min(1),
  titleRu: z.string().optional(),
  titleTj: z.string().optional(),
  description: z.string().min(1),
  descriptionRu: z.string().optional(),
  descriptionTj: z.string().optional(),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  category: z.enum(['CV_TIPS', 'INTERVIEW', 'APPLICATION', 'LANGUAGE', 'GENERAL']),
  duration: z.number().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const videos = await prisma.videoContent.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      data: videos,
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminResult = await requireGrowthManagerAPI();
    if (adminResult.error) {
      return adminResult.error;
    }
    if (!adminResult.user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = videoContentSchema.parse(body);

    const video = await prisma.videoContent.create({
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'CREATE',
      'VIDEO_CONTENT',
      video.id,
      `Created video: ${video.title}`,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: video,
      message: 'Video created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create video' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminResult = await requireGrowthManagerAPI();
    if (adminResult.error) {
      return adminResult.error;
    }
    if (!adminResult.user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...restData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const updateSchema = videoContentSchema.partial();
    const validatedData = updateSchema.parse(restData);

    const video = await prisma.videoContent.update({
      where: { id },
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'UPDATE',
      'VIDEO_CONTENT',
      video.id,
      `Updated video: ${video.title}`,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: video,
      message: 'Video updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating video:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update video' },
      { status: 500 }
    );
  }
}

