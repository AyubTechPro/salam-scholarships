import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logUserActivity } from '@/lib/user-activity';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access',
      }, { status: 401 });
    }

    // Get video details for activity metadata
    const video = await prisma.videoContent.findUnique({
      where: { id: params.id },
      select: {
        title: true,
        category: true,
        duration: true,
      },
    });

    // Increment view count
    await prisma.videoContent.update({
      where: { id: params.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    // Track user activity (only if authenticated)
    if (userId) {
      await logUserActivity(
        userId,
        'VIEW',
        'VIDEO',
        params.id,
        {
          title: video?.title,
          category: video?.category,
          duration: video?.duration,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Video view tracked successfully',
    });
  } catch (error) {
    // Silent error handling - don't expose internal errors
    return NextResponse.json({
      success: false,
      error: 'Failed to track view',
    }, { status: 500 });
  }
}

