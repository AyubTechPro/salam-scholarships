/**
 * Public Landing Content API
 * Read-only landing content for public pages (About, Mission, Path sections).
 * No auth required — used by LandingContentContext.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const content = await prisma.landingContent.findUnique({
      where: { id: 'landing' },
    });

    if (!content) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('[public/cms/landing] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch landing content' },
      { status: 500 }
    );
  }
}
