/**
 * Automation Utilities
 * Daily tasks and scheduled jobs
 */

import { prisma } from '@/lib/prisma';

/**
 * Archive expired programs
 * Should be called daily via cron job or scheduled function
 */
export async function archiveExpiredPrograms(): Promise<{ archived: number; errors: string[] }> {
  const errors: string[] = [];
  let archived = 0;

  try {
    const now = new Date();

    // Find programs where deadline has passed and not yet archived
    const expiredPrograms = await prisma.program.findMany({
      where: {
        deadline: { lt: now },
        isExpired: false,
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    });

    // Update each program
    for (const program of expiredPrograms) {
      try {
        await prisma.program.update({
          where: { id: program.id },
          data: {
            isExpired: true,
            isActive: false, // Archive by setting inactive
          },
        });
        archived++;
      } catch (error) {
        errors.push(`Failed to archive program ${program.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { archived, errors };
  } catch (error) {
    errors.push(`Archive expired programs error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { archived, errors };
  }
}

/**
 * Clean up old audit logs (older than 1 year)
 */
export async function cleanupOldAuditLogs(): Promise<{ deleted: number }> {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: oneYearAgo },
      },
    });

    return { deleted: result.count };
  } catch (error) {
    console.error('Cleanup audit logs error:', error);
    return { deleted: 0 };
  }
}

/**
 * Send reminder emails for programs expiring within 7 days
 * Targets users who have saved those programs
 */
export async function sendDeadlineReminders(): Promise<{ sent: number; errors: string[] }> {
  const errors: string[] = [];
  let sent = 0;

  try {
    const { sendEmail } = await import('./mail');
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    sevenDaysFromNow.setHours(23, 59, 59, 999);

    const expiringPrograms = await prisma.program.findMany({
      where: {
        deadline: { gte: now, lte: sevenDaysFromNow },
        isActive: true,
        isExpired: false,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        titleRu: true,
        titleTj: true,
        deadline: true,
        country: true,
        slug: true,
      },
    });

    if (expiringPrograms.length === 0) return { sent, errors };

    const programIds = expiringPrograms.map((p) => p.id);
    const allSaved = await prisma.savedProgram.findMany({
      where: { programId: { in: programIds } },
      include: {
        user: { select: { email: true } },
      },
    });
    const savedByProgram = new Map<string, typeof allSaved>();
    for (const sp of allSaved) {
      const list = savedByProgram.get(sp.programId) || [];
      list.push(sp);
      savedByProgram.set(sp.programId, list);
    }

    for (const program of expiringPrograms) {
      const savedBy = savedByProgram.get(program.id) || [];
      const daysLeft = Math.ceil((program.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const title = program.title || program.titleRu || program.titleTj || 'Program';

      for (const sp of savedBy) {
        if (!sp.user?.email) continue;
        try {
          const result = await sendEmail({
            to: sp.user.email,
            subject: `Reminder: "${title}" expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
            html: `
              <h2>Deadline reminder</h2>
              <p>You saved the program "<strong>${title}</strong>" (${program.country}).</p>
              <p>Application deadline: <strong>${program.deadline.toLocaleDateString()}</strong> (${daysLeft} day${daysLeft === 1 ? '' : 's'} left).</p>
              <p><a href="${process.env.NEXTAUTH_URL || 'https://salamconsulting.com'}/en/opportunities/${program.slug || program.id}">View program →</a></p>
              <p>— Salam Scholarships</p>
            `,
          });
          if (result.success) sent++;
          else errors.push(`Email to ${sp.user.email}: ${result.error}`);
        } catch (e) {
          errors.push(`Email to ${sp.user.email}: ${e instanceof Error ? e.message : 'Unknown'}`);
        }
      }
    }

    return { sent, errors };
  } catch (e) {
    errors.push(`sendDeadlineReminders: ${e instanceof Error ? e.message : 'Unknown'}`);
    return { sent, errors };
  }
}

/**
 * Check for programs expiring in 3 days and create internal notifications
 */
export async function checkExpiringPrograms(): Promise<{ notified: number; errors: string[] }> {
  const errors: string[] = [];
  let notified = 0;

  try {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999); // End of day

    // Find programs expiring in exactly 3 days (within the next 3 days)
    const expiringPrograms = await prisma.program.findMany({
      where: {
        deadline: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0), // Start of today
          lte: threeDaysFromNow,
        },
        isActive: true,
        isExpired: false,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        deadline: true,
      },
    });

    // Create notifications for marketing manager
    for (const program of expiringPrograms) {
      try {
        // Check if notification already exists (to avoid duplicates)
        const existingNotification = await prisma.notification.findFirst({
          where: {
            type: 'PROGRAM_EXPIRING',
            message: { contains: program.id },
            isRead: false,
          },
        });

        if (!existingNotification) {
          await prisma.notification.create({
            data: {
              userId: null, // System notification for all admins
              type: 'PROGRAM_EXPIRING',
              title: 'Action Needed: Program Expiring Soon',
              message: `Program "${program.title}" expires in 3 days. Send a broadcast email!`,
              link: `/admin/programs`,
              priority: 'URGENT',
              isRead: false,
            },
          });
          notified++;
        }
      } catch (error) {
        errors.push(`Failed to create notification for program ${program.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { notified, errors };
  } catch (error) {
    errors.push(`Check expiring programs error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { notified, errors };
  }
}

