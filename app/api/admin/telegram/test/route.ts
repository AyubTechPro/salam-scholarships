import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdminAPI } from '@/lib/rbac-api';
import { sendTelegramNotification } from '@/lib/telegram';
import { z } from 'zod';

const testSchema = z.object({
  botToken: z.string().min(1),
  chatId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireSuperAdminAPI();
    if (error) return error;

    const body = await request.json();
    const validatedData = testSchema.parse(body);

    const result = await sendTelegramNotification(
      validatedData.botToken,
      validatedData.chatId,
      `🧪 <b>Test Notification</b>\n\nThis is a test message from Salam Scholarships Admin Panel.\n\nIf you received this, your Telegram integration is working correctly! ✅`
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send test notification' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully',
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}

