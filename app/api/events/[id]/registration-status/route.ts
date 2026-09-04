import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({
        isRegistered: false,
      });
    }

    const existingBooking = await prisma.eventBooking.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: params.id,
        },
      },
    });

    return NextResponse.json({
      isRegistered: !!existingBooking,
    });
  } catch (error) {
    console.error('Error checking registration status:', error);
    return NextResponse.json({
      isRegistered: false,
    });
  }
}

