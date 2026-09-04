import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in to register for events.' },
        { status: 401 }
      );
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.isActive) {
      return NextResponse.json(
        { success: false, error: 'Event is not active' },
        { status: 400 }
      );
    }

    if (event.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: 'Registration is closed for this event' },
        { status: 400 }
      );
    }

    // Check if registration deadline has passed
    const now = new Date();
    if (event.registrationDeadline && new Date(event.registrationDeadline) < now) {
      return NextResponse.json(
        { success: false, error: 'Registration deadline has passed' },
        { status: 400 }
      );
    }

    // Check capacity
    const currentBookings = await prisma.eventBooking.count({
      where: { eventId: params.id },
    });

    if (event.maxParticipants && currentBookings >= event.maxParticipants) {
      return NextResponse.json(
        { success: false, error: 'Event is full' },
        { status: 400 }
      );
    }

    // Check if user already registered
    const existingBooking = await prisma.eventBooking.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: params.id,
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: 'You are already registered for this event' },
        { status: 400 }
      );
    }

    // Generate QR code
    const qrCode = crypto.randomBytes(16).toString('hex');

    // Create booking
    const booking = await prisma.eventBooking.create({
      data: {
        userId: session.user.id,
        eventId: params.id,
        qrCode,
      },
    });

    // Check capacity after registration and send alert if 90% reached
    const newBookingsCount = await prisma.eventBooking.count({
      where: { eventId: params.id },
    });

    if (event.maxParticipants) {
      const capacityPercentage = (newBookingsCount / event.maxParticipants) * 100;

      // Send Telegram alert if 90% capacity reached
      if (capacityPercentage >= 90 && capacityPercentage < 100) {
        const { sendNotificationIfEnabled } = await import('@/lib/telegram');
        const alertMessage = `🚨 <b>Event Capacity Alert</b>\n\n📚 <b>${event.title}</b>\n\nCapacity: <b>${Math.round(capacityPercentage)}%</b> (${newBookingsCount}/${event.maxParticipants})\n\nAlmost full!`;
        await sendNotificationIfEnabled(alertMessage);
      }

      // Auto-close event if full
      if (newBookingsCount >= event.maxParticipants) {
        await prisma.event.update({
          where: { id: params.id },
          data: { status: 'CLOSED' },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Successfully registered for event',
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register for event' },
      { status: 500 }
    );
  }
}

