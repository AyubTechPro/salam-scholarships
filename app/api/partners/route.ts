import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const partners = await prisma.partner.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { isVerified: 'desc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        nameRu: true,
        nameTj: true,
        logo: true,
        website: true,
        description: true,
        descriptionRu: true,
        descriptionTj: true,
        country: true,
        type: true,
        isVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: partners,
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

