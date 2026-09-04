import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1),
  nameRu: z.string().optional(),
  nameTj: z.string().optional(),
  slug: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
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
    const validatedData = categorySchema.parse(body);

    const category = await prisma.category.create({
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'CREATE',
      'CATEGORY',
      category.id,
      `Created category: ${category.name}`,
      validatedData
    );

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = categorySchema.partial().parse(body);

    const category = await prisma.category.update({
      where: { id },
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'UPDATE',
      'CATEGORY',
      category.id,
      `Updated category: ${category.name}`,
      validatedData
    );

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
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
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    await prisma.category.delete({ where: { id } });

    await logAuditAction(
      adminResult.user.id,
      'DELETE',
      'CATEGORY',
      id,
      `Deleted category: ${category.name}`,
      { deletedCategory: { name: category.name } }
    );

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}

