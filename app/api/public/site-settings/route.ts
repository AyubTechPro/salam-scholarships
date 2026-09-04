/**
 * Public Site Settings API
 * Returns Hero settings for frontend components (cached)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'global' },
      select: {
        heroTickerMode: true,
        heroTickerText: true,
        heroTickerTextRu: true,
        heroTickerTextTj: true,
        heroTickerLink: true,
        heroHeadlineWords: true,
      },
    });

    if (!settings) {
      return NextResponse.json({
        success: true,
        data: {
          heroTickerMode: 'AUTO',
          heroTickerText: null,
          heroTickerTextRu: null,
          heroTickerTextTj: null,
          heroTickerLink: null,
          heroHeadlineWords: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        heroTickerMode: settings.heroTickerMode || 'AUTO',
        heroTickerText: settings.heroTickerText,
        heroTickerTextRu: settings.heroTickerTextRu,
        heroTickerTextTj: settings.heroTickerTextTj,
        heroTickerLink: settings.heroTickerLink,
        heroHeadlineWords: settings.heroHeadlineWords as Array<{ en: string; ru: string; tj: string }> | null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch site settings',
        data: {
          heroTickerMode: 'AUTO',
          heroTickerText: null,
          heroTickerTextRu: null,
          heroTickerTextTj: null,
          heroTickerLink: null,
          heroHeadlineWords: null,
        },
      },
      { status: 500 }
    );
  }
}

