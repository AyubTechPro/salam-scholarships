import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const countrySchema = z.object({
  name: z.string().min(1),
  nameRu: z.string().optional(),
  nameTj: z.string().optional(),
  code: z.string().length(2),
  flag: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, data: countries });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch countries' },
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
    const validatedData = countrySchema.parse(body);

    const country = await prisma.country.create({
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'CREATE',
      'COUNTRY',
      country.id,
      `Created country: ${country.name}`,
      validatedData
    );

    return NextResponse.json({ success: true, data: country }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating country:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create country' },
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
        { success: false, error: 'Country ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = countrySchema.partial().parse(body);

    const country = await prisma.country.update({
      where: { id },
      data: validatedData,
    });

    await logAuditAction(
      adminResult.user.id,
      'UPDATE',
      'COUNTRY',
      country.id,
      `Updated country: ${country.name}`,
      validatedData
    );

    return NextResponse.json({ success: true, data: country });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating country:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update country' },
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
        { success: false, error: 'Country ID is required' },
        { status: 400 }
      );
    }

    const country = await prisma.country.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!country) {
      return NextResponse.json(
        { success: false, error: 'Country not found' },
        { status: 404 }
      );
    }

    await prisma.country.delete({ where: { id } });

    await logAuditAction(
      adminResult.user.id,
      'DELETE',
      'COUNTRY',
      id,
      `Deleted country: ${country.name}`,
      { deletedCountry: { name: country.name } }
    );

    return NextResponse.json({ success: true, message: 'Country deleted successfully' });
  } catch (error) {
    console.error('Error deleting country:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete country' },
      { status: 500 }
    );
  }
}

