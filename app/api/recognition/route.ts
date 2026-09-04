import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const recognition = await prisma.recognition.findUnique({
      where: { id: 'founder' },
    });

    return NextResponse.json({
      success: true,
      data: recognition,
    });
  } catch (error) {
    console.error('Error fetching recognition:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recognition' },
      { status: 500 }
    );
  }
}

