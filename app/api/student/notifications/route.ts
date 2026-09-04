import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuthAPI();
    if (authResult.error) {
      return authResult.error;
    }
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where: any = { userId: authResult.user.id };
    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.studentNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.studentNotification.count({
      where: { userId: authResult.user.id, isRead: false },
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching student notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuthAPI();
    if (authResult.error) {
      return authResult.error;
    }
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, isRead } = body;

    if (id) {
      // Mark single notification as read
      await prisma.studentNotification.update({
        where: { id },
        data: { isRead: true, readAt: new Date() },
      });
    } else if (isRead === false) {
      // Mark all as read
      await prisma.studentNotification.updateMany({
        where: { userId: authResult.user.id, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Notification updated',
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

