import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SeminarStatus } from '@prisma/client';
import { isSeminarUrgent } from '@/lib/seminar-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as SeminarStatus | null;
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    const now = new Date();

    // Auto-expire seminars before fetching
    await prisma.seminar.updateMany({
      where: {
        status: SeminarStatus.OPEN,
        registrationDeadline: {
          lt: now,
        },
      },
      data: {
        status: SeminarStatus.CLOSED,
      },
    });

    const where: any = {
      status: includeArchived
        ? undefined
        : {
            not: SeminarStatus.ARCHIVED,
          },
    };

    if (status) {
      where.status = status;
    } else if (!includeArchived) {
      where.status = {
        not: SeminarStatus.ARCHIVED,
      };
    }

    const seminars = await prisma.seminar.findMany({
      where,
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { date: 'asc' },
      take: limit,
    });

    // Add urgency flag to each seminar
    const seminarsWithUrgency = seminars.map((seminar) => ({
      ...seminar,
      isUrgent: isSeminarUrgent(seminar.registrationDeadline),
      capacityPercentage: Math.round((seminar._count.registrations / seminar.maxParticipants) * 100),
    }));

    return NextResponse.json({
      success: true,
      data: seminarsWithUrgency,
    });
  } catch (error) {
    console.error('Error fetching seminars:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seminars' },
      { status: 500 }
    );
  }
}









