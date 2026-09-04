/**
 * User Activity Tracker
 * Logs user actions for analytics and admin insights
 */

import { prisma } from './prisma';

export type ActivityType = 'VIEW' | 'SEARCH' | 'SAVE' | 'APPLY' | 'CLICK' | 'DOWNLOAD' | 'SHARE';
export type EntityType = 'PROGRAM' | 'CATEGORY' | 'COUNTRY' | 'PAGE' | 'OPPORTUNITY' | 'EVENT' | 'VIDEO';

export interface ActivityMetadata {
  query?: string;
  filters?: Record<string, any>;
  country?: string;
  category?: string;
  level?: string;
  funding?: string;
  [key: string]: any;
}

/**
 * Log user activity
 */
export async function logUserActivity(
  userId: string | null,
  activityType: ActivityType,
  entityType: EntityType,
  entityId?: string | null,
  metadata?: ActivityMetadata
): Promise<void> {
  try {
    await prisma.userActivity.create({
      data: {
        userId: userId || undefined,
        activityType,
        entityType,
        entityId: entityId || undefined,
        metadata: metadata ? metadata : undefined,
      },
    });
  } catch (error) {
    // Don't fail the request if activity logging fails
    console.error('Error logging user activity:', error);
  }
}

/**
 * Get recent activities for admin panel
 */
export async function getRecentActivities(limit: number = 50) {
  try {
    const activities = await prisma.userActivity.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return activities;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
}

/**
 * Get user activity summary
 */
export async function getUserActivitySummary(userId: string) {
  try {
    const [totalActivities, byType, recent] = await Promise.all([
      prisma.userActivity.count({
        where: { userId },
      }),
      prisma.userActivity.groupBy({
        by: ['activityType'],
        where: { userId },
        _count: true,
      }),
      prisma.userActivity.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      totalActivities,
      byType: byType.reduce((acc, item) => {
        acc[item.activityType] = item._count;
        return acc;
      }, {} as Record<string, number>),
      recent,
    };
  } catch (error) {
    console.error('Error fetching user activity summary:', error);
    return {
      totalActivities: 0,
      byType: {},
      recent: [],
    };
  }
}

