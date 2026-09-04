/**
 * Seminar Auto-Janitor Utilities
 * Automatically manages seminar status based on deadlines
 */

import { prisma } from './prisma';
import { SeminarStatus } from '@prisma/client';

/**
 * Auto-expire seminars: Update status to CLOSED when deadline passes
 * This should be called periodically (via cron job or scheduled function)
 */
export async function autoExpireSeminars(): Promise<{
  expired: number;
  archived: number;
}> {
  const now = new Date();
  let expired = 0;
  let archived = 0;

  try {
    // Close seminars where registration deadline has passed but date hasn't
    const closedResult = await prisma.seminar.updateMany({
      where: {
        status: SeminarStatus.OPEN,
        registrationDeadline: {
          lt: now,
        },
        date: {
          gte: now, // Date hasn't passed yet
        },
      },
      data: {
        status: SeminarStatus.CLOSED,
      },
    });
    expired = closedResult.count;

    // Archive seminars where the date has passed (more than 7 days ago)
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const archivedResult = await prisma.seminar.updateMany({
      where: {
        status: {
          in: [SeminarStatus.OPEN, SeminarStatus.CLOSED],
        },
        date: {
          lt: sevenDaysAgo, // Date passed more than 7 days ago
        },
      },
      data: {
        status: SeminarStatus.ARCHIVED,
      },
    });
    archived = archivedResult.count;

    return { expired, archived };
  } catch (error) {
    console.error('Error auto-expiring seminars:', error);
    return { expired: 0, archived: 0 };
  }
}

/**
 * Check if seminar is urgent (within 48 hours of registration deadline)
 */
export function isSeminarUrgent(registrationDeadline: Date): boolean {
  const now = new Date();
  const deadlineTime = new Date(registrationDeadline).getTime();
  const nowTime = now.getTime();
  const hoursUntilDeadline = (deadlineTime - nowTime) / (1000 * 60 * 60);
  
  return hoursUntilDeadline <= 48 && hoursUntilDeadline > 0;
}

/**
 * Get seminar capacity percentage
 */
export async function getSeminarCapacity(seminarId: string): Promise<number> {
  try {
    const seminar = await prisma.seminar.findUnique({
      where: { id: seminarId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!seminar) return 0;

    const currentRegistrations = seminar._count.registrations;
    const capacity = (currentRegistrations / seminar.maxParticipants) * 100;

    return Math.min(capacity, 100); // Cap at 100%
  } catch (error) {
    console.error('Error calculating seminar capacity:', error);
    return 0;
  }
}

/**
 * Check if seminar should trigger 90% capacity alert
 */
export async function checkSeminarCapacityAlerts(): Promise<
  Array<{ seminarId: string; title: string; capacity: number }>
> {
  try {
    const seminars = await prisma.seminar.findMany({
      where: {
        status: SeminarStatus.OPEN,
      },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    const alerts: Array<{ seminarId: string; title: string; capacity: number }> = [];

    for (const seminar of seminars) {
      const currentRegistrations = seminar._count.registrations;
      const capacity = (currentRegistrations / seminar.maxParticipants) * 100;

      // Check if capacity is >= 90% and hasn't been alerted yet
      // Note: In production, you'd want to track if alert was sent to avoid spam
      if (capacity >= 90 && capacity < 100) {
        alerts.push({
          seminarId: seminar.id,
          title: seminar.title,
          capacity: Math.round(capacity),
        });
      }
    }

    return alerts;
  } catch (error) {
    console.error('Error checking seminar capacity alerts:', error);
    return [];
  }
}

/**
 * Check for scholarships expiring in 3 days
 */
export async function checkScholarshipExpiryAlerts(): Promise<
  Array<{ id: string; title: string; deadline: Date }>
> {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999); // End of day

    const now = new Date();

    const expiringPrograms = await prisma.program.findMany({
      where: {
        isActive: true,
        deadline: {
          gte: now,
          lte: threeDaysFromNow,
        },
      },
      select: {
        id: true,
        title: true,
        deadline: true,
      },
      take: 10, // Limit to prevent too many alerts
    });

    return expiringPrograms.map((p) => ({
      id: p.id,
      title: p.title,
      deadline: p.deadline,
    }));
  } catch (error) {
    console.error('Error checking scholarship expiry alerts:', error);
    return [];
  }
}

