import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const professionSchema = z.object({
  name: z.string().min(1),
  nameRu: z.string().optional(),
  nameTj: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const professions = await prisma.profession.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, data: professions });
  } catch (error) {
    console.error('Error fetching professions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch professions' },
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
    const validatedData = professionSchema.parse(body);

    const profession = await prisma.profession.create({
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'CREATE',
      'PROFESSION',
      profession.id,
      `Created profession: ${profession.name}`,
      validatedData
    );

    return NextResponse.json({ success: true, data: profession }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating profession:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create profession' },
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
        { success: false, error: 'Profession ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = professionSchema.partial().parse(body);

    const profession = await prisma.profession.update({
      where: { id },
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'UPDATE',
      'PROFESSION',
      profession.id,
      `Updated profession: ${profession.name}`,
      validatedData
    );

    return NextResponse.json({ success: true, data: profession });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating profession:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profession' },
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
        { success: false, error: 'Profession ID is required' },
        { status: 400 }
      );
    }

    const profession = await prisma.profession.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!profession) {
      return NextResponse.json(
        { success: false, error: 'Profession not found' },
        { status: 404 }
      );
    }

    await prisma.profession.delete({ where: { id } });

    await logAuditAction(
      adminResult.user.id,
      'DELETE',
      'PROFESSION',
      id,
      `Deleted profession: ${profession.name}`,
      { deletedProfession: { name: profession.name } }
    );

    return NextResponse.json({ success: true, message: 'Profession deleted successfully' });
  } catch (error) {
    console.error('Error deleting profession:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete profession' },
      { status: 500 }
    );
  }
}

