import { NextRequest, NextResponse } from 'next/server';
import { requireConsultantAPI, requireSuperAdminAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';
import { logAuditAction } from '@/lib/rbac';
import { z } from 'zod';

const crmUpdateSchema = z.object({
  crmStatus: z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'SUCCESS', 'REJECTED']).optional(),
  internalNotes: z.string().optional().nullable(),
  isVerified: z.boolean().optional(),
  applicationTokens: z.number().int().optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Allow both CONSULTANT and SUPER_ADMIN to update CRM
    let user;
    const consultantResult = await requireConsultantAPI();
    if (!consultantResult.error && consultantResult.user) {
      user = consultantResult.user;
    } else {
      const superAdminResult = await requireSuperAdminAPI();
      if (superAdminResult.error) {
        return superAdminResult.error;
      }
      if (!superAdminResult.user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      user = superAdminResult.user;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = crmUpdateSchema.parse(body);

    // Update user CRM fields
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        crmStatus: validatedData.crmStatus,
        internalNotes: validatedData.internalNotes === '' ? null : validatedData.internalNotes,
        ...(validatedData.isVerified !== undefined && { isVerified: validatedData.isVerified }),
        ...(validatedData.applicationTokens !== undefined && validatedData.applicationTokens !== null && { applicationTokens: validatedData.applicationTokens }),
      },
      select: {
        id: true,
        email: true,
        crmStatus: true,
        internalNotes: true,
        isVerified: true,
        applicationTokens: true,
      },
    });

    // Log audit action
    await logAuditAction(
      user.id,
      'UPDATE',
      'USER_CRM',
      params.id,
      `Updated CRM status for user: ${updatedUser.email}`,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user CRM:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update user CRM' },
      { status: 500 }
    );
  }
}

