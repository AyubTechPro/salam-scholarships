import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdminAPI, requireGrowthManagerAPI } from '@/lib/rbac-api';
import { canPerformAction, logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // SUPER_ADMIN has full access, GROWTH_MANAGER can view applications
    // CONTENT_DIRECTOR should NOT access applications
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
          { success: false, error: 'Forbidden: Insufficient permissions to view applications' },
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
    if (!(await canPerformAction('VIEW', 'APPLICATION'))) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    // Get total count for pagination
    const total = await prisma.application.count({ where });

    const applications = await prisma.application.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        program: {
          select: {
            id: true,
            title: true,
            titleRu: true,
            titleTj: true,
            country: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Log audit action
    await logAuditAction(
      user.id,
      'VIEW',
      'APPLICATION',
      undefined,
      'Viewed applications list',
      { page, limit, total, status: status || 'all' }
    );

    return NextResponse.json({
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

