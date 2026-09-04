import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {
      isActive: true,
    };

    if (status) {
      // Handle both OPEN status and legacy status values
      if (status === 'OPEN') {
        where.status = 'OPEN';
      } else if (status === 'UPCOMING') {
        where.status = { in: ['DRAFT', 'OPEN'] };
      } else {
        where.status = status;
      }
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      take: limit,
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    // Format events with registered count
    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      titleRu: event.titleRu,
      titleTj: event.titleTj,
      description: event.description,
      descriptionRu: event.descriptionRu,
      descriptionTj: event.descriptionTj,
      type: event.type,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate?.toISOString() || null,
      location: event.location,
      meetingUrl: event.meetingUrl,
      imageUrl: event.image,
      maxCapacity: event.maxParticipants,
      registeredCount: event._count.bookings,
      status: event.status,
    }));

    return NextResponse.json({
      success: true,
      data: formattedEvents,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

