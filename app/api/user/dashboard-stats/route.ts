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

    // Fetch all stats in parallel
    const [
      applications,
      savedPrograms,
      upcomingEvents,
      applicationsWithScores,
    ] = await Promise.all([
      // Applications count
      prisma.application.count({
        where: { userId },
      }),
      // Saved programs count
      prisma.savedProgram.count({
        where: { userId },
      }),
      // Upcoming events count (user's bookings)
      prisma.eventBooking.count({
        where: {
          userId,
          event: {
            startDate: {
              gte: new Date(),
            },
            isActive: true,
          },
        },
      }),
      // Applications with motivation scores for AI readiness calculation
      prisma.application.findMany({
        where: {
          userId,
          motivationScore: {
            not: null,
          },
        },
        select: {
          motivationScore: true,
          cvUrl: true,
        },
      }),
    ]);

    // Calculate AI Readiness Score (average of all motivation scores)
    let aiReadinessScore = 0;
    if (applicationsWithScores.length > 0) {
      const totalScore = applicationsWithScores.reduce(
        (sum, app) => sum + (app.motivationScore || 0),
        0
      );
      aiReadinessScore = Math.round(totalScore / applicationsWithScores.length);
    }

    // Check if user has CV uploaded
    const hasCV = applicationsWithScores.some(app => !!app.cvUrl);

    return NextResponse.json({
      success: true,
      data: {
        applicationsCount: applications,
        savedOpportunitiesCount: savedPrograms,
        aiReadinessScore: aiReadinessScore,
        upcomingEventsCount: upcomingEvents,
        hasCV: hasCV,
        hasApplication: applications > 0,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

