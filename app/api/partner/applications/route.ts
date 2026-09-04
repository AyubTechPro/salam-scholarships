import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a PARTNER and has a partnerId
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, partnerId: true },
    });

    if (!user || user.role !== 'PARTNER' || !user.partnerId) {
      return NextResponse.json({ success: false, error: 'Forbidden: Requires Partner Role' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      program: {
        partnerId: user.partnerId,
      },
      status: {
        not: 'DRAFT', // Partners shouldn't see draft applications
      },
    };

    if (status) {
      where.status = status;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            cvUrl: true,
            isVerified: true,
          },
        },
        program: {
          select: {
            id: true,
            title: true,
            titleRu: true,
            titleTj: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Error fetching partner applications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
