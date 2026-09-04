import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { SeminarStatus } from '@prisma/client';

const seminarUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  titleRu: z.string().optional(),
  titleTj: z.string().optional(),
  description: z.string().min(1).optional(),
  descriptionRu: z.string().optional(),
  descriptionTj: z.string().optional(),
  date: z.string().transform((str) => new Date(str)).optional(),
  registrationDeadline: z.string().transform((str) => new Date(str)).optional(),
  location: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  status: z.nativeEnum(SeminarStatus).optional(),
  maxParticipants: z.number().int().min(1).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireContentDirectorAPI();
    if (error) return error;

    const seminar = await prisma.seminar.findUnique({
      where: { id: params.id },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
          orderBy: { registeredAt: 'desc' },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!seminar) {
      return NextResponse.json(
        { success: false, error: 'Seminar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: seminar,
    });
  } catch (error) {
    console.error('Error fetching seminar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seminar' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireContentDirectorAPI();
    if (error) return error;

    const body = await request.json();
    const validatedData = seminarUpdateSchema.parse(body);

    // Clean up empty strings
    const updateData: any = {};
    Object.keys(validatedData).forEach((key) => {
      const value = (validatedData as any)[key];
      if (value !== undefined) {
        updateData[key] = value === '' ? null : value;
      }
    });

    const updatedSeminar = await prisma.seminar.update({
      where: { id: params.id },
      data: updateData,
    });

    await logAuditAction(
      user!.id,
      'UPDATE',
      'SEMINAR',
      updatedSeminar.id,
      `Updated seminar: ${updatedSeminar.title}`,
      updateData
    );

    return NextResponse.json({
      success: true,
      data: updatedSeminar,
      message: 'Seminar updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating seminar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update seminar' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireContentDirectorAPI();
    if (error) return error;

    const deletedSeminar = await prisma.seminar.delete({
      where: { id: params.id },
    });

    await logAuditAction(
      user!.id,
      'DELETE',
      'SEMINAR',
      deletedSeminar.id,
      `Deleted seminar: ${deletedSeminar.title}`
    );

    return NextResponse.json({
      success: true,
      message: 'Seminar deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting seminar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete seminar' },
      { status: 500 }
    );
  }
}

