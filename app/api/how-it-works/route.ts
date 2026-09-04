/**
 * Public How It Works API
 * Returns active wizard steps for GetStartedWizard component
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const steps = await prisma.howItWorksStep.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: steps,
    });
  } catch (error) {
    console.error('Error fetching how-it-works steps:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch steps' },
      { status: 500 }
    );
  }
}

