import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';
import { generateApplicationRoadmap } from '@/lib/ai-roadmap-generator';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuthAPI();
    if (error || !user) return error;

    const { programId, locale = 'en' } = await request.json();

    if (!programId) {
      return NextResponse.json({ success: false, error: 'programId is required' }, { status: 400 });
    }

    // Fetch User and Program details
    const [userProfile, program] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, country: true }
      }),
      prisma.program.findUnique({
        where: { id: programId },
        select: { id: true, title: true, country: true, level: true, deadline: true, isActive: true }
      })
    ]);

    if (!userProfile) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    if (!program) return NextResponse.json({ success: false, error: 'Program not found' }, { status: 404 });
    if (!program.isActive) return NextResponse.json({ success: false, error: 'Program is no longer active' }, { status: 400 });

    // Ensure we don't spam the AI (Basic rate limit check would apply here via middleware)
    
    // Generate Roadmap
    const roadmap = await generateApplicationRoadmap(userProfile, program, locale);

    if (!roadmap) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate roadmap from AI service. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: roadmap
    });

  } catch (error) {
    console.error('[Generate Roadmap API Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate application roadmap' },
      { status: 500 }
    );
  }
}
