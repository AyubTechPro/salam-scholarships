import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';
import { calculateMatchScore } from '@/lib/recommendation-engine';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuthAPI();
    if (error || !user) return error;

    // Fetch user profile details needed for matching
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        country: true,
        preferredCountries: true,
      }
    });

    if (!userProfile) {
      return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
    }

    // Fetch all active programs to run through the matchmaking engine
    // For V1, we fetch all active programs. If catalog grows >10,000, we should pre-filter via Prisma
    const activePrograms = await prisma.program.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        titleRu: true,
        titleTj: true,
        description: true,
        descriptionRu: true,
        descriptionTj: true,
        slug: true,
        level: true,
        category: true,
        country: true,
        fundingType: true,
        eligibleNationalities: true,
        imageUrl: true,
        isVerified: true,
        deadline: true,
      }
    });

    // Calculate match scores for all programs
    const scoredPrograms = activePrograms.map(program => {
      const matchData = calculateMatchScore(userProfile, program);
      return {
        ...program,
        matchScore: matchData.score,
        matchReasons: matchData.reasons,
        matchBreakdown: matchData.breakdown
      };
    });

    // Sort by highest match score, then by closest deadline
    scoredPrograms.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore; // Primary sort: Score DESC
      }
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime(); // Secondary sort: Deadline ASC
    });

    // Return the Top 5 best matches
    const topMatches = scoredPrograms.slice(0, 5);

    return NextResponse.json({
      success: true,
      data: topMatches
    });
    
  } catch (error) {
    console.error('[AI Matchmaking API Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
