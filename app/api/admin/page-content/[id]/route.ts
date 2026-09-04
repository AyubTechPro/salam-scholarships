import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { z } from 'zod';
import { logAuditAction } from '@/lib/rbac';

const pageContentUpdateSchema = z.object({
  page: z.string().optional(),
  section: z.string().optional(),
  title: z.string().optional(),
  titleRu: z.string().optional(),
  titleTj: z.string().optional(),
  content: z.string().optional(),
  contentRu: z.string().optional(),
  contentTj: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  buttonText: z.string().optional(),
  buttonTextRu: z.string().optional(),
  buttonTextTj: z.string().optional(),
  buttonLink: z.string().optional(),
  backgroundImage: z.string().url().optional().or(z.literal('')),
  additionalImages: z.array(z.string().url()).optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
  layout: z.enum(['default', 'image-left', 'image-right', 'full-width', 'grid']).optional(),
});

// GET - Fetch single page content block
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const content = await prisma.pageContent.findUnique({
      where: { id: params.id },
    });

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Page content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('Error fetching page content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch page content' },
      { status: 500 }
    );
  }
}

// PUT - Update page content block
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireContentDirectorAPI();
    if (error) return error;

    const existing = await prisma.pageContent.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Page content not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = pageContentUpdateSchema.parse(body);

    // Clean empty strings to null and handle JSON fields
    const cleanedData: any = {};
    Object.keys(validatedData).forEach((key) => {
      const value = (validatedData as any)[key];
      if (key === 'additionalImages' && value && Array.isArray(value)) {
        cleanedData[key] = JSON.stringify(value);
      } else if (value === '' || value === null) {
        cleanedData[key] = null;
      } else if (value !== undefined) {
        cleanedData[key] = value;
      }
    });

    const content = await prisma.pageContent.update({
      where: { id: params.id },
      data: cleanedData,
    });

    await logAuditAction(
      user!.id,
      'UPDATE',
      'PAGE_CONTENT',
      content.id,
      `Updated page content block: ${content.page}${content.section ? ` - ${content.section}` : ''}`,
      cleanedData
    );

    return NextResponse.json({
      success: true,
      data: content,
      message: 'Page content updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating page content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update page content' },
      { status: 500 }
    );
  }
}

// DELETE - Delete page content block
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireContentDirectorAPI();
    if (error) return error;

    const existing = await prisma.pageContent.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Page content not found' },
        { status: 404 }
      );
    }

    await prisma.pageContent.delete({
      where: { id: params.id },
    });

    await logAuditAction(
      user!.id,
      'DELETE',
      'PAGE_CONTENT',
      params.id,
      `Deleted page content block: ${existing.page}${existing.section ? ` - ${existing.section}` : ''}`,
      {}
    );

    return NextResponse.json({
      success: true,
      message: 'Page content deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting page content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete page content' },
      { status: 500 }
    );
  }
}

