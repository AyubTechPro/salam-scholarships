/**
 * Event Auto-Janitor Utilities
 * Automatically manages event status based on deadlines
 */

import { prisma } from './prisma';
import { EventStatus } from '@prisma/client';

/**
 * Auto-close events: Update status to CLOSED when registration deadline passes
 * This should be called periodically (via cron job or scheduled function)
 */
export async function autoCloseEvents(): Promise<{
  closed: number;
  archived: number;
}> {
  const now = new Date();
  let closed = 0;
  let archived = 0;

  try {
    // Close events where registration deadline has passed but date hasn't
    const closedResult = await prisma.event.updateMany({
      where: {
        status: EventStatus.OPEN,
        registrationDeadline: {
          lt: now,
        },
        startDate: {
          gte: now, // Event date hasn't passed yet
        },
      },
      data: {
        status: EventStatus.CLOSED,
      },
    });
    closed = closedResult.count;

    // Archive events where the date has passed (more than 7 days ago)
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const archivedResult = await prisma.event.updateMany({
      where: {
        status: {
          in: [EventStatus.OPEN, EventStatus.CLOSED],
        },
        endDate: {
          lt: sevenDaysAgo, // End date passed more than 7 days ago
        },
      },
      data: {
        status: EventStatus.ARCHIVED,
      },
    });
    archived = archivedResult.count;

    return { closed, archived };
  } catch (error) {
    console.error('Error auto-closing events:', error);
    return { closed: 0, archived: 0 };
  }
}

/**
 * Check if event is urgent (within 48 hours of registration deadline)
 */
export function isEventUrgent(registrationDeadline: Date): boolean {
  const now = new Date();
  const deadlineTime = new Date(registrationDeadline).getTime();
  const nowTime = now.getTime();
  const hoursUntilDeadline = (deadlineTime - nowTime) / (1000 * 60 * 60);
  
  return hoursUntilDeadline <= 48 && hoursUntilDeadline > 0;
}

/**
 * Get event capacity percentage
 */
export async function getEventCapacity(eventId: string): Promise<number> {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!event || !event.maxParticipants) return 0;

    const currentRegistrations = event._count.bookings;
    const capacity = (currentRegistrations / event.maxParticipants) * 100;

    return Math.min(capacity, 100); // Cap at 100%
  } catch (error) {
    console.error('Error calculating event capacity:', error);
    return 0;
  }
}

/**
 * Check if event should trigger 90% capacity alert
 */
export async function checkEventCapacityAlerts(): Promise<
  Array<{ eventId: string; title: string; capacity: number }>
> {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: EventStatus.OPEN,
        isActive: true,
        maxParticipants: {
          not: null,
        },
      },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    const alerts: Array<{ eventId: string; title: string; capacity: number }> = [];

    for (const event of events) {
      if (!event.maxParticipants) continue;

      const currentRegistrations = event._count.bookings;
      const capacity = (currentRegistrations / event.maxParticipants) * 100;

      // Check if capacity is >= 90% and hasn't been alerted yet
      if (capacity >= 90 && capacity < 100) {
        alerts.push({
          eventId: event.id,
          title: event.title,
          capacity: Math.round(capacity),
        });
      }
    }

    return alerts;
  } catch (error) {
    console.error('Error checking event capacity alerts:', error);
    return [];
  }
}

