import { NextRequest, NextResponse } from 'next/server';
import { canAccess, PermissionSection } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') as PermissionSection;

    if (!section) {
      return NextResponse.json(
        { error: 'Section parameter is required' },
        { status: 400 }
      );
    }

    const allowed = await canAccess(section);

    return NextResponse.json({ allowed });
  } catch (error) {
    console.error('Error checking permission:', error);
    return NextResponse.json(
      { error: 'Failed to check permission' },
      { status: 500 }
    );
  }
}

