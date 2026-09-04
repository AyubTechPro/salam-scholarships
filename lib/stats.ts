/**
 * Global Stats Calculation (Hybrid Engine)
 * Combines real database counts with manual marketing offsets
 */

import { prisma } from '@/lib/prisma';

export type GlobalStats = {
  programs: number;
  countries: number;
  consultations: number;
  users?: number;
};

export async function getGlobalStats(): Promise<GlobalStats> {
  try {
    // Get manual offsets from SiteStats
    const siteStats = await prisma.siteStats.findUnique({
      where: { id: 'global' },
    });

    // If no SiteStats exists, create default with marketing offsets
    if (!siteStats) {
      await prisma.siteStats.create({
        data: {
          id: 'global',
          manualProgramsOffset: 150,
          manualCountriesOffset: 30,
          manualConsultationsBase: 2000,
          showLiveCounts: true,
        },
      });
    }

    const offsets = siteStats || {
      manualProgramsOffset: 150,
      manualCountriesOffset: 30,
      manualConsultationsBase: 2000,
      showLiveCounts: true,
    };

    // Get real counts from database
    const [realProgramsCount, realConsultationsCount, realUsersCount, programsWithCountries] = await Promise.all([
      prisma.program.count({
        where: { isActive: true, isVerified: true },
      }),
      prisma.consultationRequest.count(),
      prisma.user.count({
        where: { role: 'USER', emailVerified: { not: null } },
      }),
      prisma.program.findMany({
        where: { isActive: true, isVerified: true },
        select: { country: true },
        distinct: ['country'],
      }),
    ]);

    // Calculate unique countries from programs
    const uniqueCountries = new Set(programsWithCountries.map(p => p.country));
    const realCountriesCount = uniqueCountries.size;

    // Hybrid calculation with baseline guarantees
    // Always show at least the baseline numbers even if DB is empty
    const stats: GlobalStats = {
      programs: Math.max(
        offsets.showLiveCounts
          ? realProgramsCount + offsets.manualProgramsOffset
          : offsets.manualProgramsOffset,
        150 // Minimum baseline
      ),
      countries: Math.max(
        offsets.showLiveCounts
          ? realCountriesCount + offsets.manualCountriesOffset
          : offsets.manualCountriesOffset,
        30 // Minimum baseline
      ),
      consultations: Math.max(
        offsets.showLiveCounts
          ? realConsultationsCount + offsets.manualConsultationsBase
          : offsets.manualConsultationsBase,
        2000 // Minimum baseline
      ),
      users: Math.max(realUsersCount, 2000), // At least 2000+ users
    };

    return stats;
  } catch (error) {
    console.error('Error calculating global stats:', error);
    // Return fallback stats with baseline numbers
    return {
      programs: 150,
      countries: 30,
      consultations: 2000,
      users: 2000,
    };
  }
}

