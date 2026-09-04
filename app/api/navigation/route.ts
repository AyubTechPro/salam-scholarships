import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'navbar';

    const items = await prisma.navigationMenu.findMany({
      where: {
        isActive: true,
        OR: [
          { location: location },
          { location: 'both' },
        ],
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching navigation menu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch navigation menu' },
      { status: 500 }
    );
  }
}

