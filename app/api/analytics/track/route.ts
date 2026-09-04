import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { activityType, entityType, entityId, metadata = {} } = body;

    // Silicon Valley Analytics: Extract IP, Country, and Device
    const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown';
    const country = req.headers.get('x-vercel-ip-country') || 'Unknown';
    const city = req.headers.get('x-vercel-ip-city') || 'Unknown';
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    
    // Simple device detection
    let device = 'Desktop';
    if (/mobile/i.test(userAgent)) device = 'Mobile';
    if (/tablet/i.test(userAgent)) device = 'Tablet';

    // Enhance metadata with tracking intel
    const enhancedMetadata = {
      ...metadata,
      ip,
      country,
      city,
      device,
      userAgent
    };

    // Save to database
    await prisma.userActivity.create({
      data: {
        activityType: activityType || 'VIEW',
        entityType: entityType || 'PAGE',
        entityId: entityId || null,
        metadata: enhancedMetadata
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Silent fail for analytics so we don't break the user experience
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
