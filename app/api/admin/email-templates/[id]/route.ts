import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI, requireSuperAdminAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const emailTemplateUpdateSchema = z.object({
  subject: z.string().min(1).optional(),
  subjectRu: z.string().optional(),
  subjectTj: z.string().optional(),
  htmlContent: z.string().min(1).optional(),
  htmlContentRu: z.string().optional(),
  htmlContentTj: z.string().optional(),
  textContent: z.string().min(1).optional(),
  textContentRu: z.string().optional(),
  textContentTj: z.string().optional(),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireContentDirectorAPI();
    if (error) return error;

    const template = await prisma.emailTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Error fetching email template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email template' },
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

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = emailTemplateUpdateSchema.parse(body);

    // Clean up empty strings to null
    const updateData: any = {};
    Object.keys(validatedData).forEach((key) => {
      const value = (validatedData as any)[key];
      if (value !== undefined) {
        updateData[key] = value === '' ? null : value;
      }
    });

    const template = await prisma.emailTemplate.update({
      where: { id: params.id },
      data: updateData,
    });

    // Log audit action
    await logAuditAction(
      user.id,
      'UPDATE',
      'EMAIL_TEMPLATE',
      params.id,
      `Updated email template: ${template.templateKey}`,
      updateData
    );

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Error updating email template:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update email template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireSuperAdminAPI();
    if (error) return error;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const template = await prisma.emailTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    await prisma.emailTemplate.delete({
      where: { id: params.id },
    });

    // Log audit action
    await logAuditAction(
      user.id,
      'DELETE',
      'EMAIL_TEMPLATE',
      params.id,
      `Deleted email template: ${template.templateKey}`,
      {}
    );

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting email template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete email template' },
      { status: 500 }
    );
  }
}

