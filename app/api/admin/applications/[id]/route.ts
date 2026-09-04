import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdminAPI, requireGrowthManagerAPI } from '@/lib/rbac-api';
import { canPerformAction, logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // SUPER_ADMIN has full access, GROWTH_MANAGER can update applications
    // CONTENT_DIRECTOR should NOT access applications
    const superAdminResult = await requireSuperAdminAPI();
    let user;
    
    if (!superAdminResult.error && superAdminResult.user) {
      user = superAdminResult.user;
    } else {
      // Try GROWTH_MANAGER
      const growthManagerResult = await requireGrowthManagerAPI();
      if (growthManagerResult.error) {
        return growthManagerResult.error;
      }
      if (!growthManagerResult.user) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Insufficient permissions to update applications' },
          { status: 403 }
        );
      }
      user = growthManagerResult.user;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Double-check permission using canPerformAction
    if (!(await canPerformAction('UPDATE', 'APPLICATION'))) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions to update applications' },
        { status: 403 }
      );
    }

    // Get existing application for audit log
    const existingApplication = await prisma.application.findUnique({
      where: { id },
      include: {
        program: {
          select: { title: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status } = statusSchema.parse(body);

    const application = await prisma.application.update({
      where: { id },
      data: {
        status,
        reviewedAt: status !== 'DRAFT' && status !== 'SUBMITTED' ? new Date() : null,
      },
    });

    // Log audit action
    await logAuditAction(
      user.id,
      'UPDATE',
      'APPLICATION',
      application.id,
      `Updated application status to ${status}`,
      {
        previousStatus: existingApplication.status,
        newStatus: status,
        program: existingApplication.program.title,
        student: existingApplication.user.name || existingApplication.user.email,
      }
    );

    // Create StudentNotification when status changes (except DRAFT and SUBMITTED)
    if (status !== 'DRAFT' && status !== 'SUBMITTED' && status !== existingApplication.status) {
      const statusMessages: Record<string, { title: string; message: string }> = {
        UNDER_REVIEW: {
          title: 'Application Under Review',
          message: `Your application for "${existingApplication.program.title}" is now under review. We will notify you once a decision is made.`,
        },
        ACCEPTED: {
          title: 'Application Accepted! 🎉',
          message: `Congratulations! Your application for "${existingApplication.program.title}" has been accepted. Check your dashboard for next steps.`,
        },
        REJECTED: {
          title: 'Application Update',
          message: `Your application for "${existingApplication.program.title}" was not successful this time. Don't give up - explore other opportunities!`,
        },
      };

      const notification = statusMessages[status];
      if (notification) {
        // @ts-ignore - IDE TypeScript cache issue: studentNotification exists in Prisma schema
        // Build compiles successfully. Restart TypeScript server in IDE to clear cache.
        await prisma.studentNotification.create({
          data: {
            userId: application.userId,
            type: 'STATUS_UPDATE',
            title: notification.title,
            message: notification.message,
            link: `/dashboard?tab=applications`,
            priority: status === 'ACCEPTED' ? 'HIGH' : 'NORMAL',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: application,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

