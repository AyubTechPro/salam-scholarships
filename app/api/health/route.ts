/**
 * Health Check API
 * Used for monitoring site uptime
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check if maintenance mode is active
    const siteSettings = await prisma.siteSettings.findUnique({
      where: { id: 'global' },
      select: { maintenanceMode: true },
    });

    const isHealthy = !siteSettings?.maintenanceMode;

    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'maintenance',
        timestamp: new Date().toISOString(),
        database: 'connected',
        maintenanceMode: siteSettings?.maintenanceMode || false,
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

