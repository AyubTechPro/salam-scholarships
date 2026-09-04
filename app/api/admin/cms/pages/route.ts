import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const staticPageCreateSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  titleRu: z.string().optional(),
  titleTj: z.string().optional(),
  content: z.string().min(1),
  contentRu: z.string().optional(),
  contentTj: z.string().optional(),
  isActive: z.boolean().optional(),
});

const staticPageUpdateSchema = z.object({
  slug: z.string().optional(),
  title: z.string().optional(),
  titleRu: z.string().optional(),
  titleTj: z.string().optional(),
  content: z.string().optional(),
  contentRu: z.string().optional(),
  contentTj: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const page = await prisma.staticPage.findUnique({
        where: { slug },
      });
      return NextResponse.json({
        success: true,
        data: page,
      });
    }

    const pages = await prisma.staticPage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: pages,
    });
  } catch (error) {
    console.error('Error fetching static pages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch static pages' },
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
    const validatedData = staticPageCreateSchema.parse(body);

    const page = await prisma.staticPage.create({
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'CREATE',
      'STATIC_PAGE',
      page.id,
      `Created static page: ${page.slug}`,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: page,
      message: 'Static page created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating static page:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create static page' },
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
    const { id, ...restData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Page ID is required' },
        { status: 400 }
      );
    }

    const validatedData = staticPageUpdateSchema.parse(restData);

    const page = await prisma.staticPage.update({
      where: { id },
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'UPDATE',
      'STATIC_PAGE',
      page.id,
      `Updated static page: ${page.slug}`,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: page,
      message: 'Static page updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating static page:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update static page' },
      { status: 500 }
    );
  }
}

