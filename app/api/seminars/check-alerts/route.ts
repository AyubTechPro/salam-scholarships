/**
 * Check Seminar & Scholarship Alerts
 * Checks for capacity alerts and expiry alerts
 * Should be called periodically (every hour or so)
 */

import { NextResponse } from 'next/server';
import { checkSeminarCapacityAlerts, checkScholarshipExpiryAlerts } from '@/lib/seminar-utils';
import { sendNotificationIfEnabled } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check seminar capacity alerts
    const seminarAlerts = await checkSeminarCapacityAlerts();
    const alertsSent: string[] = [];

    for (const alert of seminarAlerts) {
      const message = `🚨 <b>Seminar Capacity Alert</b>\n\n📚 <b>${alert.title}</b>\n\nCapacity: <b>${alert.capacity}%</b>\n\nAlmost full! Consider opening more slots or creating a waitlist.`;
      
      const result = await sendNotificationIfEnabled(message);
      if (result.sent) {
        alertsSent.push(`Seminar: ${alert.title}`);
      }
    }

    // Check scholarship expiry alerts
    const scholarshipAlerts = await checkScholarshipExpiryAlerts();
    
    if (scholarshipAlerts.length > 0) {
      const scholarshipList = scholarshipAlerts
        .map((s) => `• ${s.title} (Deadline: ${new Date(s.deadline).toLocaleDateString()})`)
        .join('\n');

      const message = `⏰ <b>Scholarship Expiry Alert (3 Days)</b>\n\n📋 <b>${scholarshipAlerts.length} scholarship(s) expiring soon:</b>\n\n${scholarshipList}\n\n💡 <i>Consider boosting these on Social Media!</i>`;
      
      const result = await sendNotificationIfEnabled(message);
      if (result.sent) {
        alertsSent.push(`Scholarships: ${scholarshipAlerts.length} alerts sent`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Alerts checked and sent',
      data: {
        seminarAlerts: seminarAlerts.length,
        scholarshipAlerts: scholarshipAlerts.length,
        alertsSent,
      },
    });
  } catch (error) {
    console.error('Error checking alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check alerts' },
      { status: 500 }
    );
  }
}

