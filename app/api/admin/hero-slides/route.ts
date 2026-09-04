import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const heroSlideSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  titleRu: z.string().optional(),
  titleTj: z.string().optional(),
  subtitle: z.string().min(1, 'Subtitle is required'),
  subtitleRu: z.string().optional(),
  subtitleTj: z.string().optional(),
  imageUrl: z.union([z.string().url('Valid image URL is required'), z.literal(''), z.null()]).optional(),
  bgGradient: z.string().optional().nullable(), // e.g., "from-blue-900 via-purple-900 to-pink-900"
  buttonText: z.string().min(1, 'Button text is required'),
  buttonTextRu: z.string().optional(),
  buttonTextTj: z.string().optional(),
  buttonLink: z.string().min(1, 'Button link is required'),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, data: slides });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hero slides' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminResult = await requireContentDirectorAPI();
    if (adminResult.error) return adminResult.error;
    if (!adminResult.user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = heroSlideSchema.parse(body);

    const slide = await prisma.heroSlide.create({
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'CREATE',
      'HERO_SLIDE',
      slide.id,
      `Created hero slide: ${slide.title}`,
      validatedData
    );

    return NextResponse.json({ success: true, data: slide }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating hero slide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create hero slide' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminResult = await requireContentDirectorAPI();
    if (adminResult.error) return adminResult.error;
    if (!adminResult.user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Slide ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = heroSlideSchema.partial().parse(body);

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'UPDATE',
      'HERO_SLIDE',
      slide.id,
      `Updated hero slide: ${slide.title}`,
      validatedData
    );

    return NextResponse.json({ success: true, data: slide });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating hero slide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update hero slide' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminResult = await requireContentDirectorAPI();
    if (adminResult.error) return adminResult.error;
    if (!adminResult.user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Slide ID is required' },
        { status: 400 }
      );
    }

    const slide = await prisma.heroSlide.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!slide) {
      return NextResponse.json(
        { success: false, error: 'Slide not found' },
        { status: 404 }
      );
    }

    await prisma.heroSlide.delete({ where: { id } });

    await logAuditAction(
      adminResult.user.id,
      'DELETE',
      'HERO_SLIDE',
      id,
      `Deleted hero slide: ${slide.title}`,
      { deletedSlide: { title: slide.title } }
    );

    return NextResponse.json({ success: true, message: 'Slide deleted successfully' });
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete hero slide' },
      { status: 500 }
    );
  }
}

