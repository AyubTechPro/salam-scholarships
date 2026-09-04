import { NextResponse } from 'next/server';
import { getGlobalStats } from '@/lib/stats';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const stats = await getGlobalStats();
    
    // Get users count if not already included
    if (!stats.users) {
      const usersCount = await prisma.user.count({
        where: { role: 'USER', emailVerified: { not: null } },
      });
      stats.users = Math.max(usersCount, 2000);
    }
    
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
