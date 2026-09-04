import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/rbac';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

const consultingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  country: z.string().optional(),
  targetRegion: z.string().optional(),
  englishLevel: z.string().optional(),
  targetCountry: z.string().optional(),
  targetLevel: z.string().optional(),
  targetProgramId: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  preferredLanguage: z.enum(['en', 'ru', 'tj']).optional().default('en'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const clientIP = getClientIP(request);
    const rateLimit = await checkRateLimit(`consulting:${clientIP}`, 5, 60 * 1000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    const body = await request.json();
    const validatedData = consultingSchema.parse(body);

    // Combine region and country for targetCountry if region is provided
    let finalTargetCountry = validatedData.targetCountry;
    if (validatedData.targetRegion && validatedData.targetCountry) {
      finalTargetCountry = `${validatedData.targetRegion}: ${validatedData.targetCountry}`;
    } else if (validatedData.targetRegion) {
      finalTargetCountry = validatedData.targetRegion;
    }

    // Store in database
    const consultationRequest = await prisma.consultationRequest.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        englishLevel: validatedData.englishLevel || null,
        targetCountry: finalTargetCountry || null,
        targetLevel: validatedData.targetLevel || null,
        targetProgramId: validatedData.targetProgramId || null,
        message: validatedData.message,
        preferredLanguage: validatedData.preferredLanguage || 'en',
        status: 'NEW', // Default CRM status
      },
    });

    // Send Telegram notification
    try {
      const { sendNotificationIfEnabled, formatConsultationNotification } = await import('@/lib/telegram');
      const message = formatConsultationNotification({
        name: validatedData.name,
        email: validatedData.email,
        phoneNumber: validatedData.phone || undefined,
        targetRegion: validatedData.targetRegion || undefined,
        targetCountry: finalTargetCountry || undefined,
      });
      await sendNotificationIfEnabled(message);
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      // Don't fail the request if notification fails
    }

    // Create notification for team
    await createNotification(
      null, // All admins
      'CONSULTATION_REQUEST',
      'New Consultation Request',
      `${validatedData.name} (${validatedData.email}) requested a consultation`,
      `/admin/consultation-requests/${consultationRequest.id}`,
      'NORMAL'
    );

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Send email to admin
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.SMTP_USER,
        subject: `New Consultation Request from ${validatedData.name}`,
        html: `
          <h2>New Premium Consultation Request</h2>
          <h3>Personal Information</h3>
          <p><strong>Name:</strong> ${validatedData.name}</p>
          <p><strong>Email:</strong> ${validatedData.email}</p>
          ${validatedData.phone ? `<p><strong>Phone:</strong> ${validatedData.phone}</p>` : ''}
          ${validatedData.countryCode ? `<p><strong>Country Code:</strong> ${validatedData.countryCode}</p>` : ''}
          ${validatedData.country ? `<p><strong>User Country:</strong> ${validatedData.country}</p>` : ''}
          <p><strong>Preferred Language:</strong> ${validatedData.preferredLanguage || 'en'}</p>
          
          <h3>Academic Profile</h3>
          ${validatedData.englishLevel ? `<p><strong>English Level:</strong> ${validatedData.englishLevel}</p>` : ''}
          
          <h3>Target Goals</h3>
          ${validatedData.targetRegion ? `<p><strong>Target Region:</strong> ${validatedData.targetRegion}</p>` : ''}
          ${validatedData.targetCountry ? `<p><strong>Target Country:</strong> ${validatedData.targetCountry}</p>` : ''}
          ${validatedData.targetLevel ? `<p><strong>Target Level:</strong> ${validatedData.targetLevel}</p>` : ''}
          
          <h3>Message</h3>
          <p>${validatedData.message}</p>
        `,
      });

      // Send confirmation email to user
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: validatedData.email,
        subject: 'Thank you for your consultation request - Salam Scholarships',
        html: `
          <h2>Thank you for contacting Salam Scholarships!</h2>
          <p>Dear ${validatedData.name},</p>
          <p>We have received your consultation request and will get back to you within 24-48 hours.</p>
          <p>Best regards,<br>Salam Scholarships Team</p>
        `,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Consultation request submitted successfully. We will contact you soon.',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Consultation request error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit consultation request' },
      { status: 500 }
    );
  }
}

