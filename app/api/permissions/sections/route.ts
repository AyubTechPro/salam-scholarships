import { NextRequest, NextResponse } from 'next/server';
import { getAccessibleSections } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sections = await getAccessibleSections();
    return NextResponse.json({ sections: Array.from(sections) });
  } catch (error) {
    console.error('Error fetching accessible sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accessible sections' },
      { status: 500 }
    );
  }
}

