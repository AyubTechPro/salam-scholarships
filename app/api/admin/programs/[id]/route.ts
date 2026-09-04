import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI, requireGrowthManagerAPI } from '@/lib/rbac-api';
import { canPerformAction, logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ProgramLevel, FundingType, ProgramCategory } from '@prisma/client';

const programSchema = z.object({
  title: z.string().min(1).optional(),
  titleRu: z.string().optional(),
  titleTj: z.string().optional(),
  description: z.string().min(10).optional(),
  descriptionRu: z.string().optional(),
  descriptionTj: z.string().optional(),
  slug: z.string().min(1).optional(),
  level: z.nativeEnum(ProgramLevel).optional(),
  category: z.nativeEnum(ProgramCategory).optional(),
  fundingType: z.nativeEnum(FundingType).optional(),
  country: z.string().min(1).optional(),
  institution: z.string().min(1).optional(),
  deadline: z.string().transform((str) => new Date(str)).optional(),
  startDate: z.string().optional().transform((str) => (str ? new Date(str) : null)),
  endDate: z.string().optional().transform((str) => (str ? new Date(str) : null)),
  imageUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  officialWebsiteUrl: z.string().url().optional().or(z.literal('')),
  promoSocialLink: z.string().url().optional().or(z.literal('')),
  applicationUrl: z.string().url().optional().or(z.literal('')),
  region: z.enum(['EUROPE', 'ASIA', 'NORTH_AMERICA', 'OCEANIA', 'AFRICA']).optional().nullable(),
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  requiresEnglishCert: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireContentDirectorAPI();
    if (error) return error;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check permission
    if (!(await canPerformAction('UPDATE', 'PROGRAM'))) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions to update programs' },
        { status: 403 }
      );
    }

    // Get existing program for audit log
    const existingProgram = await prisma.program.findUnique({
      where: { id: params.id },
    });

    if (!existingProgram) {
      return NextResponse.json(
        { success: false, error: 'Program not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = programSchema.parse(body);

    // Check if slug is being changed and if it conflicts
    if (validatedData.slug) {
      const existing = await prisma.program.findUnique({
        where: { slug: validatedData.slug },
      });

      if (existing && existing.id !== params.id) {
        return NextResponse.json(
          { success: false, error: 'A program with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const program = await prisma.program.update({
      where: { id: params.id },
      data: validatedData,
    });

    // Notify users if program was just activated or updated
    if (program.isActive && (!existingProgram.isActive || existingProgram.title !== program.title)) {
      try {
        const { notifyUsersAboutNewOpportunity } = await import('@/lib/telegram-notifications');
        await notifyUsersAboutNewOpportunity({
          id: program.id,
          title: program.title,
          titleRu: program.titleRu,
          titleTj: program.titleTj,
          level: program.level,
          country: program.country,
          category: program.category,
          slug: program.slug,
        });
      } catch (error) {
        console.error('Error notifying users about updated opportunity:', error);
        // Don't fail the request if notification fails
      }
    }

    // Log audit action
    await logAuditAction(
      user.id,
      'UPDATE',
      'PROGRAM',
      program.id,
      `Updated program: ${program.title}`,
      {
        previous: {
          title: existingProgram.title,
          category: existingProgram.category,
          isActive: existingProgram.isActive,
        },
        current: {
          title: program.title,
          category: program.category,
          isActive: program.isActive,
        },
      }
    );

    return NextResponse.json({
      success: true,
      data: program,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating program:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update program' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireContentDirectorAPI();
    if (error) return error;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check permission
    if (!(await canPerformAction('DELETE', 'PROGRAM'))) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions to delete programs' },
        { status: 403 }
      );
    }

    // Get program details for audit log before deletion
    const program = await prisma.program.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        category: true,
        country: true,
        institution: true,
      },
    });

    if (!program) {
      return NextResponse.json(
        { success: false, error: 'Program not found' },
        { status: 404 }
      );
    }

    await prisma.program.delete({
      where: { id: params.id },
    });

    // Log audit action
    await logAuditAction(
      user.id,
      'DELETE',
      'PROGRAM',
      params.id,
      `Deleted program: ${program.title}`,
      {
        deletedProgram: {
          title: program.title,
          category: program.category,
          country: program.country,
          institution: program.institution,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Program deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete program' },
      { status: 500 }
    );
  }
}

