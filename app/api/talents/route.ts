import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const role = searchParams.get('role');

    // Build query to strictly return VERIFIED students who have completed their profiles.
    const where: any = {
      role: 'USER',
      isVerified: true, // Core Upwork Trust Law
      // Only show students who've filled out their fundamental info
      name: { not: null },
      profession: { not: null },
    };

    if (country) {
      where.country = country;
    }

    const talents = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        country: true,
        profession: true,
        educationPlace: true,
        languageLevel: true,
        bio: true,
        cvUrl: true,
        image: true,
        // CRITICAL DE-RISK: Expose CV securely depending on your platform rules? 
        // We do NOT expose email or phone number to prevent platform bypass.
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to top 50 verified profiles for performance
    });

    return NextResponse.json({
      success: true,
      data: talents,
    });
  } catch (error) {
    console.error('Error fetching talents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load talent directory' },
      { status: 500 }
    );
  }
}
