import { NextRequest, NextResponse } from 'next/server';
import { requireAnyAdminAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'SUCCESS', 'REJECTED', 'PENDING', 'COMPLETED']).optional(),
  internalNotes: z.string().optional().nullable(),
});

// Update consultation request status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAnyAdminAPI();
    if (error) return error;

    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    // Normalize legacy status values (PENDING -> NEW, COMPLETED -> SUCCESS)
    let normalizedStatus = validatedData.status;
    if (normalizedStatus === 'PENDING') normalizedStatus = 'NEW';
    if (normalizedStatus === 'COMPLETED') normalizedStatus = 'SUCCESS';

    const updateData: any = {};
    if (normalizedStatus) {
      updateData.status = normalizedStatus;
    }
    if (validatedData.internalNotes !== undefined) {
      updateData.internalNotes = validatedData.internalNotes === '' ? null : validatedData.internalNotes;
    }

    const consultationRequest = await prisma.consultationRequest.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        status: true,
        internalNotes: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: consultationRequest,
      message: 'Status updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating consultation request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update consultation request' },
      { status: 500 }
    );
  }
}

// Delete consultation request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAnyAdminAPI();
    if (error) return error;

    await prisma.consultationRequest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Consultation request deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting consultation request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete consultation request' },
      { status: 500 }
    );
  }
}

