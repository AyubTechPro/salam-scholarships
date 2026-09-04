import { NextRequest, NextResponse } from 'next/server';
import { requireAnyAdminAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAnyAdminAPI();
    if (error) return error;

    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: subscribers });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

