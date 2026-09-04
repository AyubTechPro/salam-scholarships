/**
 * Admin How It Works API
 * Manage wizard steps for GetStartedWizard
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdminAPI, requireContentDirectorAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const howItWorksStepSchema = z.object({
  stepNumber: z.number().int().min(1),
  title: z.string().min(1),
  titleRu: z.string().optional(),
  titleTj: z.string().optional(),
  description: z.string().min(1),
  descriptionRu: z.string().optional(),
  descriptionTj: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const superAdminResult = await requireSuperAdminAPI();
    const contentDirectorResult = await requireContentDirectorAPI();
    
    if (superAdminResult.error && contentDirectorResult.error) {
      return superAdminResult.error;
    }
    
    const steps = await prisma.howItWorksStep.findMany({
      orderBy: [{ order: 'asc' }, { stepNumber: 'asc' }],
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

export async function POST(request: NextRequest) {
  try {
    const superAdminResult = await requireSuperAdminAPI();
    const contentDirectorResult = await requireContentDirectorAPI();
    
    if (superAdminResult.error && contentDirectorResult.error) {
      return superAdminResult.error;
    }
    
    const { user } = superAdminResult.error ? contentDirectorResult : superAdminResult;
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = howItWorksStepSchema.parse(body);

    const step = await prisma.howItWorksStep.create({
      data: validatedData,
    });

    await logAuditAction(
      user.id,
      'CREATE',
      'HowItWorksStep',
      step.id,
      `Created step ${step.stepNumber}: ${step.title}`,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: step,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating how-it-works step:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create step' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const superAdminResult = await requireSuperAdminAPI();
    const contentDirectorResult = await requireContentDirectorAPI();
    
    if (superAdminResult.error && contentDirectorResult.error) {
      return superAdminResult.error;
    }
    
    const { user } = superAdminResult.error ? contentDirectorResult : superAdminResult;
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Step ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = howItWorksStepSchema.partial().parse(body);

    const step = await prisma.howItWorksStep.update({
      where: { id },
      data: validatedData,
    });

    await logAuditAction(
      user.id,
      'UPDATE',
      'HowItWorksStep',
      step.id,
      `Updated step ${step.stepNumber}: ${step.title}`,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: step,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating how-it-works step:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update step' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const superAdminResult = await requireSuperAdminAPI();
    const contentDirectorResult = await requireContentDirectorAPI();
    
    if (superAdminResult.error && contentDirectorResult.error) {
      return superAdminResult.error;
    }
    
    const { user } = superAdminResult.error ? contentDirectorResult : superAdminResult;
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Step ID is required' },
        { status: 400 }
      );
    }

    const step = await prisma.howItWorksStep.delete({
      where: { id },
    });

    await logAuditAction(
      user.id,
      'DELETE',
      'HowItWorksStep',
      step.id,
      `Deleted step ${step.stepNumber}: ${step.title}`,
      undefined
    );

    return NextResponse.json({
      success: true,
      message: 'Step deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting how-it-works step:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete step' },
      { status: 500 }
    );
  }
}

