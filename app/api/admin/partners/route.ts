import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireGrowthManagerAPI } from '@/lib/rbac-api';
import { z } from 'zod';

const partnerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  nameRu: z.string().optional(),
  nameTj: z.string().optional(),
  email: z.string().email('Valid email is required'),
  website: z.string().url().optional().or(z.literal('')),
  logo: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  descriptionRu: z.string().optional(),
  descriptionTj: z.string().optional(),
  country: z.string().max(2, 'Country code must be 2 characters').optional().or(z.literal('')),
  type: z.enum(['UNIVERSITY', 'FOUNDATION', 'ORGANIZATION', 'GOVERNMENT']),
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireGrowthManagerAPI();
    if (error) return error;

    const partners = await prisma.partner.findMany({
      orderBy: [
        { isVerified: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: partners,
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireGrowthManagerAPI();
    if (error) return error;

    const body = await request.json();
    const validatedData = partnerSchema.parse(body);

    // Clean empty strings
    const cleanedData: any = {
      name: validatedData.name,
      nameRu: validatedData.nameRu || undefined,
      nameTj: validatedData.nameTj || undefined,
      email: validatedData.email,
      website: validatedData.website || undefined,
      logo: validatedData.logo || undefined,
      description: validatedData.description || undefined,
      descriptionRu: validatedData.descriptionRu || undefined,
      descriptionTj: validatedData.descriptionTj || undefined,
      country: validatedData.country || undefined,
      type: validatedData.type,
      isVerified: validatedData.isVerified,
      isActive: validatedData.isActive,
    };

    const partner = await prisma.partner.create({
      data: cleanedData,
    });

    return NextResponse.json({
      success: true,
      data: partner,
      message: 'Partner created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    // Check for unique constraint violation (email)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'A partner with this email already exists' },
        { status: 400 }
      );
    }

    console.error('Error creating partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}

