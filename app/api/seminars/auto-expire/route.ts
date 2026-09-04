/**
 * Auto-Expire Seminars API
 * Protected by CRON_SECRET (Authorization header or ?token=)
 */

import { NextRequest, NextResponse } from 'next/server';
import { autoExpireSeminars } from '@/lib/seminar-utils';

export const dynamic = 'force-dynamic';

function isCronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === 'development';
  const auth = request.headers.get('authorization');
  if (auth === `Bearer ${secret}`) return true;
  const { searchParams } = new URL(request.url);
  return searchParams.get('token') === secret;
}

export async function POST(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await autoExpireSeminars();

    return NextResponse.json({
      success: true,
      message: 'Seminars auto-expired successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error auto-expiring seminars:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to auto-expire seminars' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await autoExpireSeminars();

    return NextResponse.json({
      success: true,
      message: 'Seminars auto-expired successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error auto-expiring seminars:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to auto-expire seminars' },
      { status: 500 }
    );
  }
}

