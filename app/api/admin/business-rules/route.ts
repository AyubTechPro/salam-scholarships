import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdminAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { clearBusinessRulesCache } from '@/lib/business-rules';
import { z } from 'zod';

const businessRulesSchema = z.object({
  urgentBadgeThresholdDays: z.number().int().min(1).max(30),
  paginationLimits: z.object({
    opportunities: z.number().int().min(1).max(100),
    admin: z.number().int().min(1).max(100),
    events: z.number().int().min(1).max(100),
    achievements: z.number().int().min(1).max(100),
  }),
  rateLimitRequests: z.number().int().min(1).max(100),
  rateLimitWindowSeconds: z.number().int().min(1).max(3600),
  passwordResetLinkExpiryHours: z.number().int().min(1).max(72),
  otpExpiryMinutes: z.number().int().min(1).max(60),
  topDeadlinesLimit: z.number().int().min(1).max(20),
  featuredOpportunitiesLimit: z.number().int().min(1).max(50),
});

export async function GET() {
  try {
    const { error } = await requireSuperAdminAPI();
    if (error) return error;

    let rules = await prisma.businessRules.findUnique({
      where: { id: 'global' },
    });

    // If no rules exist, create defaults
    if (!rules) {
      rules = await prisma.businessRules.create({
        data: {
          id: 'global',
          urgentBadgeThresholdDays: 7,
          paginationLimits: {
            opportunities: 12,
            admin: 20,
            events: 10,
            achievements: 12,
          },
          rateLimitRequests: 5,
          rateLimitWindowSeconds: 60,
          passwordResetLinkExpiryHours: 1,
          otpExpiryMinutes: 10,
          topDeadlinesLimit: 3,
          featuredOpportunitiesLimit: 6,
        },
      });
    }

    // Parse pagination limits if it's a string
    const paginationLimits = typeof rules.paginationLimits === 'string'
      ? JSON.parse(rules.paginationLimits)
      : rules.paginationLimits;

    return NextResponse.json({
      success: true,
      data: {
        ...rules,
        paginationLimits,
      },
    });
  } catch (error) {
    console.error('Error fetching business rules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch business rules' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { error, user } = await requireSuperAdminAPI();
    if (error) return error;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = businessRulesSchema.parse(body);

    // Update or create business rules
    const rules = await prisma.businessRules.upsert({
      where: { id: 'global' },
      update: {
        urgentBadgeThresholdDays: validatedData.urgentBadgeThresholdDays,
        paginationLimits: validatedData.paginationLimits,
        rateLimitRequests: validatedData.rateLimitRequests,
        rateLimitWindowSeconds: validatedData.rateLimitWindowSeconds,
        passwordResetLinkExpiryHours: validatedData.passwordResetLinkExpiryHours,
        otpExpiryMinutes: validatedData.otpExpiryMinutes,
        topDeadlinesLimit: validatedData.topDeadlinesLimit,
        featuredOpportunitiesLimit: validatedData.featuredOpportunitiesLimit,
      },
      create: {
        id: 'global',
        ...validatedData,
      },
    });

    // Clear cache
    clearBusinessRulesCache();

    // Log audit action
    await logAuditAction(
      user.id,
      'UPDATE',
      'BUSINESS_RULES',
      'global',
      'Updated business rules configuration',
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: {
        ...rules,
        paginationLimits: typeof rules.paginationLimits === 'string'
          ? JSON.parse(rules.paginationLimits)
          : rules.paginationLimits,
      },
    });
  } catch (error) {
    console.error('Error updating business rules:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update business rules' },
      { status: 500 }
    );
  }
}

