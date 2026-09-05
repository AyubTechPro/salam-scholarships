export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireAnyAdminAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAnyAdminAPI();
    if (error) return error;

    // Top 10 Opportunities by views
    const topOpportunities = await prisma.program.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        titleRu: true,
        titleTj: true,
        country: true,
        category: true,
        level: true,
        viewCount: true,
        savedBy: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        viewCount: 'desc',
      },
      take: 10,
    });

    // Country interest from user activities and saved programs
    const countryInterests = await prisma.userActivity.findMany({
      where: {
        activityType: 'VIEW',
        entityType: 'PROGRAM',
      },
      include: {
        user: {
          select: {
            country: true,
          },
        },
      },
    });

    // Also get from saved programs
    const savedProgramCountries = await prisma.savedProgram.findMany({
      include: {
        program: {
          select: {
            country: true,
          },
        },
        user: {
          select: {
            country: true,
          },
        },
      },
    });

    // Combine and count country interests
    const countryCounts: Record<string, number> = {};
    
    countryInterests.forEach((activity) => {
      const country = activity.metadata as any;
      if (country?.targetCountry) {
        countryCounts[country.targetCountry] = (countryCounts[country.targetCountry] || 0) + 1;
      }
    });

    savedProgramCountries.forEach((saved) => {
      const country = saved.program.country;
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    // Get programs by target country from view activities (OPTIMIZED - batch fetch)
    const programViews = await prisma.userActivity.findMany({
      where: {
        activityType: 'VIEW',
        entityType: 'PROGRAM',
        entityId: { not: null },
      },
      select: {
        entityId: true,
      },
      distinct: ['entityId'],
    });

    // Batch fetch all programs in one query (avoiding N+1)
    const programIds = programViews
      .map((activity) => activity.entityId)
      .filter((id): id is string => id !== null);

    const programs = await prisma.program.findMany({
      where: {
        id: { in: programIds },
      },
      select: {
        id: true,
        country: true,
      },
    });

    // Count views per program country
    const programViewCounts = await prisma.userActivity.groupBy({
      by: ['entityId'],
      where: {
        activityType: 'VIEW',
        entityType: 'PROGRAM',
        entityId: { in: programIds },
      },
      _count: {
        id: true,
      },
    });

    // Create a map for quick lookup
    const programCountryMap = new Map(programs.map((p) => [p.id, p.country]));
    
    // Get target countries from programs (optimized)
    const programTargetCountries: Record<string, number> = {};
    programViewCounts.forEach((viewCount) => {
      if (viewCount.entityId) {
        const country = programCountryMap.get(viewCount.entityId);
        if (country) {
          programTargetCountries[country] = (programTargetCountries[country] || 0) + viewCount._count.id;
        }
      }
    });

    // Merge country interests
    const allCountryInterests = { ...countryCounts };
    Object.keys(programTargetCountries).forEach((country) => {
      allCountryInterests[country] = (allCountryInterests[country] || 0) + programTargetCountries[country];
    });

    // User growth over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by day
    const dailyGrowth: Record<string, number> = {};
    userGrowth.forEach((user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      dailyGrowth[date] = (dailyGrowth[date] || 0) + 1;
    });

    // Convert to array for chart
    const growthData = Object.keys(dailyGrowth)
      .sort()
      .map((date) => ({
        date,
        count: dailyGrowth[date],
      }));

    // Get top countries
    const topCountries = Object.entries(allCountryInterests)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([country, count]) => ({
        country,
        count,
      }));

    return NextResponse.json({
      success: true,
      data: {
        topOpportunities: topOpportunities.map((op) => ({
          ...op,
          savedCount: op.savedBy.length,
        })),
        countryInterests: topCountries,
        userGrowth: growthData,
        totalViews: topOpportunities.reduce((sum, op) => sum + op.viewCount, 0),
        totalSaved: await prisma.savedProgram.count(),
        totalUsers: await prisma.user.count(),
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
