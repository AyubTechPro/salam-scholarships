import { NextRequest, NextResponse } from 'next/server';
import { requireAnyAdminAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAnyAdminAPI();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status && status !== 'ALL') {
      // Handle legacy status values (PENDING -> NEW)
      const normalizedStatus = status === 'PENDING' ? 'NEW' : status;
      where.status = normalizedStatus;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch consultation requests with pagination
    const [consultationRequests, total] = await Promise.all([
      prisma.consultationRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.consultationRequest.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: consultationRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching consultation requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch consultation requests' },
      { status: 500 }
    );
  }
}

