import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendNotificationIfEnabled } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { programId } = await req.json();

    if (!programId) {
      return NextResponse.json({ success: false, error: 'Program ID is required' }, { status: 400 });
    }

    // 1. Fetch User Data to verify readiness
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        phone: true,
        passportUrl: true,
        identitySelfieUrl: true,
        cvUrl: true,
        applicationTokens: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // 2. The Strict Vault Check
    if (!user.passportUrl || !user.cvUrl || !user.identitySelfieUrl) {
      return NextResponse.json({
        success: false,
        error: 'Vault Incomplete. You must upload your CV, Passport, and Identity Selfie to use 1-Click Apply.',
        code: 'VAULT_INCOMPLETE'
      }, { status: 403 });
    }

    // 3. Token Check
    if (user.applicationTokens < 1) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient connections. You need at least 1 Connect token to apply.',
        code: 'NO_TOKENS'
      }, { status: 403 });
    }

    // 4. Ensure Program Exists
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return NextResponse.json({ success: false, error: 'Program not found' }, { status: 404 });
    }

    // 5. Atomic Transaction: Create application and deduct token
    const application = await prisma.$transaction(async (tx) => {
      // Create SUBMITTED application directly
      const createdApp = await tx.application.upsert({
        where: {
          userId_programId: {
            userId: user.id,
            programId: program.id,
          },
        },
        update: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
          cvUrl: user.cvUrl,
          passportUrl: user.passportUrl,
        },
        create: {
          userId: user.id,
          programId: program.id,
          status: 'SUBMITTED',
          submittedAt: new Date(),
          cvUrl: user.cvUrl,
          passportUrl: user.passportUrl,
        },
      });

      // Deduct 1 Connect Token
      await tx.user.update({
        where: { id: user.id },
        data: {
          applicationTokens: {
            decrement: 1,
          },
          // Mark user as actively applying
          profileStatus: 'APPLIED',
        },
      });

      // Track Activity
      await tx.userActivity.create({
        data: {
          userId: user.id,
          activityType: 'APPLY',
          entityType: 'PROGRAM',
          entityId: program.id,
          metadata: { type: 'ONE_CLICK_APPLY' },
        },
      });

      return createdApp;
    });

    // 6. Fast Notification via Telegram to Admin Team
    const adminMessage = `
🚀 *1-CLICK APPLICATION RECEIVED*

👤 *Candidate:* ${user.name} ${user.surname || ''}
📧 *Email:* ${user.email}
🎓 *Program:* ${program.title}
💰 *Tokens Left:* ${user.applicationTokens - 1}

✅ CV, Passport, and Selfie successfully transferred.
    `;
    await sendNotificationIfEnabled(adminMessage);

    return NextResponse.json({
      success: true,
      data: application,
      message: '1-Click Application successfully submitted!',
    });
  } catch (error) {
    console.error('1-Click Apply Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
