import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const professions = await prisma.profession.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: professions,
    });
  } catch (error) {
    console.error('Error fetching professions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch professions' },
      { status: 500 }
    );
  }
}

