/**
 * Partner Dashboard API
 * Analytics and Leads for Partner organizations
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAnyAdminAPI } from '@/lib/rbac-api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin access
    const rbacResult = await requireAnyAdminAPI();
    if (rbacResult.error) {
      return rbacResult.error;
    }

    const partner = await prisma.partner.findUnique({
      where: { id: params.id },
      include: {
        programs: {
          select: {
            id: true,
            title: true,
            viewCount: true,
            createdAt: true,
          },
          orderBy: { viewCount: 'desc' },
        },
        leads: {
          select: {
            id: true,
            name: true,
            email: true,
            profession: true,
            country: true,
            source: true,
            createdAt: true,
            program: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: {
          select: {
            programs: true,
            leads: true,
          },
        },
      },
    });

    if (!partner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Partner not found',
        },
        { status: 404 }
      );
    }

    // Calculate analytics
    const totalViews = partner.programs.reduce((sum, p) => sum + p.viewCount, 0);
    const analytics = {
      totalViews,
      totalLeads: partner._count.leads,
      totalPrograms: partner._count.programs,
      averageViewsPerProgram: partner._count.programs > 0 
        ? Math.round(totalViews / partner._count.programs) 
        : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        partner,
        analytics,
      },
    });
  } catch (error) {
    console.error('Error fetching partner data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch partner data',
      },
      { status: 500 }
    );
  }
}

