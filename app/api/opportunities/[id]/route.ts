import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const opportunity = await prisma.program.findUnique({
      where: { id },
      include: {
        applications: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch opportunity' },
      { status: 500 }
    );
  }
}

