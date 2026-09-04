/**
 * Auto-Close Events API
 * Protected by CRON_SECRET (header or query token)
 */

import { NextRequest, NextResponse } from 'next/server';
import { autoCloseEvents } from '@/lib/event-utils';

export const dynamic = 'force-dynamic';

function isCronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === 'development';
  const auth = request.headers.get('authorization');
  if (auth === `Bearer ${secret}`) return true;
  const { searchParams } = new URL(request.url);
  return searchParams.get('token') === secret;
}

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await autoCloseEvents();

    return NextResponse.json({
      success: true,
      message: 'Events auto-closed successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error auto-closing events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to auto-close events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await autoCloseEvents();

    return NextResponse.json({
      success: true,
      message: 'Events auto-closed successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error auto-closing events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to auto-close events' },
      { status: 500 }
    );
  }
}

