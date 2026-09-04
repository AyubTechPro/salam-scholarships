import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional().nullable(),
  countryCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['USER', 'PARTNER', 'ADMIN']).optional().default('USER'),
});

// Generate 6-digit OTP
function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Send OTP email using database template
async function sendOTPEmail(email: string, otp: string, name: string, locale: string = 'en') {
  const { getFormattedEmail } = await import('@/lib/email-templates-db');
  const { sendEmail } = await import('@/lib/mail');
  
  // Try to get template from database
  const emailContent = await getFormattedEmail('OTP', { name, otp }, locale);
  
  if (emailContent) {
    await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
  } else {
    // Fallback to hardcoded template if DB template not found
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
      to: email,
      subject: 'Verify Your Email - Salam Scholarships',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0a192f;">Welcome to Salam Scholarships, ${name}!</h2>
          <p>Thank you for signing up. Please verify your email address using the OTP code below:</p>
          <div style="background: #ffd700; color: #0a192f; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; margin: 20px 0; border-radius: 8px;">
            ${otp}
          </div>
          <p style="color: #666;">This code will expire in 10 minutes.</p>
          <p style="color: #666;">If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const clientIP = getClientIP(request);
    const rateLimit = await checkRateLimit(`signup:${clientIP}`, 5, 60 * 1000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many signup attempts. Please try again later.',
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
    const validatedData = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password with 12 rounds for production security
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP expires in 10 minutes

    // DEV-FRIENDLY: Log OTP to console in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      // OTP generated for email verification
    }

    // Format phone number with country code if provided
    let formattedPhone = null;
    if (validatedData.phoneNumber && validatedData.phoneNumber.trim()) {
      const cleanPhone = validatedData.phoneNumber.replace(/\D/g, '');
      const countryCode = validatedData.countryCode || '+992';
      
      // If phone already includes country code (starts with +), use as is
      if (validatedData.phoneNumber.startsWith('+')) {
        formattedPhone = validatedData.phoneNumber;
      } else if (cleanPhone) {
        // Combine country code with phone number
        formattedPhone = `${countryCode}${cleanPhone}`;
      }
    }

    // DEV-FRIENDLY: Auto-verify users in development mode
    const emailVerified = isDevelopment ? new Date() : null;

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phoneNumber: formattedPhone,
        country: validatedData.country || null,
        emailVerified: emailVerified,
        role: validatedData.role as never,
      },
    });

    // DEV-FRIENDLY: Log auto-verification in development
    if (isDevelopment && emailVerified) {
      // User auto-verified in development mode
    }

    // Store OTP in VerificationToken table
    await prisma.verificationToken.create({
      data: {
        identifier: validatedData.email,
        token: otp,
        expires: otpExpiry,
      },
    });

    // Send OTP email
    let emailSent = false;
    let emailError: Error | null = null;

    // Get locale from request headers or default to 'en'
    const locale = request.headers.get('x-locale') || 'en';

    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      try {
        await sendOTPEmail(validatedData.email, otp, validatedData.name, locale);
        emailSent = true;
      } catch (error) {
        emailError = error instanceof Error ? error : new Error(String(error));
        console.error('Error sending OTP email:', emailError);
        // Log the error but don't fail signup
      }
    } else {
      console.warn('SMTP not configured. OTP email will not be sent.');
      emailError = new Error('SMTP credentials not configured');
    }

    // Send Telegram notification for new user signup with full profile data
    try {
      const { sendNotificationIfEnabled, formatNewUserNotification } = await import('@/lib/telegram');
      const baseUrl = request.nextUrl.origin;
      const message = formatNewUserNotification({
        name: validatedData.name,
        email: validatedData.email,
        phoneNumber: formattedPhone || undefined,
        country: validatedData.country || undefined,
        profession: user.profession || undefined,
        userId: user.id,
        avatarUrl: user.image || undefined,
        baseUrl: baseUrl,
      });
      await sendNotificationIfEnabled(message);
    } catch (error) {
      // Don't fail signup if Telegram notification fails
      console.error('Error sending Telegram notification:', error);
    }

    // Prepare response
    const response: {
      message: string;
      userId: string;
      otp?: string;
      warning?: string;
      autoVerified?: boolean;
    } = {
      message: isDevelopment && emailVerified
        ? 'User created and auto-verified successfully (development mode).'
        : emailSent
        ? 'User created successfully. Please check your email for the OTP code.'
        : 'User created successfully. However, email service is not configured.',
      userId: user.id,
    };

    // DEV-FRIENDLY: In development, indicate auto-verification
    if (isDevelopment && emailVerified) {
      response.autoVerified = true;
      response.message = 'User created and auto-verified successfully (development mode). You can login immediately.';
    } else if (!emailSent) {
      // If email failed, return OTP for manual verification
      response.otp = otp;
      response.warning = emailError
        ? `Email service error: ${emailError.message}. Use OTP: ${otp} (check server console)`
        : 'SMTP not configured. Use the OTP above to verify your email.';
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
