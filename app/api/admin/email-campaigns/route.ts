import { NextRequest, NextResponse } from 'next/server';
import { requireGrowthManagerAPI } from '@/lib/rbac-api';
import { logAuditAction } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/resend';
import { z } from 'zod';

const emailCampaignSchema = z.object({
  subject: z.string().min(1),
  subjectRu: z.string().optional(),
  subjectTj: z.string().optional(),
  content: z.string().min(1),
  contentRu: z.string().optional(),
  contentTj: z.string().optional(),
  recipientType: z.enum(['ALL', 'FILTERED', 'CUSTOM']),
  filters: z.record(z.any()).optional(),
  recipientIds: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const adminResult = await requireGrowthManagerAPI();
    if (adminResult.error) return adminResult.error;
    if (!adminResult.user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const campaigns = await prisma.emailCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    console.error('Error fetching email campaigns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminResult = await requireGrowthManagerAPI();
    if (adminResult.error) return adminResult.error;
    if (!adminResult.user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = emailCampaignSchema.parse(body);

    // Create campaign
    const campaign = await prisma.emailCampaign.create({
      data: {
        ...validatedData,
        createdBy: adminResult.user.id,
      },
    });

    await logAuditAction(
      adminResult.user.id,
      'CREATE',
      'EMAIL_CAMPAIGN',
      campaign.id,
      `Created email campaign: ${campaign.subject}`,
      validatedData
    );

    // If status is SENT, send emails immediately
    if (body.status === 'SENT') {
      await sendCampaignEmails(campaign.id, adminResult.user.id);
    }

    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Email campaign created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating email campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create email campaign' },
      { status: 500 }
    );
  }
}

async function sendCampaignEmails(campaignId: string, userId: string) {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign || campaign.status !== 'DRAFT') {
    return;
  }

  // Get recipients based on type
  let recipients: { email: string; preferredLanguage: string }[] = [];

  if (campaign.recipientType === 'ALL') {
    recipients = await prisma.user.findMany({
      where: {
        emailVerified: { not: null },
      },
      select: {
        email: true,
        preferredLanguage: true,
      },
    });
  } else if (campaign.recipientType === 'FILTERED' && campaign.filters) {
    const where: any = {
      emailVerified: { not: null },
    };

    // Type-cast filters from JsonValue to expected structure
    const filters = campaign.filters as Record<string, unknown>;
    
    if (filters.fieldOfInterest && Array.isArray(filters.fieldOfInterest)) {
      const fieldOfInterest = (filters.fieldOfInterest as unknown[]).filter((f): f is string => typeof f === 'string');
      where.fieldOfInterest = { in: fieldOfInterest };
    }
    if (filters.targetCountries && Array.isArray(filters.targetCountries)) {
      const targetCountries = (filters.targetCountries as unknown[]).filter((c): c is string => typeof c === 'string');
      where.targetDestinations = {
        array_contains: targetCountries,
      };
    }

    recipients = await prisma.user.findMany({
      where,
      select: {
        email: true,
        preferredLanguage: true,
      },
    });
  } else if (campaign.recipientType === 'CUSTOM' && campaign.recipientIds) {
    // Cast JsonValue to string[] for Prisma query
    const recipientIds = Array.isArray(campaign.recipientIds)
      ? (campaign.recipientIds as unknown[]).filter((id): id is string => typeof id === 'string')
      : [];
    recipients = await prisma.user.findMany({
      where: {
        id: { in: recipientIds },
        emailVerified: { not: null },
      },
      select: {
        email: true,
        preferredLanguage: true,
      },
    });
  }

  // Send emails
  let sentCount = 0;
  let failedCount = 0;

  for (const recipient of recipients) {
    const locale = recipient.preferredLanguage || 'en';
    const subject = locale === 'ru' && campaign.subjectRu
      ? campaign.subjectRu
      : locale === 'tj' && campaign.subjectTj
      ? campaign.subjectTj
      : campaign.subject;

    const content = locale === 'ru' && campaign.contentRu
      ? campaign.contentRu
      : locale === 'tj' && campaign.contentTj
      ? campaign.contentTj
      : campaign.content;

    const result = await sendEmail({
      to: recipient.email,
      subject,
      html: content,
    });

    if (result.success) {
      sentCount++;
    } else {
      failedCount++;
    }
  }

  // Update campaign status
  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status: 'SENT',
      sentAt: new Date(),
      sentCount,
      failedCount,
    },
  });

  await logAuditAction(
    userId,
    'UPDATE',
    'EMAIL_CAMPAIGN',
    campaignId,
    `Sent email campaign to ${sentCount} recipients`,
    { sentCount, failedCount }
  );
}

