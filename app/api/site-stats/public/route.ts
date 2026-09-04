import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Unified Stats API - "Smart Stats Engine"
 * Calculates: DB_Count + Admin_Offset
 * Returns consistent numbers for Hero and TrustBar
 */
export async function GET() {
  try {
    // Get SiteStats configuration (offsets)
    let siteStats = await prisma.siteStats.findUnique({
      where: { id: 'global' },
    });

    // If no stats exist, create default
    if (!siteStats) {
      siteStats = await prisma.siteStats.create({
        data: {
          id: 'global',
          manualProgramsOffset: 0,
          manualCountriesOffset: 0,
          manualConsultationsBase: 2000,
          showLiveCounts: true,
          heroStatsOpportunities: 500,
          heroStatsCountries: 50,
          heroStatsStudents: 10000,
        },
      });
    }

    const offsets = siteStats;

    // Get real database counts
    const [realProgramsCount, realUsersCount, realConsultationsCount, programsWithCountries] = await Promise.all([
      prisma.program.count({
        where: { isActive: true, isVerified: true },
      }),
      prisma.user.count({
        where: { role: 'USER', emailVerified: { not: null } },
      }),
      prisma.consultationRequest.count(),
      prisma.program.findMany({
        where: { isActive: true, isVerified: true },
        select: { country: true },
        distinct: ['country'],
      }),
    ]);

    // Calculate unique countries
    const uniqueCountries = new Set(programsWithCountries.map(p => p.country));
    const realCountriesCount = uniqueCountries.size;

    // Calculate final stats: DB_Count + Admin_Offset
    const opportunities = offsets.showLiveCounts
      ? Math.max(realProgramsCount + offsets.manualProgramsOffset, 150)
      : Math.max(offsets.manualProgramsOffset, 150);

    const countries = offsets.showLiveCounts
      ? Math.max(realCountriesCount + offsets.manualCountriesOffset, 30)
      : Math.max(offsets.manualCountriesOffset, 30);

    // For students, use users count
    const students = Math.max(realUsersCount, 2000);

    // Calculate consultations: DB_Count + Admin_Offset
    const consultations = offsets.showLiveCounts
      ? Math.max(realConsultationsCount + offsets.manualConsultationsBase, 2000)
      : Math.max(offsets.manualConsultationsBase, 2000);

    // Return unified stats
    return NextResponse.json({
      success: true,
      data: {
        // Calculated stats (DB + Offset) - PRIMARY FIELDS
        opportunities,
        countries,
        students,
        consultations,
        // Legacy fields for backward compatibility (using calculated values)
        heroStatsOpportunities: opportunities,
        heroStatsCountries: countries,
        heroStatsStudents: students,
        // For backward compatibility with /api/stats
        programs: opportunities,
        users: students,
        // Admin offsets (for reference)
        manualProgramsOffset: offsets.manualProgramsOffset,
        manualCountriesOffset: offsets.manualCountriesOffset,
        manualConsultationsBase: offsets.manualConsultationsBase,
        showLiveCounts: offsets.showLiveCounts,
      },
    });
  } catch (error) {
    console.error('Error fetching site stats:', error);
    // Return safe defaults
    return NextResponse.json({
      success: true,
      data: {
        opportunities: 500,
        countries: 50,
        students: 10000,
        consultations: 2000,
        heroStatsOpportunities: 500,
        heroStatsCountries: 50,
        heroStatsStudents: 10000,
        programs: 500,
        users: 10000,
        manualProgramsOffset: 0,
        manualCountriesOffset: 0,
        manualConsultationsBase: 2000,
        showLiveCounts: true,
      },
    });
  }
}

