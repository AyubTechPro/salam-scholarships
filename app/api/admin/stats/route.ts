export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdminAPI, requireGrowthManagerAPI } from '@/lib/rbac-api';
import { canPerformAction, logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

// Cache the expensive aggregation queries independently of the request/auth
const getCachedStats = unstable_cache(
  async () => {
    const [totalUsers, totalPrograms, totalApplications, totalConsultations, verifiedPrograms, newsletterSubscribers] = await Promise.all([
      prisma.user.count(),
      prisma.program.count({ where: { isActive: true } }),
      prisma.application.count(),
      prisma.consultationRequest.count(),
      prisma.program.count({ where: { isVerified: true, isActive: true } }),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    ]);

    // Recent applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentApplications = await prisma.application.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    return {
      totalUsers,
      totalPrograms,
      totalApplications,
      totalConsultations,
      verifiedPrograms,
      recentApplications,
      newsletterSubscribers,
    };
  },
  ['global-admin-stats'],
  { revalidate: 300 } // Cache for 5 minutes
);

export async function GET(request: NextRequest) {
  try {
    // SUPER_ADMIN has full access, GROWTH_MANAGER can view analytics
    // CONTENT_DIRECTOR should NOT access analytics/stats
    const superAdminResult = await requireSuperAdminAPI();
    let user;
    
    if (!superAdminResult.error && superAdminResult.user) {
      user = superAdminResult.user;
    } else {
      // Try GROWTH_MANAGER
      const growthManagerResult = await requireGrowthManagerAPI();
      if (growthManagerResult.error) {
        return growthManagerResult.error;
      }
      if (!growthManagerResult.user) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Insufficient permissions to view analytics' },
          { status: 403 }
        );
      }
      user = growthManagerResult.user;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Double-check permission using canPerformAction
    if (!(await canPerformAction('VIEW', 'ANALYTICS'))) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions to view analytics' },
        { status: 403 }
      );
    }

    const stats = await getCachedStats();

    // Log audit action
    await logAuditAction(
      user.id,
      'VIEW',
      'ANALYTICS',
      undefined,
      'Viewed admin dashboard statistics',
      {}
    );

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

