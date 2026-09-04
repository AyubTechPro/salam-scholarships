import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireGrowthManagerAPI } from '@/lib/rbac-api';
import { z } from 'zod';

const partnerUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  nameRu: z.string().optional(),
  nameTj: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  logo: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  descriptionRu: z.string().optional(),
  descriptionTj: z.string().optional(),
  country: z.string().max(2).optional().or(z.literal('')),
  type: z.enum(['UNIVERSITY', 'FOUNDATION', 'ORGANIZATION', 'GOVERNMENT']).optional(),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireGrowthManagerAPI();
    if (error) return error;

    const partner = await prisma.partner.findUnique({
      where: { id: params.id },
    });

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: partner,
    });
  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partner' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireGrowthManagerAPI();
    if (error) return error;

    const body = await request.json();
    const validatedData = partnerUpdateSchema.parse(body);

    // Clean empty strings
    const cleanedData: any = {};
    Object.keys(validatedData).forEach((key) => {
      const value = (validatedData as any)[key];
      if (value !== undefined) {
        cleanedData[key] = value === '' ? undefined : value;
      }
    });

    const partner = await prisma.partner.update({
      where: { id: params.id },
      data: cleanedData,
    });

    return NextResponse.json({
      success: true,
      data: partner,
      message: 'Partner updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    console.error('Error updating partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireGrowthManagerAPI();
    if (error) return error;

    // Check if partner has programs
    const programCount = await prisma.program.count({
      where: { partnerId: params.id },
    });

    if (programCount > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete partner. ${programCount} program(s) are associated with this partner. Please reassign or delete programs first.` },
        { status: 400 }
      );
    }

    await prisma.partner.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Partner deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}

