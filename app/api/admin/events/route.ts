import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { canPerformAction, logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  titleRu: z.string().optional(),
  titleTj: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  descriptionRu: z.string().optional(),
  descriptionTj: z.string().optional(),
  type: z.enum(['ONLINE', 'OFFLINE']),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)).optional().nullable(),
  registrationDeadline: z.string().transform((str) => new Date(str)),
  location: z.string().optional().nullable(),
  meetingUrl: z.string().url().optional().nullable(),
  image: z.string().url().optional().nullable().or(z.literal('')),
  maxParticipants: z.number().int().positive().optional().nullable(),
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED']).default('DRAFT'),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireContentDirectorAPI();
    if (error) return error;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Auto-close events before fetching
    const { autoCloseEvents } = await import('@/lib/event-utils');
    await autoCloseEvents();

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        skip,
        take: limit,
        orderBy: { startDate: 'desc' },
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
          registrationDeadline: true,
          location: true,
          meetingUrl: true,
          image: true,
          maxParticipants: true,
          status: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { bookings: true },
          },
        },
      }),
      prisma.event.count(),
    ]);

    // Format events to include registeredCount
    const formattedEvents = events.map(event => ({
      ...event,
      registeredCount: event._count.bookings,
      imageUrl: event.image, // Legacy support
    }));

    return NextResponse.json({
      success: true,
      data: formattedEvents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireContentDirectorAPI();
    if (error) return error;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check permission
    if (!(await canPerformAction('CREATE', 'EVENT'))) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions to create events' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = eventSchema.parse(body);

    const event = await prisma.event.create({
      data: validatedData,
    });

    // Log audit action
    await logAuditAction(
      user.id,
      'CREATE',
      'EVENT',
      event.id,
      `Created event: ${event.title}`,
      {
        title: event.title,
        type: event.type,
        startDate: event.startDate,
      }
    );

    // Create StudentNotification for all registered users when a new Event is created
    if (event.isActive && event.status === 'OPEN') {
      const allUsers = await prisma.user.findMany({
        where: {
          role: 'USER', // Only notify regular students, not admins
        },
        select: { id: true },
      });

      // Create notifications for all users (batch create for performance)
      if (allUsers.length > 0) {
        await prisma.studentNotification.createMany({
          data: allUsers.map((u) => ({
            userId: u.id,
            type: 'NEW_SEMINAR',
            title: 'New Seminar Available! 📅',
            message: `A new ${event.type.toLowerCase()} event "${event.title}" has been added. Register now to secure your spot!`,
            link: `/dashboard?tab=events`,
            priority: 'NORMAL',
          })),
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: event,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { error, user } = await requireContentDirectorAPI();
    if (error) return error;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    if (!(await canPerformAction('UPDATE', 'EVENT'))) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = eventSchema.partial().parse(body);

    const event = await prisma.event.update({
      where: { id: eventId },
      data: validatedData,
    });

    await logAuditAction(
      user.id,
      'UPDATE',
      'EVENT',
      event.id,
      `Updated event: ${event.title}`,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { error, user } = await requireContentDirectorAPI();
    if (error) return error;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    if (!(await canPerformAction('DELETE', 'EVENT'))) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    await logAuditAction(
      user.id,
      'DELETE',
      'EVENT',
      eventId,
      `Deleted event: ${event.title}`,
      { deletedEvent: { title: event.title } }
    );

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

