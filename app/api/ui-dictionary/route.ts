import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const category = searchParams.get('category');

    if (key) {
      // Single key lookup
      const item = await prisma.uIDictionary.findUnique({
        where: { key },
      });
      return NextResponse.json({
        success: true,
        data: item,
      });
    }

    // Multiple keys or category filter
    const where: any = {};
    if (category) where.category = category;

    const items = await prisma.uIDictionary.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    // Return as key-value map for easy frontend consumption
    const dictionary: Record<string, { en: string; ru?: string | null; tj?: string | null }> = {};
    items.forEach((item) => {
      dictionary[item.key] = {
        en: item.en,
        ru: item.ru,
        tj: item.tj,
      };
    });

    return NextResponse.json({
      success: true,
      data: dictionary,
    });
  } catch (error) {
    console.error('Error fetching UI dictionary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch UI dictionary' },
      { status: 500 }
    );
  }
}

