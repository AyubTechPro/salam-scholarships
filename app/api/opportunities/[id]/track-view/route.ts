import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logUserActivity } from '@/lib/user-activity';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const ip = getClientIP(request);
    const { allowed } = await checkRateLimit(`track:${ip}:${id}`, 30, 60_000);
    if (!allowed) {
      return NextResponse.json({ success: false }, { status: 429 });
    }
    const session = await getServerSession(authOptions);

    // Get program details for activity metadata
    const program = await prisma.program.findUnique({
      where: { id },
      select: {
        title: true,
        country: true,
        category: true,
        level: true,
      },
    });

    // Increment view count for the opportunity
    await prisma.program.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    // Track user activity using utility function
    await logUserActivity(
      session?.user?.id || null,
      'VIEW',
      'PROGRAM',
      id,
      {
        title: program?.title,
        country: program?.country,
        category: program?.category,
        level: program?.level,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'View tracked successfully',
    });
  } catch (error) {
    console.error('Error tracking view:', error);
    // Don't fail the request if tracking fails
    return NextResponse.json({
      success: false,
      error: 'Failed to track view',
    }, { status: 500 });
  }
}

