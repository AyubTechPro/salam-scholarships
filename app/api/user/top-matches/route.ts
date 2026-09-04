/**
 * Top Matches API
 * Returns best 3 opportunities based on user preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredCountries: true,
        preferredFields: true,
        profession: true,
        country: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Build where clause based on preferences
    const where: any = {
      isActive: true,
      isExpired: false,
      deletedAt: null,
    };

    // Filter by preferred countries
    if (user.preferredCountries && user.preferredCountries.length > 0) {
      where.country = {
        in: user.preferredCountries,
      };
    }

    // Filter by preferred fields: match ANY field (OR), not all (AND)
    if (user.preferredFields && user.preferredFields.length > 0) {
      const fieldQueries = user.preferredFields.map((field) => ({
        OR: [
          { title: { contains: field, mode: 'insensitive' } },
          { description: { contains: field, mode: 'insensitive' } },
          { titleRu: { contains: field, mode: 'insensitive' } },
          { descriptionRu: { contains: field, mode: 'insensitive' } },
          { titleTj: { contains: field, mode: 'insensitive' } },
          { descriptionTj: { contains: field, mode: 'insensitive' } },
        ],
      }));
      where.OR = fieldQueries;
    }

    // Fetch top 3 matching opportunities
    const opportunities = await prisma.program.findMany({
      where,
      take: 3,
      orderBy: [
        { isVerified: 'desc' },
        { deadline: 'asc' },
        { viewCount: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        titleRu: true,
        titleTj: true,
        description: true,
        descriptionRu: true,
        descriptionTj: true,
        level: true,
        category: true,
        country: true,
        fundingType: true,
        deadline: true,
        imageUrl: true,
        isVerified: true,
        slug: true,
      },
    });

    // If no matches found, return top 3 general opportunities
    if (opportunities.length === 0) {
      const generalOpportunities = await prisma.program.findMany({
        where: {
          isActive: true,
          isExpired: false,
          deletedAt: null,
        },
        take: 3,
        orderBy: [
          { isVerified: 'desc' },
          { deadline: 'asc' },
        ],
        select: {
          id: true,
          title: true,
          titleRu: true,
          titleTj: true,
          description: true,
          descriptionRu: true,
          descriptionTj: true,
          level: true,
          category: true,
          country: true,
          fundingType: true,
          deadline: true,
          imageUrl: true,
          isVerified: true,
          slug: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          opportunities: generalOpportunities,
          isPersonalized: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        opportunities,
        isPersonalized: true,
      },
    });
  } catch (error) {
    console.error('Error fetching top matches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch top matches' },
      { status: 500 }
    );
  }
}

