import { NextRequest, NextResponse } from 'next/server';
import { requireAnyAdminAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAnyAdminAPI();
    if (error) return error;

    // Check database health
    let databaseStatus: 'healthy' | 'warning' | 'error' = 'healthy';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      databaseStatus = 'error';
    }

    // Check Cloudinary health (simple check - try to access env var)
    let cloudinaryStatus: 'healthy' | 'warning' | 'error' = 'healthy';
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      cloudinaryStatus = 'warning';
    }

    return NextResponse.json({
      success: true,
      data: {
        database: databaseStatus,
        cloudinary: cloudinaryStatus,
        lastChecked: new Date(),
      },
    });
  } catch (error) {
    console.error('Error checking system health:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check system health' },
      { status: 500 }
    );
  }
}

