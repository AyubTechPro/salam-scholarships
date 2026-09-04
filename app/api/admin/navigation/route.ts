import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const navigationMenuSchema = z.object({
  label: z.string().min(1),
  labelRu: z.string().optional(),
  labelTj: z.string().optional(),
  href: z.string().min(1),
  icon: z.string().optional(),
  order: z.number().int().default(0),
  location: z.enum(['navbar', 'footer', 'both']).default('navbar'),
  section: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
  isExternal: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    const where: any = {};
    if (location) {
      where.OR = [
        { location: location },
        { location: 'both' },
      ];
    }

    const items = await prisma.navigationMenu.findMany({
      where,
      include: {
        children: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching navigation menu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch navigation menu' },
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
    const validatedData = navigationMenuSchema.parse(body);

    const item = await prisma.navigationMenu.create({
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'CREATE',
      'NAVIGATION_MENU',
      item.id,
      `Created navigation item: ${item.label}`,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: item,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating navigation item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create navigation item' },
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
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const validatedData = navigationMenuSchema.partial().parse(restData);

    const item = await prisma.navigationMenu.update({
      where: { id },
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'UPDATE',
      'NAVIGATION_MENU',
      item.id,
      `Updated navigation item: ${item.label}`,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating navigation item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update navigation item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminResult = await requireContentDirectorAPI();
    if (adminResult.error) return adminResult.error;
    if (!adminResult.user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const item = await prisma.navigationMenu.delete({
      where: { id },
    });

    await logAuditAction(
      adminResult.user.id,
      'DELETE',
      'NAVIGATION_MENU',
      item.id,
      `Deleted navigation item: ${item.label}`,
      undefined
    );

    return NextResponse.json({
      success: true,
      message: 'Navigation item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting navigation item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete navigation item' },
      { status: 500 }
    );
  }
}

