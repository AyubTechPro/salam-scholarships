import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const uiDictionarySchema = z.object({
  key: z.string().min(1),
  en: z.string().min(1),
  ru: z.string().optional(),
  tj: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const key = searchParams.get('key');

    const where: any = {};
    if (category) where.category = category;
    if (key) where.key = key;

    const items = await prisma.uIDictionary.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching UI dictionary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch UI dictionary' },
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
    const validatedData = uiDictionarySchema.parse(body);

    const item = await prisma.uIDictionary.create({
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'CREATE',
      'UI_DICTIONARY',
      item.id,
      `Created UI dictionary key: ${item.key}`,
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

    console.error('Error creating UI dictionary item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create UI dictionary item' },
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

    const validatedData = uiDictionarySchema.partial().parse(restData);

    const item = await prisma.uIDictionary.update({
      where: { id },
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'UPDATE',
      'UI_DICTIONARY',
      item.id,
      `Updated UI dictionary key: ${item.key}`,
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

    console.error('Error updating UI dictionary item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update UI dictionary item' },
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

    const item = await prisma.uIDictionary.delete({
      where: { id },
    });

    await logAuditAction(
      adminResult.user.id,
      'DELETE',
      'UI_DICTIONARY',
      item.id,
      `Deleted UI dictionary key: ${item.key}`,
      undefined
    );

    return NextResponse.json({
      success: true,
      message: 'UI dictionary item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting UI dictionary item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete UI dictionary item' },
      { status: 500 }
    );
  }
}

