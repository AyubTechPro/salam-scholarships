import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const seoConfigSchema = z.object({
  pagePath: z.string(),
  title: z.string(),
  titleRu: z.string().optional(),
  titleTj: z.string().optional(),
  description: z.string(),
  descriptionRu: z.string().optional(),
  descriptionTj: z.string().optional(),
  keywords: z.string().optional(),
  ogImage: z.string().url().optional().or(z.literal('')),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagePath = searchParams.get('path');

    if (pagePath) {
      const config = await prisma.sEOConfig.findUnique({
        where: { pagePath },
      });
      return NextResponse.json({
        success: true,
        data: config,
      });
    }

    const configs = await prisma.sEOConfig.findMany({
      orderBy: { pagePath: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: configs,
    });
  } catch (error) {
    console.error('Error fetching SEO configs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SEO configs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const validatedData = seoConfigSchema.parse(body);

    // Clean empty strings
    const cleanedData: any = { ...validatedData };
    if (cleanedData.ogImage === '') {
      cleanedData.ogImage = null;
    }

    const config = await prisma.sEOConfig.upsert({
      where: { pagePath: validatedData.pagePath },
      update: cleanedData,
      create: cleanedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'UPDATE',
      'SEO_CONFIG',
      config.id,
      `Updated SEO config for ${config.pagePath}`,
      cleanedData
    );

    return NextResponse.json({
      success: true,
      data: config,
      message: 'SEO config updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating SEO config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update SEO config' },
      { status: 500 }
    );
  }
}

