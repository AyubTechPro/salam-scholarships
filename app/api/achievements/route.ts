import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const achievementSchema = z.object({
  studentName: z.string().min(1),
  universityName: z.string().min(1),
  // Trilingual country fields (REQUIRED)
  countryTJ: z.string().min(1),
  countryRU: z.string().min(1),
  countryEN: z.string().min(1),
  // Trilingual program name fields (REQUIRED)
  programNameTJ: z.string().min(1),
  programNameRU: z.string().min(1),
  programNameEN: z.string().min(1),
  // Trilingual testimonial fields (REQUIRED)
  testimonialTJ: z.string().min(1),
  testimonialRU: z.string().min(1),
  testimonialEN: z.string().min(1),
  studentImage: z.string().url(),
  academicYear: z.string().min(1),
  category: z.enum(['BACHELOR', 'MASTER', 'PHD']),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';
    const category = searchParams.get('category');
    const year = searchParams.get('year');
    const search = searchParams.get('search');
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
    }
    if (category && ['BACHELOR', 'MASTER', 'PHD'].includes(category)) {
      where.category = category;
    }
    if (year) {
      where.academicYear = year;
    }
    
    // Search across all trilingual fields
    if (search) {
      where.OR = [
        { studentName: { contains: search, mode: 'insensitive' } },
        { universityName: { contains: search, mode: 'insensitive' } },
        { countryTJ: { contains: search, mode: 'insensitive' } },
        { countryRU: { contains: search, mode: 'insensitive' } },
        { countryEN: { contains: search, mode: 'insensitive' } },
        { programNameTJ: { contains: search, mode: 'insensitive' } },
        { programNameRU: { contains: search, mode: 'insensitive' } },
        { programNameEN: { contains: search, mode: 'insensitive' } },
        { testimonialTJ: { contains: search, mode: 'insensitive' } },
        { testimonialRU: { contains: search, mode: 'insensitive' } },
        { testimonialEN: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.achievement.count({ where });

    const achievements = await prisma.achievement.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: achievements,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch achievements' },
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
    if (!(await canPerformAction('CREATE', 'ACHIEVEMENT'))) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = achievementSchema.parse(body);

    const achievement = await prisma.achievement.create({
      data: validatedData,
    });

    // Log audit action
    await logAuditAction(
      user.id,
      'CREATE',
      'ACHIEVEMENT',
      achievement.id,
      `Created achievement: ${achievement.studentName}`,
      {
        university: achievement.universityName,
        country: achievement.countryEN,
        category: achievement.category,
      }
    );

    return NextResponse.json({
      success: true,
      data: achievement,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating achievement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create achievement' },
      { status: 500 }
    );
  }
}

