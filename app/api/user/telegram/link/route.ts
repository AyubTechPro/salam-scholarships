import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

/**
 * Generate a Telegram linking token for the user
 * User will send this token to the bot via /start <token>
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate a unique token (valid for 10 minutes)
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing token for this user
    await prisma.telegramLinkToken.deleteMany({
      where: { userId: session.user.id },
    });

    // Store token in database
    await prisma.telegramLinkToken.create({
      data: {
        userId: session.user.id,
        token,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        expiresAt: expiresAt.toISOString(),
        instructions: 'Send /start <token> to the Telegram bot to link your account',
      },
    });
  } catch (error) {
    console.error('Error generating Telegram link token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate link token' },
      { status: 500 }
    );
  }
}

/**
 * Link Telegram account using chat ID (called from webhook)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { telegramChatId } = body;

    if (!telegramChatId) {
      return NextResponse.json(
        { success: false, error: 'Telegram chat ID is required' },
        { status: 400 }
      );
    }

    // Update user's telegramId
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        telegramId: telegramChatId.toString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Telegram account linked successfully',
    });
  } catch (error) {
    console.error('Error linking Telegram account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to link Telegram account' },
      { status: 500 }
    );
  }
}

/**
 * Unlink Telegram account
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        telegramId: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Telegram account unlinked successfully',
    });
  } catch (error) {
    console.error('Error unlinking Telegram account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unlink Telegram account' },
      { status: 500 }
    );
  }
}

