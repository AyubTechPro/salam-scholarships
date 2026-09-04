import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const program = await prisma.program.update({
      where: { id: params.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        viewCount: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    // Don't fail the request if view count fails
    return NextResponse.json({
      success: false,
      error: 'Failed to track view',
    });
  }
}

