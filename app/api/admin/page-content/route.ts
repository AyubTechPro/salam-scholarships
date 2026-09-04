import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { z } from 'zod';
import { logAuditAction } from '@/lib/rbac';

const pageContentSchema = z.object({
  page: z.string(),
  section: z.string().optional(),
  title: z.string(),
  titleRu: z.string().optional(),
  titleTj: z.string().optional(),
  content: z.string(),
  contentRu: z.string().optional(),
  contentTj: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  buttonText: z.string().optional(),
  buttonTextRu: z.string().optional(),
  buttonTextTj: z.string().optional(),
  buttonLink: z.string().optional(),
  backgroundImage: z.string().url().optional().or(z.literal('')),
  additionalImages: z.array(z.string().url()).optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  layout: z.enum(['default', 'image-left', 'image-right', 'full-width', 'grid']).default('default'),
});

// GET - Fetch all page content blocks for a specific page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const section = searchParams.get('section');
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    const where: any = {};
    if (page) where.page = page;
    if (section) where.section = section;
    if (activeOnly) where.isActive = true;

    const contents = await prisma.pageContent.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: contents,
    });
  } catch (error) {
    console.error('Error fetching page content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch page content' },
      { status: 500 }
    );
  }
}

// POST - Create new page content block
export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireContentDirectorAPI();
    if (error) return error;

    const body = await request.json();
    const validatedData = pageContentSchema.parse(body);

    // Clean empty strings to null and handle JSON fields
    const cleanedData: any = {
      ...validatedData,
      titleRu: validatedData.titleRu || null,
      titleTj: validatedData.titleTj || null,
      contentRu: validatedData.contentRu || null,
      contentTj: validatedData.contentTj || null,
      image: validatedData.image || null,
      buttonText: validatedData.buttonText || null,
      buttonTextRu: validatedData.buttonTextRu || null,
      buttonTextTj: validatedData.buttonTextTj || null,
      buttonLink: validatedData.buttonLink || null,
      backgroundImage: validatedData.backgroundImage || null,
      additionalImages: validatedData.additionalImages ? JSON.stringify(validatedData.additionalImages) : null,
      section: validatedData.section || null,
    };

    const content = await prisma.pageContent.create({
      data: cleanedData,
    });

    await logAuditAction(
      user!.id,
      'CREATE',
      'PAGE_CONTENT',
      content.id,
      `Created page content block: ${content.page}${content.section ? ` - ${content.section}` : ''}`,
      cleanedData
    );

    return NextResponse.json({
      success: true,
      data: content,
      message: 'Page content created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating page content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create page content' },
      { status: 500 }
    );
  }
}

