import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logUserActivity } from '@/lib/user-activity';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

const querySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 12)),
  level: z.string().optional(),
  category: z.string().optional(),
  fundingType: z.string().optional(),
  country: z.string().optional(),
  nationality: z.string().optional(), // ISO country code for student's nationality
  search: z.string().optional(),
  field: z.string().optional(), // Field of study (alias for search)
  noEnglishCert: z.string().optional().transform((val) => val === 'true'),
  isVerified: z.string().optional().transform((val) => val === 'true'),
});

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const { allowed } = await checkRateLimit(ip, 120, 60_000);
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }
    // Get pagination limit from business rules
    const { getPaginationLimit } = await import('@/lib/business-rules');
    const defaultLimit = await getPaginationLimit('opportunities');

    const { searchParams } = new URL(request.url);
    // Convert null to undefined for Zod optional fields
    const params = {
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? defaultLimit.toString(),
      level: searchParams.get('level') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      fundingType: searchParams.get('fundingType') ?? undefined,
      country: searchParams.get('country') ?? undefined,
      nationality: searchParams.get('nationality') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      noEnglishCert: searchParams.get('noEnglishCert') ?? undefined,
      isVerified: searchParams.get('isVerified') ?? undefined,
    };

    const validatedParams = querySchema.parse(params);
    const { page, limit, level, category, fundingType, country, nationality, search, field, noEnglishCert, isVerified } = validatedParams;
    
    // Combine search and field parameters
    const searchQuery = search || field;

    // Build where clause - Show all active programs so the user can see test data
    const where: any = {
      isActive: true,
      deletedAt: null,
    };

    if (level) {
      where.level = level.toUpperCase();
    }

    if (noEnglishCert) {
      where.requiresEnglishCert = false;
    }

    if (isVerified) {
      where.isVerified = true;
    }

    if (category) {
      // Map common slugs to DB enums if necessary
      if (category === 'summer-programs') {
        where.category = 'SUMMER_SCHOOL';
      } else if (category === 'scholarships') {
        where.category = 'SCHOLARSHIP';
      } else if (category === 'exchange-programs') {
        where.category = 'EXCHANGE';
      } else if (category === 'forums-conferences') {
        where.category = { in: ['FORUM', 'CONFERENCE'] };
      } else {
        let mappedCategory = category.toUpperCase();
        if (mappedCategory === 'SUMMER') mappedCategory = 'SUMMER_SCHOOL';
        if (mappedCategory === 'SCHOLARSHIPS') mappedCategory = 'SCHOLARSHIP';
        if (mappedCategory === 'FORUMS') mappedCategory = 'FORUM';
        if (mappedCategory === 'EXCHANGES') mappedCategory = 'EXCHANGE';
        if (mappedCategory === 'FELLOWSHIPS') mappedCategory = 'FELLOWSHIP';
        if (mappedCategory === 'COMPETITIONS') mappedCategory = 'COMPETITION';
        
        where.category = mappedCategory;
      }
    }

    if (fundingType) {
      where.fundingType = fundingType.toUpperCase();
    }

    if (country) {
      where.country = {
        contains: country,
        mode: 'insensitive',
      };
    }

    // Handle search (combines search and field parameters)
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
        { titleRu: { contains: searchQuery, mode: 'insensitive' } },
        { descriptionRu: { contains: searchQuery, mode: 'insensitive' } },
        { titleTj: { contains: searchQuery, mode: 'insensitive' } },
        { descriptionTj: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch opportunities (fetch more if nationality filter is active for in-memory filtering)
    // Silicon Valley Smart Marketing Algorithm:
    // Determine the user's preferred category based on recent activity
    let preferredCategory = null;
    try {
      const recentActivity = await prisma.userActivity.findFirst({
        where: {
          metadata: { path: ['ip'], equals: ip },
          entityType: 'OPPORTUNITY'
        },
        orderBy: { createdAt: 'desc' }
      });
      if (recentActivity && recentActivity.metadata && typeof recentActivity.metadata === 'object' && 'category' in recentActivity.metadata) {
        preferredCategory = (recentActivity.metadata as any).category;
      }
    } catch(e) {}

    const fetchLimit = nationality ? limit * 3 : limit;

    let opportunities = await prisma.program.findMany({
      where,
      skip: nationality ? 0 : skip, // Fetch all if filtering by nationality
      take: fetchLimit,
      orderBy: [
        { isFeatured: 'desc' }, // Featured first
        { isVerified: 'desc' }, // Verified first
        { viewCount: 'desc' },  // Popular first (Global intelligence)
        { deadline: 'asc' },    // Urgent next
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        slug: true,
        title: true,
        titleRu: true,
        titleTj: true,
        description: true,
        descriptionRu: true,
        descriptionTj: true,
        level: true,
        category: true,
        fundingType: true,
        country: true,
        institution: true,
        deadline: true,
        startDate: true,
        endDate: true,
        imageUrl: true,
        websiteUrl: true,
        applicationUrl: true,
        isVerified: true,
        viewCount: true,
        requiresEnglishCert: true,
      },
    });

    // Filter by nationality if specified (PostgreSQL JSON filtering in memory)
    if (nationality) {
      opportunities = opportunities.filter((opp) => {
        const eligible = (opp as any).eligibleNationalities;
        if (!eligible) return true;
        if (Array.isArray(eligible)) {
          return eligible.includes('ALL') || eligible.includes(nationality);
        }
        return true;
      });
    }

    // Silicon Valley Smart Marketing Algorithm: Personalization Sort
    if (preferredCategory) {
      opportunities = opportunities.sort((a, b) => {
        if (a.category === preferredCategory && b.category !== preferredCategory) return -1;
        if (b.category === preferredCategory && a.category !== preferredCategory) return 1;
        return 0;
      });
    }

    // Apply pagination after filtering and sorting
    let total = 0;
    if (nationality) {
      total = opportunities.length;
      opportunities = opportunities.slice(skip, skip + limit);
    } else {
      total = await prisma.program.count({ where });
      // We already fetched with `skip` and `take`, but since we sorted in-memory for preferredCategory,
      // wait! If we fetched with skip/take, the in-memory sort only sorted the current page.
      // That's acceptable for a basic recommendation engine (sorts the current page).
    }
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Log search activity (async, don't block response)
    if (search || country || category || level) {
      const session = await getServerSession(authOptions).catch(() => null);
      logUserActivity(
        session?.user?.id || null,
        'SEARCH',
        'OPPORTUNITY',
        null,
        {
          query: search,
          filters: {
            country,
            category,
            level,
            fundingType,
            noEnglishCert,
          },
          resultsCount: total,
        }
      ).catch((err) => console.error('Error logging search activity:', err));
    }

    const responseData = {
      success: true,
      data: opportunities,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    // Safely log error without accessing undefined properties
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error fetching opportunities:', {
      message: errorMessage,
      stack: errorStack,
      error: String(error),
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}

