import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdminAPI, requireContentDirectorAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const emailTemplateSchema = z.object({
  templateKey: z.enum(['WELCOME', 'PASSWORD_RESET', 'OTP', 'EVENT_REGISTRATION', 'NEW_OPPORTUNITY']),
  subject: z.string().min(1),
  subjectRu: z.string().optional(),
  subjectTj: z.string().optional(),
  htmlContent: z.string().min(1),
  htmlContentRu: z.string().optional(),
  htmlContentTj: z.string().optional(),
  textContent: z.string().min(1),
  textContentRu: z.string().optional(),
  textContentTj: z.string().optional(),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireContentDirectorAPI();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const templateKey = searchParams.get('key');
    const category = searchParams.get('category');

    const where: any = {};
    if (templateKey) {
      where.templateKey = templateKey;
    }
    if (category) {
      where.category = category;
    }

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { templateKey: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const validatedData = emailTemplateSchema.parse(body);

    // Check if template already exists
    const existing = await prisma.emailTemplate.findUnique({
      where: { templateKey: validatedData.templateKey },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Template with this key already exists' },
        { status: 400 }
      );
    }

    const template = await prisma.emailTemplate.create({
      data: validatedData,
    });

    // Log audit action
    await logAuditAction(
      user.id,
      'CREATE',
      'EMAIL_TEMPLATE',
      template.id,
      `Created email template: ${validatedData.templateKey}`,
      { templateKey: validatedData.templateKey }
    );

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Error creating email template:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create email template' },
      { status: 500 }
    );
  }
}

