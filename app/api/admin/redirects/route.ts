import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdminAPI, requireGrowthManagerAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const redirectSchema = z.object({
  fromPath: z.string().min(1),
  toPath: z.string().min(1),
  statusCode: z.number().int().min(301).max(302).default(301),
  isActive: z.boolean().default(true),
  isExternal: z.boolean().default(false),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireGrowthManagerAPI();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');

    const where: any = {};
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const redirects = await prisma.redirect.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: redirects,
    });
  } catch (error) {
    console.error('Error fetching redirects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch redirects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireGrowthManagerAPI();
    if (error) return error;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = redirectSchema.parse(body);

    // Check if redirect already exists
    const existing = await prisma.redirect.findUnique({
      where: { fromPath: validatedData.fromPath },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Redirect with this path already exists' },
        { status: 400 }
      );
    }

    const redirect = await prisma.redirect.create({
      data: validatedData,
    });

    // Log audit action
    await logAuditAction(
      user.id,
      'CREATE',
      'REDIRECT',
      redirect.id,
      `Created redirect: ${validatedData.fromPath} -> ${validatedData.toPath}`,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: redirect,
    });
  } catch (error) {
    console.error('Error creating redirect:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create redirect' },
      { status: 500 }
    );
  }
}

