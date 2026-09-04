import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdminAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const siteStatsSchema = z.object({
  manualProgramsOffset: z.number().int().default(0),
  manualCountriesOffset: z.number().int().default(0),
  manualConsultationsBase: z.number().int().default(2000),
  showLiveCounts: z.boolean().default(true),
  heroStatsOpportunities: z.number().int().default(500),
  heroStatsCountries: z.number().int().default(50),
  heroStatsStudents: z.number().int().default(10000),
});

export async function GET() {
  try {
    let stats = await prisma.siteStats.findUnique({
      where: { id: 'global' },
    });

    // If no stats exist, create default
    if (!stats) {
      stats = await prisma.siteStats.create({
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

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching site stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch site stats' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminResult = await requireSuperAdminAPI();
    if (adminResult.error) return adminResult.error;
    if (!adminResult.user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = siteStatsSchema.parse(body);

    const stats = await prisma.siteStats.upsert({
      where: { id: 'global' },
      update: validatedData,
      create: {
        id: 'global',
        ...validatedData,
      },
    });

    await logAuditAction(
      adminResult.user.id,
      'UPDATE',
      'SITE_STATS',
      'global',
      'Updated site statistics offsets',
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Site stats updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating site stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update site stats' },
      { status: 500 }
    );
  }
}

