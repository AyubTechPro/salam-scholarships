import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Use Node.js runtime for Prisma

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'global' },
      select: { maintenanceMode: true },
    });

    const res = NextResponse.json({
      maintenanceMode: settings?.maintenanceMode || false,
    });
    res.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    return res;
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    // Fail open - return false on error
    const res = NextResponse.json({ maintenanceMode: false });
    res.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    return res;
  }
}

