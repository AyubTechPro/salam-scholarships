import { NextRequest, NextResponse } from 'next/server';
import { requireAnyAdminAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';
import { calculateMatchScore } from '@/lib/recommendation-engine';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only admins can trigger the global notification dispatch
    const { error, user: adminUser } = await requireAnyAdminAPI();
    if (error || !adminUser) return error;

    const programId = params.id;
    
    // Fetch newly published program
    const program = await prisma.program.findUnique({
      where: { id: programId },
      select: {
        id: true,
        title: true,
        level: true,
        country: true,
        eligibleNationalities: true,
        isActive: true,
        slug: true
      }
    });

    if (!program) {
      return NextResponse.json({ success: false, error: 'Program not found' }, { status: 404 });
    }

    if (!program.isActive) {
      return NextResponse.json({ success: false, error: 'Cannot notify matches for an inactive program' }, { status: 400 });
    }

    // Fetch all active students
    // In production with >1M users, this would be chunked or offloaded to a queue (e.g. BullMQ/Inngest)
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        country: true,
        preferredCountries: true
      }
    });

    // Run matchmaking AI logic
    const matchedUserIds: string[] = [];

    for (const user of users) {
      const matchData = calculateMatchScore(user, program);
      
      // If the match is > 75%, it's highly relevant to the student
      if (matchData.score >= 75) {
        matchedUserIds.push(user.id);
      }
    }

    if (matchedUserIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users met the >75% match threshold for this program.',
        data: { notifiedCount: 0 }
      });
    }

    // Create notifications for matched users
    const notifications = matchedUserIds.map(userId => ({
      userId,
      type: 'SYSTEM',
      title: '🎯 Perfect Scholarship Match!',
      message: `A new program "${program.title}" in ${program.country} was just published and explicitly matches your academic profile. Check it out now!`,
      link: `/programs/${program.slug}`,
      isRead: false,
      priority: 'HIGH'
    }));

    // Perform bulk insert
    const insertResult = await prisma.notification.createMany({
      data: notifications,
      skipDuplicates: true
    });

    return NextResponse.json({
      success: true,
      message: `Successfully generated proactive match notifications for ${matchedUserIds.length} users.`,
      data: { notifiedCount: insertResult.count }
    });

  } catch (err) {
    console.error('[Notify Matches Error]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to trigger matchmaking notifications' },
      { status: 500 }
    );
  }
}
