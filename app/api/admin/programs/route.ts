import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI, requireGrowthManagerAPI } from '@/lib/rbac-api';
import { canPerformAction, logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ProgramLevel, FundingType, ProgramCategory } from '@prisma/client';

const programSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  titleRu: z.string().optional(),
  titleTj: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  descriptionRu: z.string().optional(),
  descriptionTj: z.string().optional(),
  slug: z.string().min(1, 'Slug is required'),
  level: z.nativeEnum(ProgramLevel),
  category: z.nativeEnum(ProgramCategory),
  fundingType: z.nativeEnum(FundingType),
  country: z.string().min(1, 'Country is required'),
  institution: z.string().min(1, 'Institution is required'),
  deadline: z.string().transform((str) => new Date(str)),
  startDate: z.string().optional().transform((str) => (str ? new Date(str) : null)),
  endDate: z.string().optional().transform((str) => (str ? new Date(str) : null)),
  imageUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  officialWebsiteUrl: z.string().url().optional().or(z.literal('')),
  promoSocialLink: z.string().url().optional().or(z.literal('')),
  applicationUrl: z.string().url().optional().or(z.literal('')),
  region: z.enum(['EUROPE', 'ASIA', 'NORTH_AMERICA', 'OCEANIA', 'AFRICA']).optional().nullable(),
  isVerified: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  requiresEnglishCert: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    // Allow both CONTENT_DIRECTOR and GROWTH_MANAGER
    const contentDirResult = await requireContentDirectorAPI();
    const growthMgrResult = await requireGrowthManagerAPI();
    
    if (contentDirResult.error && growthMgrResult.error) {
      return contentDirResult.error; // Return first error
    }
    
    const { user } = contentDirResult.error ? growthMgrResult : contentDirResult;
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;
    const search = searchParams.get('search');

    // Build where clause for search
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { titleRu: { contains: search, mode: 'insensitive' } },
        { titleTj: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { descriptionRu: { contains: search, mode: 'insensitive' } },
        { descriptionTj: { contains: search, mode: 'insensitive' } },
        { institution: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.program.count({ where });

    // Fetch programs with pagination
    const programs = await prisma.program.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Log audit action
    await logAuditAction(
      user.id,
      'VIEW',
      'PROGRAM',
      undefined,
      'Viewed programs list',
      { page, limit, total }
    );

    return NextResponse.json({
      success: true,
      data: programs,
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
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Allow both CONTENT_DIRECTOR and GROWTH_MANAGER
    const contentDirResult = await requireContentDirectorAPI();
    const growthMgrResult = await requireGrowthManagerAPI();
    
    if (contentDirResult.error && growthMgrResult.error) {
      return contentDirResult.error; // Return first error
    }
    
    const { user } = contentDirResult.error ? growthMgrResult : contentDirResult;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check permission
    if (!(await canPerformAction('CREATE', 'PROGRAM'))) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions to create programs' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = programSchema.parse(body);

    // Check if slug already exists
    const existing = await prisma.program.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A program with this slug already exists' },
        { status: 400 }
      );
    }

    const program = await prisma.program.create({
      data: validatedData,
    });

    // Notify users about new opportunity via Telegram and in-app notifications
    if (program.isActive) {
      try {
        const { notifyUsersAboutNewOpportunity } = await import('@/lib/telegram-notifications');
        await notifyUsersAboutNewOpportunity({
          id: program.id,
          title: program.title,
          titleRu: program.titleRu,
          titleTj: program.titleTj,
          level: program.level,
          country: program.country,
          category: program.category,
          slug: program.slug,
        });
      } catch (error) {
        console.error('Error notifying users about new opportunity:', error);
        // Don't fail the request if notification fails
      }
    }

    // Log audit action
    await logAuditAction(
      user.id,
      'CREATE',
      'PROGRAM',
      program.id,
      `Created program: ${program.title}`,
      {
        title: program.title,
        category: program.category,
        country: program.country,
        institution: program.institution,
      }
    );

    return NextResponse.json({
      success: true,
      data: program,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating program:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create program' },
      { status: 500 }
    );
  }
}

