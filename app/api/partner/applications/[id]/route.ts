import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { createNotification } from '@/lib/rbac';

const statusUpdateSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
  message: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, partnerId: true },
    });

    if (!user || user.role !== 'PARTNER' || !user.partnerId) {
      return NextResponse.json({ success: false, error: 'Forbidden: Requires Partner Role' }, { status: 403 });
    }

    const applicationId = params.id;
    const body = await request.json();
    const validatedData = statusUpdateSchema.parse(body);

    // Verify application belongs to partner's program
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        program: true,
        user: true,
      },
    });

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    if (application.program.partnerId !== user.partnerId) {
      return NextResponse.json({ success: false, error: 'Forbidden: Application does not belong to your programs' }, { status: 403 });
    }

    // Update status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: validatedData.status,
      },
      include: {
        program: {
          select: { title: true },
        },
      },
    });

    // Create notification for student
    await createNotification(
      application.userId,
      'SYSTEM',
      `Application ${validatedData.status}`,
      `Your application to ${application.program.title} has been ${validatedData.status.toLowerCase()}.`,
      `/dashboard/applications`,
      validatedData.status === 'ACCEPTED' ? 'HIGH' : 'NORMAL'
    );

    // Send email to student
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const studentEmail = application.user.email;
      if (studentEmail) {
         await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: studentEmail,
          subject: `Application Update: ${application.program.title}`,
          html: `
            <h2>Application Status Update</h2>
            <p>Dear ${application.user.name},</p>
            <p>Your application to <strong>${application.program.title}</strong> has been updated to: <strong>${validatedData.status}</strong>.</p>
            ${validatedData.message ? `<p><strong>Message from University:</strong><br/>${validatedData.message}</p>` : ''}
            <p>Please log in to your Salam Scholarships dashboard to view more details.</p>
            <p>Best regards,<br>Salam Scholarships Team</p>
          `,
        });
      }
    }

    return NextResponse.json({ success: true, data: updatedApplication });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Error updating application status:', error);
    return NextResponse.json({ success: false, error: 'Failed to update application' }, { status: 500 });
  }
}
