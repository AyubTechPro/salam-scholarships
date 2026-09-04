import { prisma } from './prisma';

/**
 * Create a notification for admins (userId is null for all admins)
 */
export async function createNotification(
  userId: string | null,
  type: string,
  title: string,
  message: string,
  link?: string,
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL'
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
        priority,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Create a notification for a student
 */
export async function createStudentNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string,
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL'
) {
  try {
    const notification = await prisma.studentNotification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
        priority,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating student notification:', error);
    return null;
  }
}

/**
 * Create notifications for all students (e.g., new seminar announcement)
 */
export async function createBroadcastNotification(
  type: string,
  title: string,
  message: string,
  link?: string,
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL'
) {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'USER',
        emailVerified: { not: null },
      },
      select: { id: true },
    });

    const notifications = await Promise.all(
      users.map((user) =>
        prisma.studentNotification.create({
          data: {
            userId: user.id,
            type,
            title,
            message,
            link,
            priority,
          },
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error('Error creating broadcast notification:', error);
    return [];
  }
}

