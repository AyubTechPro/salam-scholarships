import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { z } from 'zod';
import { logUserActivity } from '@/lib/user-activity';
import { scoreMotivationLetter } from '@/lib/ai-motivation-scorer';
import { sendNotificationIfEnabled } from '@/lib/telegram';
import { createNotification } from '@/lib/rbac';

const applicationSchema = z.object({
  programId: z.string().min(1, 'Program ID is required'),
  motivationLetter: z.string().min(50, 'Motivation letter must be at least 50 characters').optional(),
  cvUrl: z.string().url().optional(),
  transcriptUrl: z.string().url().optional(),
  passportUrl: z.string().url().optional(),
  receiptUrl: z.string().url().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED']).default('DRAFT'),
});

/**
 * Format application notification for Telegram
 */
function formatApplicationNotification(data: {
  userName: string;
  userEmail: string;
  programTitle: string;
  applicationId: string;
  programId: string;
  userId: string;
  telegramUsername: string;
}): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://salamconsulting.com';
  
  return `
📝 <b>New Application Submitted</b>

👤 <b>Student:</b> ${data.userName}
📧 <b>Email:</b> ${data.userEmail}
🎓 <b>Program:</b> ${data.programTitle}

🔗 <b>View Application:</b> ${baseUrl}/admin/applications/${data.applicationId}

💬 <b>Contact Student:</b> @${data.telegramUsername}
📋 <b>Application ID:</b> ${data.applicationId}
👤 <b>User ID:</b> ${data.userId}
🎯 <b>Program ID:</b> ${data.programId}

⏰ <i>Submitted: ${new Date().toLocaleString()}</i>
  `.trim();
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const identifier = session?.user?.id ?? getClientIP(request);
    const { allowed } = await checkRateLimit(identifier, 15, 60_000);
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
    }
    // Check authentication
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in to apply.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = applicationSchema.parse(body);

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id: validatedData.programId },
      select: {
        id: true,
        title: true,
        titleRu: true,
        titleTj: true,
        description: true,
        deadline: true,
        isActive: true,
        isExpired: true,
        country: true,
        category: true,
      },
    });

    if (!program) {
      return NextResponse.json(
        { success: false, error: 'Program not found' },
        { status: 404 }
      );
    }

    // Check if program is active
    if (!program.isActive || program.isExpired) {
      return NextResponse.json(
        { success: false, error: 'This program is no longer accepting applications' },
        { status: 400 }
      );
    }

    // For SUBMITTED status, check deadline
    if (validatedData.status === 'SUBMITTED' && new Date(program.deadline) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Application deadline has passed' },
        { status: 400 }
      );
    }

    // Check if user already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_programId: {
          userId: session.user.id,
          programId: validatedData.programId,
        },
      },
    });

    const applicationData: any = {
      userId: session.user.id,
      programId: validatedData.programId,
      status: validatedData.status,
      motivationLetter: validatedData.motivationLetter,
      cvUrl: validatedData.cvUrl,
      transcriptUrl: validatedData.transcriptUrl,
      passportUrl: validatedData.passportUrl,
      receiptUrl: validatedData.receiptUrl,
    };

    // If submitting (not draft), set submittedAt and score motivation letter
    if (validatedData.status === 'SUBMITTED') {
      applicationData.submittedAt = new Date();
      
      // Score motivation letter if provided
      if (validatedData.motivationLetter) {
        try {
          const scoreResult = await scoreMotivationLetter(
            validatedData.motivationLetter,
            program.title,
            program.description || undefined
          );
          applicationData.motivationScore = scoreResult.score;
        } catch (error) {
          console.error('Error scoring motivation letter:', error);
          // Continue without score if scoring fails
        }
      }
    }

    // Update existing or create new application
    const application = existingApplication
      ? await prisma.application.update({
          where: { id: existingApplication.id },
          data: applicationData,
          include: {
            program: {
              select: {
                title: true,
                titleRu: true,
                titleTj: true,
              },
            },
          },
        })
      : await prisma.application.create({
          data: applicationData,
          include: {
            program: {
              select: {
                title: true,
                titleRu: true,
                titleTj: true,
              },
            },
          },
        });

    // Log application activity
    await logUserActivity(
      session.user.id,
      validatedData.status === 'SUBMITTED' ? 'APPLY' : 'CLICK',
      'PROGRAM',
      validatedData.programId,
      {
        applicationId: application.id,
        status: validatedData.status,
        programTitle: program.title,
        programCountry: program.country,
        programCategory: program.category,
      }
    ).catch((err) => console.error('Error logging application activity:', err));

    // If submitted, send notifications
    if (validatedData.status === 'SUBMITTED') {
      // Get user info for notifications
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true },
      });

      const userName = user?.name || 'Unknown';
      const userEmail = user?.email || '';

      // Send Telegram notification
      try {
        const settings = await prisma.siteSettings.findUnique({
          where: { id: 'global' },
          select: { telegramSupportUsername: true },
        });
        const telegramUsername = settings?.telegramSupportUsername?.replace('@', '') || 'salam_support';
        
        const telegramMessage = formatApplicationNotification({
          userName,
          userEmail,
          programTitle: program.title,
          applicationId: application.id,
          programId: program.id,
          userId: session.user.id,
          telegramUsername,
        });
        await sendNotificationIfEnabled(telegramMessage);
      } catch (error) {
        console.error('Error sending Telegram notification:', error);
        // Don't fail the request if notification fails
      }

      // Create admin notification
      try {
        await createNotification(
          null, // All admins
          'NEW_APPLICATION',
          'New Application Submitted',
          `${userName} applied to ${program.title}`,
          `/admin/applications/${application.id}`,
          'NORMAL'
        );
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    }

    // Generate Telegram redirect URL for "Contact to Process" flow
    const telegramSettings = await prisma.siteSettings.findUnique({
      where: { id: 'global' },
      select: { telegramSupportUsername: true },
    });

    const telegramUsername = telegramSettings?.telegramSupportUsername?.replace('@', '') || 'salam_support';
    const telegramUrl = `https://t.me/${telegramUsername}?start=app_${application.id}_${session.user.id}`;

    return NextResponse.json(
      {
        success: true,
        message:
          validatedData.status === 'DRAFT'
            ? 'Application saved as draft'
            : 'Application submitted successfully. Please contact us on Telegram to proceed.',
        data: {
          ...application,
          telegramContactUrl: telegramUrl, // Include Telegram URL for redirect
        },
      },
      { status: existingApplication ? 200 : 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Application submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        program: {
          select: {
            id: true,
            title: true,
            titleRu: true,
            titleTj: true,
            imageUrl: true,
            deadline: true,
            country: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

