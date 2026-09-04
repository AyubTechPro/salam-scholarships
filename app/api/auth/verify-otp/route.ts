import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const { allowed } = await checkRateLimit(`otp:${ip}`, 10, 15 * 60_000);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }
    const body = await request.json();
    const { email, otp } = verifyOTPSchema.parse(body);

    // DEV-FRIENDLY: In development, log OTP verification attempts
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      // OTP verification attempt
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: otp,
        expires: {
          gt: new Date(), // Not expired
        },
      },
    });

    if (!verificationToken) {
      if (isDevelopment) {
        // Invalid or expired OTP
      }
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Update user email as verified
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
      },
    });

    // DEV-FRIENDLY: Log successful verification in development
    if (isDevelopment) {
      // Email verified successfully
    }

    // Delete used OTP
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: otp,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}

