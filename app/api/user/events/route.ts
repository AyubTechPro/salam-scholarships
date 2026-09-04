import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all events the user is registered for
    const bookings = await prisma.eventBooking.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            titleRu: true,
            titleTj: true,
            description: true,
            descriptionRu: true,
            descriptionTj: true,
            type: true,
            startDate: true,
            endDate: true,
            location: true,
            meetingUrl: true,
            image: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format events
    const events = bookings.map((booking) => ({
      id: booking.event.id,
      title: booking.event.title,
      titleRu: booking.event.titleRu,
      titleTj: booking.event.titleTj,
      description: booking.event.description,
      descriptionRu: booking.event.descriptionRu,
      descriptionTj: booking.event.descriptionTj,
      type: booking.event.type,
      startDate: booking.event.startDate.toISOString(),
      endDate: booking.event.endDate?.toISOString() || null,
      location: booking.event.location,
      meetingUrl: booking.event.meetingUrl,
      imageUrl: booking.event.image,
      status: booking.event.status,
      registeredAt: booking.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error('Error fetching user events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user events' },
      { status: 500 }
    );
  }
}

