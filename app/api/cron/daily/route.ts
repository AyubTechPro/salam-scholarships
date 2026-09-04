/**
 * Daily Cron: Audit cleanup, deadline reminders, events/seminars auto-close
 * Schedule: 3:00 AM daily (Vercel Cron)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldAuditLogs, sendDeadlineReminders, archiveExpiredPrograms } from '@/lib/automation';
import { autoCloseEvents } from '@/lib/event-utils';
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

export async function GET(request: NextRequest) {
  try {
    if (!isCronAuthorized(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [auditResult, remindersResult, eventsResult, seminarsResult, programsResult] = await Promise.all([
      cleanupOldAuditLogs(),
      sendDeadlineReminders(),
      autoCloseEvents().catch((e) => ({ closed: 0, error: String(e) })),
      autoExpireSeminars().catch((e) => ({ expired: 0, error: String(e) })),
      archiveExpiredPrograms().catch((e) => ({ archived: 0, error: String(e) })),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Daily cron completed',
      data: {
        audit: { deleted: auditResult.deleted },
        reminders: { sent: remindersResult.sent, errors: remindersResult.errors },
        events: eventsResult,
        seminars: seminarsResult,
        programs: programsResult,
      },
    });
  } catch (error) {
    console.error('Daily cron error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
