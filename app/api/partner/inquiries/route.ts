/**
 * Partner Inquiry API
 * Handles organizations wanting to post opportunities
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireSuperAdminAPI, requireGrowthManagerAPI } from '@/lib/rbac-api';

const inquirySchema = z.object({
  organizationName: z.string().min(2).max(200),
  contactName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  message: z.string().min(10).max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = inquirySchema.parse(body);

    // Create inquiry
    const inquiry = await prisma.partnerInquiry.create({
      data: {
        organizationName: data.organizationName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone || null,
        country: data.country || null,
        website: data.website || null,
        message: data.message,
        status: 'PENDING',
      },
    });

    // Send Telegram notification
    try {
      const { sendNotificationIfEnabled, formatPartnerInquiryNotification } = await import('@/lib/telegram');
      const message = formatPartnerInquiryNotification({
        organizationName: data.organizationName,
        contactName: data.contactName,
        email: data.email,
        phoneNumber: data.phone || undefined,
        website: data.website || undefined,
      });
      await sendNotificationIfEnabled(message);
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      // Don't fail the request if notification fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Your inquiry has been submitted successfully. We will contact you soon.',
        data: inquiry,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Error creating partner inquiry:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit inquiry. Please try again later.',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Protect this endpoint - only SUPER_ADMIN or GROWTH_MANAGER can view inquiries
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
          { success: false, error: 'Forbidden: Insufficient permissions' },
          { status: 403 }
        );
      }
      user = growthManagerResult.user;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const inquiries = await prisma.partnerInquiry.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: inquiries,
    });
  } catch (error) {
    console.error('Error fetching partner inquiries:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch inquiries',
      },
      { status: 500 }
    );
  }
}

