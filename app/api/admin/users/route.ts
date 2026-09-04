import { NextRequest, NextResponse } from 'next/server';
import { requireAnyAdminAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAnyAdminAPI();
    if (error) return error;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        country: true,
        createdAt: true,
        role: true,
        crmStatus: true,
        internalNotes: true,
        cvUrl: true,
        passportUrl: true,
        transcriptUrl: true,
        isVerified: true,
        applicationTokens: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

