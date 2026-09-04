import { NextRequest, NextResponse } from 'next/server';
import { requireGrowthManagerAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/resend';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminResult = await requireGrowthManagerAPI();
    if (adminResult.error) return adminResult.error;
    if (!adminResult.user) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.status === 'SENT') {
      return NextResponse.json(
        { success: false, error: 'Campaign already sent' },
        { status: 400 }
      );
    }

    // Get recipients
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

      if (campaign.filters && typeof campaign.filters === 'object') {
        const filters = campaign.filters as any;
        if (filters.fieldOfInterest) {
          where.fieldOfInterest = { in: filters.fieldOfInterest };
        }
        if (filters.targetCountries) {
          where.targetDestinations = {
            path: ['$'],
            array_contains: filters.targetCountries,
          };
        }
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

    // Update campaign
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        sentCount,
        failedCount,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        sentCount,
        failedCount,
      },
      message: `Campaign sent to ${sentCount} recipients`,
    });
  } catch (error) {
    console.error('Error sending email campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}

