/**
 * Password Recovery API
 * Forgot Password Flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { sendEmail } from '@/lib/mail';
import { getPasswordResetEmail } from '@/lib/email-templates';
import { getFormattedEmail } from '@/lib/email-templates-db';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { storeResetToken } from '@/lib/password-reset';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 requests per hour per IP
    const clientIP = getClientIP(request);
    const rateLimit = await checkRateLimit(`forgot-password:${clientIP}`, 3, 60 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many password reset requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    // Always return success (security: don't reveal if email exists)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Store token
    storeResetToken(resetToken, user.id, 60 * 60 * 1000); // 1 hour

    // Generate reset link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://salamconsulting.com';
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    // Send password reset email (try DB template first, fallback to standard default)
    const locale = request.headers.get('x-locale') || 'en';
    const dbEmail = await getFormattedEmail('PASSWORD_RESET', {
      name: user.name || 'User',
      link: resetLink,
    }, locale);

    if (dbEmail) {
      await sendEmail({
        to: user.email,
        subject: dbEmail.subject,
        html: dbEmail.html,
        text: dbEmail.text,
      });
    } else {
      // Fallback to standard default template
      const emailTemplate = getPasswordResetEmail({
        name: user.name || 'User',
        resetLink,
      });

      await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}

/**
 * Verify reset token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const { getResetToken } = await import('@/lib/password-reset');
    const tokenData = getResetToken(token);

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}


