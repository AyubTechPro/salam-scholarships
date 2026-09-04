import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  sendTelegramMessage,
  answerCallbackQuery,
  handleStartCommand,
  handleHelpCommand,
  handleLinkCommand,
  handleUnlinkCommand,
  handleStatusCommand,
} from '@/lib/telegram-bot';

/**
 * Telegram Bot Webhook Endpoint
 * Receives updates from Telegram Bot API
 * 
 * Setup:
 * 1. Create a bot via @BotFather on Telegram
 * 2. Get your bot token
 * 3. Set webhook: https://api.telegram.org/bot<TOKEN>/setWebhook?url=<YOUR_DOMAIN>/api/webhooks/telegram
 * 4. Add bot token to SiteSettings.telegramBotToken
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (expectedSecret) {
      const webhookSecret = request.headers.get('x-telegram-bot-api-secret-token');
      if (webhookSecret !== expectedSecret) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'Webhook not configured' }, { status: 503 });
    }

    // Handle different update types
    if (body.message) {
      await handleMessage(body.message);
    } else if (body.callback_query) {
      await handleCallbackQuery(body.callback_query);
    } else if (body.edited_message) {
      // Handle edited messages if needed
      // Edited message received, ignoring
    }

    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    // Still return 200 to prevent Telegram from retrying
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 200 });
  }
}

/**
 * Handle incoming messages from users
 */
async function handleMessage(message: any) {
  const chatId = message.chat.id;
  const text = message.text || '';
  const userId = message.from?.id;

  // Check if this is a command
  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    const token = parts[1]; // Deep link token
    const response = await handleStartCommand(userId, token);
    await sendTelegramMessage(chatId, response);
  } else if (text.startsWith('/help')) {
    const response = await handleHelpCommand();
    await sendTelegramMessage(chatId, response);
  } else if (text.startsWith('/link')) {
    const parts = text.split(' ');
    const token = parts[1];
    if (!token) {
      await sendTelegramMessage(chatId, '❌ Please provide a token. Usage: /link TOKEN');
    } else {
      const response = await handleLinkCommand(userId, token);
      await sendTelegramMessage(chatId, response);
    }
  } else if (text.startsWith('/unlink')) {
    const response = await handleUnlinkCommand(userId);
    await sendTelegramMessage(chatId, response);
  } else if (text.startsWith('/status')) {
    const response = await handleStatusCommand(userId);
    await sendTelegramMessage(chatId, response);
  } else {
    // Echo or handle other messages
    await sendTelegramMessage(chatId, 'I can help you with notifications. Use /help to see available commands.');
  }
}

/**
 * Handle callback queries (button presses)
 */
async function handleCallbackQuery(callbackQuery: any) {
  const chatId = callbackQuery.message?.chat?.id;
  const data = callbackQuery.data;

  // Handle different callback actions
  if (data === 'link_account') {
    await sendTelegramMessage(chatId, 'Please use the link from your dashboard to link your account.');
  }

  // Answer the callback query
  await answerCallbackQuery(callbackQuery.id);
}

// All Telegram functions are now in lib/telegram-bot.ts

