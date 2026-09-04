/**
 * FAQ Management API
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdminAPI, requireGrowthManagerAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logAuditAction } from '@/lib/rbac';

const faqSchema = z.object({
  question: z.string().min(1),
  questionRu: z.string().optional(),
  questionTj: z.string().optional(),
  answer: z.string().min(1),
  answerRu: z.string().optional(),
  answerTj: z.string().optional(),
  category: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    const faqs = await prisma.fAQ.findMany({
      where: {
        category: category || undefined,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // SUPER_ADMIN or GROWTH_MANAGER can create FAQs
    const superAdminResult = await requireSuperAdminAPI();
    let user;
    
    if (!superAdminResult.error && superAdminResult.user) {
      user = superAdminResult.user;
    } else {
      const growthManagerResult = await requireGrowthManagerAPI();
      if (growthManagerResult.error) return growthManagerResult.error;
      if (!growthManagerResult.user) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
      user = growthManagerResult.user;
    }

    const body = await request.json();
    const validatedData = faqSchema.parse(body);

    const faq = await prisma.fAQ.create({
      data: validatedData,
    });

    await logAuditAction(
      user.id,
      'CREATE',
      'FAQ',
      faq.id,
      `Created FAQ: ${faq.question}`,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: faq,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const superAdminResult = await requireSuperAdminAPI();
    let user;
    
    if (!superAdminResult.error && superAdminResult.user) {
      user = superAdminResult.user;
    } else {
      const growthManagerResult = await requireGrowthManagerAPI();
      if (growthManagerResult.error) return growthManagerResult.error;
      if (!growthManagerResult.user) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
      user = growthManagerResult.user;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = faqSchema.partial().parse(body);

    const faq = await prisma.fAQ.update({
      where: { id },
      data: validatedData,
    });

    await logAuditAction(
      user.id,
      'UPDATE',
      'FAQ',
      faq.id,
      `Updated FAQ: ${faq.question}`,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: faq,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const superAdminResult = await requireSuperAdminAPI();
    let user;
    
    if (!superAdminResult.error && superAdminResult.user) {
      user = superAdminResult.user;
    } else {
      const growthManagerResult = await requireGrowthManagerAPI();
      if (growthManagerResult.error) return growthManagerResult.error;
      if (!growthManagerResult.user) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
      user = growthManagerResult.user;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    const faq = await prisma.fAQ.delete({
      where: { id },
    });

    await logAuditAction(
      user.id,
      'DELETE',
      'FAQ',
      faq.id,
      `Deleted FAQ: ${faq.question}`,
      undefined
    );

    return NextResponse.json({
      success: true,
      message: 'FAQ deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}

