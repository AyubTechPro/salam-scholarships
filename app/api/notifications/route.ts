import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAnyAdminAPI } from '@/lib/rbac-api';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For admins, get all notifications (or filtered by userId)
    // For regular users, get only their notifications
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isAdmin = user?.role && ['SUPER_ADMIN', 'CONTENT_DIRECTOR', 'GROWTH_MANAGER', 'ADMIN', 'CONSULTANT'].includes(user.role);

    const where: any = {};
    if (isAdmin) {
      // Admins see notifications for all admins (userId = null) or their own
      where.OR = [
        { userId: null },
        { userId: session.user.id },
      ];
    } else {
      // Regular users only see their own notifications
      where.userId = session.user.id;
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 most recent
    });

    // Count unread
    const unreadCount = await prisma.notification.count({
      where: {
        ...where,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId, isRead } = body;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: isRead !== undefined ? isRead : true,
        readAt: isRead !== false ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

