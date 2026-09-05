export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireAnyAdminAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

const getCachedInventory = unstable_cache(
  async () => {
    // Fetch all inventory stats in parallel
    const [
      totalStudents,
      totalScholarships,
      activeScholarships,
      totalAchievements,
      totalPartners,
      totalConsultations,
      pendingConsultations,
      totalEvents,
      upcomingEvents,
      totalApplications,
      pendingApplications,
    ] = await Promise.all([
      // Total registered students
      prisma.user.count({
        where: { role: 'USER' },
      }),
      // Total scholarships
      prisma.program.count(),
      // Active scholarships
      prisma.program.count({
        where: { isActive: true },
      }),
      // Total achievements
      prisma.achievement.count(),
      // Total partners
      prisma.partner.count(),
      // Total consultations
      prisma.consultationRequest.count(),
      // Pending consultations (last 7 days)
      prisma.consultationRequest.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Total events
      prisma.event.count(),
      // Upcoming events
      prisma.event.count({
        where: {
          startDate: {
            gte: new Date(),
          },
          isActive: true,
        },
      }),
      // Total applications
      prisma.application.count(),
      // Pending applications
      prisma.application.count({
        where: {
          status: 'DRAFT',
        },
      }),
    ]);

    // Get pending partnerships (recent partner inquiries)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const pendingPartnerships = await prisma.partnerLead.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    return {
      totalStudents,
      totalScholarships,
      activeScholarships,
      totalAchievements,
      totalPartners,
      pendingPartnerships,
      totalConsultations,
      pendingConsultations,
      totalEvents,
      upcomingEvents,
      totalApplications,
      pendingApplications,
    };
  },
  ['admin-inventory-cache'],
  { revalidate: 300 } // Cache for 5 minutes
);

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAnyAdminAPI();
    if (error) return error;

    const stats = await getCachedInventory();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

