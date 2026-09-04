import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { createNotification } from '@/lib/rbac';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

const inquirySchema = z.object({
  organizationName: z.string().min(2, 'Organization name is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimit = await checkRateLimit(`partner_inquiry:${clientIP}`, 3, 3600 * 1000); // 3 per hour

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = inquirySchema.parse(body);

    const inquiry = await prisma.partnerInquiry.create({
      data: {
        organizationName: validatedData.organizationName,
        contactName: validatedData.contactName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        website: validatedData.website || null,
        message: validatedData.message,
      },
    });

    // Notify admins
    await createNotification(
      null,
      'SYSTEM',
      'New B2B Partnership Inquiry',
      `${validatedData.organizationName} is interested in joining the Salam Scholarships network.`,
      '/admin/cms/partners',
      'HIGH'
    );

    // Telegram & Email logic
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

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.SMTP_USER,
        subject: `B2B Lead: ${validatedData.organizationName}`,
        html: `
          <h2>New Partnership Inquiry</h2>
          <p><strong>Organization:</strong> ${validatedData.organizationName}</p>
          <p><strong>Contact Name:</strong> ${validatedData.contactName}</p>
          <p><strong>Email:</strong> ${validatedData.email}</p>
          ${validatedData.phone ? `<p><strong>Phone:</strong> ${validatedData.phone}</p>` : ''}
          ${validatedData.website ? `<p><strong>Website:</strong> ${validatedData.website}</p>` : ''}
          <p><strong>Message:</strong><br>${validatedData.message}</p>
        `,
      });
    }

    return NextResponse.json({ success: true, message: 'Inquiry submitted successfully' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Partner inquiry error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit inquiry' }, { status: 500 });
  }
}
