import { NextResponse } from 'next/server';
import { getTopDeadlines } from '@/lib/hot-deadlines';

export async function GET() {
  try {
    const deadlines = await getTopDeadlines(3);
    return NextResponse.json({
      success: true,
      data: deadlines,
    });
  } catch (error) {
    console.error('Error fetching hot deadlines:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deadlines' },
      { status: 500 }
    );
  }
}

