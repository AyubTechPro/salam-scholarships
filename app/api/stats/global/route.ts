import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get real counts from database
    const [realProgramsCount, realConsultationsCount, programsWithCountries] = await Promise.all([
      prisma.program.count({
        where: { isActive: true, isVerified: true },
      }),
      prisma.consultationRequest.count(),
      prisma.program.findMany({
        where: { isActive: true, isVerified: true },
        select: { country: true },
        distinct: ['country'],
      }),
    ]);

    const uniqueCountries = new Set(programsWithCountries.map(p => p.country));
    const realCountriesCount = uniqueCountries.size;

    return NextResponse.json({
      success: true,
      data: {
        realPrograms: realProgramsCount,
        realCountries: realCountriesCount,
        realConsultations: realConsultationsCount,
      },
    });
  } catch (error) {
    console.error('Error fetching global stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch global stats' },
      { status: 500 }
    );
  }
}
