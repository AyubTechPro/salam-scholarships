import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const landingContentSchema = z.object({
  heroSlides: z.array(z.object({
    imageUrl: z.string().url(),
    title: z.string(),
    titleRu: z.string().optional(),
    titleTj: z.string().optional(),
    subtitle: z.string(),
    subtitleRu: z.string().optional(),
    subtitleTj: z.string().optional(),
    ctaText: z.string(),
    ctaLink: z.string(),
  })).optional(),
  aboutTitle: z.string().optional(),
  aboutTitleRu: z.string().optional(),
  aboutTitleTj: z.string().optional(),
  aboutText: z.string().optional(),
  aboutTextRu: z.string().optional(),
  aboutTextTj: z.string().optional(),
  aboutImage: z.string().url().optional().or(z.literal('')),
  missionTitle: z.string().optional(),
  missionTitleRu: z.string().optional(),
  missionTitleTj: z.string().optional(),
  missionText: z.string().optional(),
  missionTextRu: z.string().optional(),
  missionTextTj: z.string().optional(),
  missionImage: z.string().url().optional().or(z.literal('')),
  missionValues: z.array(z.object({
    title: z.string(),
    titleRu: z.string().optional(),
    titleTj: z.string().optional(),
    description: z.string(),
    descriptionRu: z.string().optional(),
    descriptionTj: z.string().optional(),
    icon: z.string().optional(),
  })).optional(),
  pathTitle: z.string().optional(),
  pathTitleRu: z.string().optional(),
  pathTitleTj: z.string().optional(),
  pathText1: z.string().optional(),
  pathText1Ru: z.string().optional(),
  pathText1Tj: z.string().optional(),
  pathText2: z.string().optional(),
  pathText2Ru: z.string().optional(),
  pathText2Tj: z.string().optional(),
  pathImage: z.string().url().optional().or(z.literal('')),
});

export async function GET() {
  try {
    let content = await prisma.landingContent.findUnique({
      where: { id: 'landing' },
    });

    if (!content) {
      // Create default content
      content = await prisma.landingContent.create({
        data: {
          id: 'landing',
          heroSlides: [],
          missionValues: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('Error fetching landing content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch landing content' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminResult = await requireContentDirectorAPI();
    if (adminResult.error) return adminResult.error;
    if (!adminResult.user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = landingContentSchema.parse(body);

    // Clean empty strings
    const cleanedData: any = {};
    Object.keys(validatedData).forEach((key) => {
      const value = (validatedData as any)[key];
      if (value === '') {
        cleanedData[key] = null;
      } else {
        cleanedData[key] = value;
      }
    });

    const content = await prisma.landingContent.upsert({
      where: { id: 'landing' },
      update: cleanedData,
      create: {
        id: 'landing',
        ...cleanedData,
      },
    });

    await logAuditAction(
      adminResult.user.id,
      'UPDATE',
      'LANDING_CONTENT',
      'landing',
      'Updated landing page content',
      cleanedData
    );

    return NextResponse.json({
      success: true,
      data: content,
      message: 'Landing content updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating landing content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update landing content' },
      { status: 500 }
    );
  }
}

