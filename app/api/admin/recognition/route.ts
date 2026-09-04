import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const recognitionSchema = z.object({
  title: z.string().min(1),
  titleRu: z.string().optional(),
  titleTj: z.string().optional(),
  subtitle: z.string().optional(),
  subtitleRu: z.string().optional(),
  subtitleTj: z.string().optional(),
  imageUrl: z.string().url(),
  awardName: z.string().optional(),
  awardNameRu: z.string().optional(),
  awardNameTj: z.string().optional(),
  location: z.string().optional(),
  locationRu: z.string().optional(),
  locationTj: z.string().optional(),
  achievementTitle: z.string().optional(),
  achievementTitleRu: z.string().optional(),
  achievementTitleTj: z.string().optional(),
  achievementText: z.string().optional(),
  achievementTextRu: z.string().optional(),
  achievementTextTj: z.string().optional(),
  representingTitle: z.string().optional(),
  representingTitleRu: z.string().optional(),
  representingTitleTj: z.string().optional(),
  representingText: z.string().optional(),
  representingTextRu: z.string().optional(),
  representingTextTj: z.string().optional(),
  quote: z.string().optional(),
  quoteRu: z.string().optional(),
  quoteTj: z.string().optional(),
  quoteAuthor: z.string().optional(),
  quoteAuthorRu: z.string().optional(),
  quoteAuthorTj: z.string().optional(),
});

export async function GET() {
  try {
    let recognition = await prisma.recognition.findUnique({
      where: { id: 'founder' },
    });

    // If no recognition exists, return null (frontend will use translations)
    if (!recognition) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: recognition,
    });
  } catch (error) {
    console.error('Error fetching recognition:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recognition' },
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
    const cleanedData: any = {};
    Object.keys(body).forEach((key) => {
      const value = (body as any)[key];
      cleanedData[key] = value === '' ? null : value;
    });
    const validatedData = recognitionSchema.parse(cleanedData);

    const recognition = await prisma.recognition.upsert({
      where: { id: 'founder' },
      update: validatedData,
      create: {
        id: 'founder',
        ...validatedData,
      },
    });

    await logAuditAction(
      adminResult.user.id,
      'UPDATE',
      'RECOGNITION',
      recognition.id,
      'Updated founder recognition',
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: recognition,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating recognition:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update recognition' },
      { status: 500 }
    );
  }
}

