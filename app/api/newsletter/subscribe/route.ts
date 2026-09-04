/**
 * Newsletter Subscription API
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  locale: z.enum(['en', 'ru', 'tj']).default('en'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = subscribeSchema.parse(body);

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: validatedData.email },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { success: false, error: 'Email already subscribed' },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        await prisma.newsletterSubscriber.update({
          where: { email: validatedData.email },
          data: {
            isActive: true,
            name: validatedData.name || existing.name,
            locale: validatedData.locale,
            unsubscribedAt: null,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Subscription reactivated successfully',
        });
      }
    }

    // Create new subscription
    await prisma.newsletterSubscriber.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        locale: validatedData.locale,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    await prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed',
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

