import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI, requireSuperAdminAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { SeminarStatus } from '@prisma/client';

const seminarSchema = z.object({
  title: z.string().min(1),
  titleRu: z.string().optional(),
  titleTj: z.string().optional(),
  description: z.string().min(1),
  descriptionRu: z.string().optional(),
  descriptionTj: z.string().optional(),
  date: z.string().transform((str) => new Date(str)),
  registrationDeadline: z.string().transform((str) => new Date(str)),
  location: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  status: z.nativeEnum(SeminarStatus).default(SeminarStatus.OPEN),
  maxParticipants: z.number().int().min(1).default(100),
});

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireContentDirectorAPI();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as SeminarStatus | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [seminars, total] = await Promise.all([
      prisma.seminar.findMany({
        where,
        include: {
          _count: {
            select: { registrations: true },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.seminar.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: seminars,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching seminars:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seminars' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireContentDirectorAPI();
    if (error) return error;

    const body = await request.json();
    const validatedData = seminarSchema.parse(body);

    const seminar = await prisma.seminar.create({
      data: validatedData,
    });

    await logAuditAction(
      user!.id,
      'CREATE',
      'SEMINAR',
      seminar.id,
      `Created seminar: ${seminar.title}`,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: seminar,
      message: 'Seminar created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating seminar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create seminar' },
      { status: 500 }
    );
  }
}

