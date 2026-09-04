import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { validateInternationalPhone } from '@/lib/phone-validation';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().refine(
    (val) => !val || validateInternationalPhone(val),
    { message: 'Please enter a valid international phone number (e.g., +1234567890)' }
  ),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const clientIP = getClientIP(request);
    const rateLimit = await checkRateLimit(`contact:${clientIP}`, 5, 60 * 1000);
    
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
    const validatedData = contactSchema.parse(body);

    // Save to database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        subject: validatedData.subject,
        message: validatedData.message,
      },
    });

    // Get site settings for email
    const siteSettings = await prisma.siteSettings.findUnique({
      where: { id: 'global' },
    });

    const contactEmail = siteSettings?.contactEmail || process.env.SMTP_USER || 'salamconsultingtj@gmail.com';

    // Send email notification (if SMTP configured)
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });

        // Email to admin
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: contactEmail,
          subject: `New Contact Form Message: ${validatedData.subject}`,
          html: `
            <h2>New Contact Form Message</h2>
            <p><strong>From:</strong> ${validatedData.name} (${validatedData.email})</p>
            ${validatedData.phone ? `<p><strong>Phone:</strong> ${validatedData.phone}</p>` : ''}
            <p><strong>Subject:</strong> ${validatedData.subject}</p>
            <h3>Message:</h3>
            <p>${validatedData.message.replace(/\n/g, '<br>')}</p>
          `,
        });

        // Confirmation email to user
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: validatedData.email,
          subject: 'Thank you for contacting Salam Scholarships',
          html: `
            <h2>Thank you for contacting us!</h2>
            <p>Dear ${validatedData.name},</p>
            <p>We have received your message and will get back to you within 24-48 hours.</p>
            <p>Best regards,<br>Salam Scholarships Team</p>
          `,
        });
      } catch (emailError) {
        console.error('Error sending contact email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

