/**
 * Cron Job: Archive Expired Programs
 * Should be called daily (e.g., via Vercel Cron or external service)
 * 
 * Protect with a secret token in production:
 * ?token=YOUR_SECRET_TOKEN
 */

import { NextRequest, NextResponse } from 'next/server';
import { archiveExpiredPrograms, checkExpiringPrograms } from '@/lib/automation';

function isCronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === 'development';
  const auth = request.headers.get('authorization');
  if (auth === `Bearer ${secret}`) return true;
  const { searchParams } = new URL(request.url);
  return searchParams.get('token') === secret;
}

export async function GET(request: NextRequest) {
  try {
    if (!isCronAuthorized(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [archiveResult, notificationResult] = await Promise.all([
      archiveExpiredPrograms(),
      checkExpiringPrograms(),
    ]);

    return NextResponse.json({
      success: true,
      message: `Archived ${archiveResult.archived} expired programs. Created ${notificationResult.notified} notifications.`,
      archived: archiveResult.archived,
      notified: notificationResult.notified,
      errors: [...archiveResult.errors, ...notificationResult.errors],
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

