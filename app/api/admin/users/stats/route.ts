import { NextRequest, NextResponse } from 'next/server';
import { requireAnyAdminAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAnyAdminAPI();
    if (error) return error;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count users registered today
    const signupsToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Count total users
    const totalUsers = await prisma.user.count();

    // Count logins today (users who have active sessions today)
    // Note: This is a simplified count. For accurate login tracking, you'd need to
    // store login timestamps in a separate table or use session logs
    const sessionsToday = await prisma.session.findMany({
      where: {
        expires: {
          gte: today,
        },
      },
      select: {
        userId: true,
      },
    });
    
    // Get unique user IDs
    const uniqueUserIds = new Set(sessionsToday.map((s) => s.userId).filter(Boolean));
    const loginsToday = uniqueUserIds.size;

    return NextResponse.json({
      success: true,
      data: {
        loginsToday,
        signupsToday,
        totalUsers,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}

