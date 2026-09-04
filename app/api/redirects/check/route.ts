import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Public API endpoint to check for redirects (used by middleware)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'Path parameter required' },
        { status: 400 }
      );
    }

    const redirect = await prisma.redirect.findFirst({
      where: {
        fromPath: path,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: redirect || null,
    });
  } catch (error) {
    console.error('Error checking redirect:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check redirect' },
      { status: 500 }
    );
  }
}

