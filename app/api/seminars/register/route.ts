import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { isSeminarUrgent } from '@/lib/seminar-utils';
import { sendNotificationIfEnabled } from '@/lib/telegram';

const registrationSchema = z.object({
  seminarId: z.string().min(1),
  name: z.string().min(1).optional(), // Optional if user is logged in
  email: z.string().email().optional(), // Optional if user is logged in
  phone: z.string().optional(), // Optional if user is logged in
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const validatedData = registrationSchema.parse(body);

    // Check if seminar exists and is open
    const seminar = await prisma.seminar.findUnique({
      where: { id: validatedData.seminarId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!seminar) {
      return NextResponse.json(
        { success: false, error: 'Seminar not found' },
        { status: 404 }
      );
    }

    if (seminar.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: 'Registration is closed for this seminar' },
        { status: 400 }
      );
    }

    // Check if registration deadline has passed
    const now = new Date();
    if (new Date(seminar.registrationDeadline) < now) {
      return NextResponse.json(
        { success: false, error: 'Registration deadline has passed' },
        { status: 400 }
      );
    }

    // Check if seminar is full
    if (seminar._count.registrations >= seminar.maxParticipants) {
      return NextResponse.json(
        { success: false, error: 'Seminar is full' },
        { status: 400 }
      );
    }

    // If user is logged in, use their data
    let userId: string | null = null;
    if (session?.user?.id) {
      userId = session.user.id;
    } else if (validatedData.email) {
      // Try to find user by email
      const user = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });
      if (user) {
        userId = user.id;
      }
    }

    // Check if already registered
    if (userId) {
      const existingRegistration = await prisma.seminarRegistration.findUnique({
        where: {
          userId_seminarId: {
            userId,
            seminarId: validatedData.seminarId,
          },
        },
      });

      if (existingRegistration) {
        return NextResponse.json(
          { success: false, error: 'You are already registered for this seminar' },
          { status: 400 }
        );
      }
    }

    // Create registration
    const registration = await prisma.seminarRegistration.create({
      data: {
        userId: userId!,
        seminarId: validatedData.seminarId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        seminar: {
          select: {
            title: true,
            date: true,
          },
        },
      },
    });

    // Check capacity after registration
    const newCapacity = ((seminar._count.registrations + 1) / seminar.maxParticipants) * 100;
    
    // Send alert if 90% capacity reached
    if (newCapacity >= 90 && newCapacity < 100) {
      const alertMessage = `🚨 <b>Seminar Capacity Alert</b>\n\n📚 <b>${seminar.title}</b>\n\nCapacity: <b>${Math.round(newCapacity)}%</b> (${seminar._count.registrations + 1}/${seminar.maxParticipants})\n\nAlmost full!`;
      await sendNotificationIfEnabled(alertMessage);
    }

    // Auto-expire seminar if full
    if (seminar._count.registrations + 1 >= seminar.maxParticipants) {
      await prisma.seminar.update({
        where: { id: validatedData.seminarId },
        data: { status: 'CLOSED' },
      });
    }

    return NextResponse.json({
      success: true,
      data: registration,
      message: 'Successfully registered for seminar',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error registering for seminar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register for seminar' },
      { status: 500 }
    );
  }
}









