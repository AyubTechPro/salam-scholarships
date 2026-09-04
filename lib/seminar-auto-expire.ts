/**
 * Auto-Expiration Logic for Seminars
 * Automatically closes/archives seminars when deadlines pass
 */

import { prisma } from './prisma';
import { sendNotificationIfEnabled } from './telegram';

/**
 * Check and update seminar statuses based on deadlines
 * Should be called periodically (via cron job or API endpoint)
 */
export async function autoExpireSeminars(): Promise<{ updated: number; archived: number }> {
  let updated = 0;
  let archived = 0;

  try {
    const now = new Date();

    // Find seminars that need status updates
    const openSeminars = await prisma.seminar.findMany({
      where: {
        status: {
          not: 'ARCHIVED',
        },
      },
    });

    for (const seminar of openSeminars) {
      const deadlinePassed = new Date(seminar.registrationDeadline) < now;
      const datePassed = new Date(seminar.date) < now;

      if (datePassed) {
        // Archive if date has passed (event is over)
        await prisma.seminar.update({
          where: { id: seminar.id },
          data: {
            status: 'ARCHIVED',
          },
        });
        archived++;
      } else if (deadlinePassed && seminar.status === 'OPEN') {
        // Close if registration deadline passed but event hasn't happened yet
        await prisma.seminar.update({
          where: { id: seminar.id },
          data: {
            status: 'CLOSED',
          },
        });
        updated++;
      }
    }

    return { updated, archived };
  } catch (error) {
    console.error('Error auto-expiring seminars:', error);
    return { updated, archived };
  }
}

/**
 * Check for seminars approaching 90% capacity and send Telegram alerts
 */
export async function checkSeminarCapacityAlerts(): Promise<void> {
  try {
    const openSeminars = await prisma.seminar.findMany({
      where: {
        status: 'OPEN',
      },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    for (const seminar of openSeminars) {
      if (seminar.maxParticipants > 0) {
        const registeredCount = seminar._count.registrations;
        const capacityPercentage = (registeredCount / seminar.maxParticipants) * 100;

        // Send alert if at or above 90% capacity
        if (capacityPercentage >= 90) {
          const message = `🚨 <b>Seminar Capacity Alert</b>\n\n📚 <b>${seminar.title}</b>\n\nCapacity: <b>${Math.round(capacityPercentage)}%</b> (${registeredCount}/${seminar.maxParticipants})\n\nAlmost full! Consider opening more slots or creating a waitlist.`;
          
          await sendNotificationIfEnabled(message);
        }
      }
    }
  } catch (error) {
    console.error('Error checking seminar capacity alerts:', error);
  }
}

/**
 * Check for scholarships approaching deadline (3 days) and send alerts
 */
export async function checkScholarshipDeadlineAlerts(): Promise<void> {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const now = new Date();

    // Find scholarships expiring in 3 days
    const expiringPrograms = await prisma.program.findMany({
      where: {
        isActive: true,
        isExpired: false,
        deadline: {
          gte: now,
          lte: threeDaysFromNow,
        },
      },
      select: {
        id: true,
        title: true,
        titleRu: true,
        titleTj: true,
        deadline: true,
        viewCount: true,
      },
    });

    if (expiringPrograms.length > 0) {
      // Format alert message
      const programList = expiringPrograms
        .map((p) => `• ${p.title} (Deadline: ${new Date(p.deadline).toLocaleDateString()})`)
        .join('\n');

      const message = `
🔥 <b>Scholarship Deadline Alert (3 Days)</b>

The following opportunities are expiring in 3 days:

${programList}

Consider boosting these on Social Media! 📢

⏰ <i>Alert time: ${new Date().toLocaleString()}</i>
      `.trim();

      await sendNotificationIfEnabled(message);
    }
  } catch (error) {
    console.error('Error checking scholarship deadline alerts:', error);
  }
}

/**
 * Run all automated checks (should be called periodically)
 */
export async function runAutomatedChecks(): Promise<void> {
  try {
    // Auto-expire seminars
    await autoExpireSeminars();

    // Check capacity alerts
    await checkSeminarCapacityAlerts();

    // Check scholarship deadlines
    await checkScholarshipDeadlineAlerts();
  } catch (error) {
    console.error('Error running automated checks:', error);
  }
}

