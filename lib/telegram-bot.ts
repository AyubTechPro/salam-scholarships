/**
 * Telegram Bot Logic
 * Handles bot commands, deep linking, and notifications
 */

import { prisma } from './prisma';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://salamconsulting.com';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: { id: number; type: string };
  text?: string;
  date: number;
}

interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data: string;
}

/**
 * Send a message to a Telegram user
 */
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  options?: {
    parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
    reply_markup?: any;
  }
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    return false;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parse_mode || 'HTML',
        reply_markup: options?.reply_markup,
      }),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Answer a callback query
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
  showAlert = false
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    return false;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Handle /start command with deep linking
 */
export async function handleStartCommand(
  telegramUserId: number,
  startParam?: string
): Promise<string> {
  // Check if user is already linked
  const existingUser = await prisma.user.findFirst({
    where: { telegramId: String(telegramUserId) },
  });

  if (existingUser) {
    return `Welcome back, ${existingUser.name || 'there'}! 👋\n\nYour SGOP account is already linked.\n\nUse /help to see available commands.`;
  }

  // If startParam exists, it's a linking token
  if (startParam) {
    const linkToken = await prisma.telegramLinkToken.findUnique({
      where: { token: startParam },
      include: { user: true },
    });

    if (!linkToken) {
      return '❌ Invalid or expired linking token. Please generate a new one from your SGOP dashboard.';
    }

    if (linkToken.expiresAt < new Date()) {
      return '❌ This linking token has expired. Please generate a new one from your SGOP dashboard.';
    }

    // Link the Telegram account
    await prisma.user.update({
      where: { id: linkToken.userId },
      data: { telegramId: String(telegramUserId) },
    });

    // Delete the used token
    await prisma.telegramLinkToken.delete({
      where: { id: linkToken.id },
    });

    return `✅ Successfully linked!\n\nWelcome to Salam Global Opportunity Platform, ${linkToken.user.name || 'there'}! 🎓\n\nYou'll now receive notifications about matching opportunities.\n\nUse /help to see available commands.`;
  }

  // New user - provide linking instructions
  return `👋 Welcome to Salam Global Opportunity Platform!\n\nTo receive personalized scholarship notifications, you need to link your SGOP account.\n\n📱 <b>How to link:</b>\n1. Log in to your SGOP account\n2. Go to Dashboard → Settings\n3. Click "Connect Telegram"\n4. Copy the token\n5. Click this link: <a href="https://t.me/your_bot_username?start=TOKEN">Link Account</a>\n\nOr use /link TOKEN to link directly.`;
}

/**
 * Handle /help command
 */
export async function handleHelpCommand(): Promise<string> {
  return `📚 <b>Available Commands:</b>\n\n` +
    `/start - Start the bot or link your account\n` +
    `/help - Show this help message\n` +
    `/link TOKEN - Link your SGOP account using a token\n` +
    `/unlink - Unlink your Telegram account\n` +
    `/status - Check your account status\n\n` +
    `💡 <b>Tip:</b> You'll automatically receive notifications about scholarships that match your preferences!`;
}

/**
 * Handle /link command
 */
export async function handleLinkCommand(
  telegramUserId: number,
  token: string
): Promise<string> {
  const linkToken = await prisma.telegramLinkToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!linkToken) {
    return '❌ Invalid linking token. Please check and try again.';
  }

  if (linkToken.expiresAt < new Date()) {
    return '❌ This token has expired. Please generate a new one from your SGOP dashboard.';
  }

  // Link the account
  await prisma.user.update({
    where: { id: linkToken.userId },
    data: { telegramId: String(telegramUserId) },
  });

  // Delete the token
  await prisma.telegramLinkToken.delete({
    where: { id: linkToken.id },
  });

  return `✅ Successfully linked! Welcome, ${linkToken.user.name || 'there'}! 🎓`;
}

/**
 * Handle /unlink command
 */
export async function handleUnlinkCommand(
  telegramUserId: number
): Promise<string> {
  const user = await prisma.user.findFirst({
    where: { telegramId: String(telegramUserId) },
  });

  if (!user) {
    return '❌ Your Telegram account is not linked to any SGOP account.';
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { telegramId: null },
  });

  return '✅ Your Telegram account has been unlinked. You will no longer receive notifications.';
}

/**
 * Handle /status command
 */
export async function handleStatusCommand(
  telegramUserId: number
): Promise<string> {
  const user = await prisma.user.findFirst({
    where: { telegramId: String(telegramUserId) },
    select: {
      name: true,
      email: true,
      preferredCountries: true,
      preferredFields: true,
    },
  });

  if (!user) {
    return '❌ Your Telegram account is not linked. Use /start to link your account.';
  }

  let status = `✅ <b>Account Status</b>\n\n`;
  status += `👤 Name: ${user.name || 'Not set'}\n`;
  status += `📧 Email: ${user.email || 'Not set'}\n\n`;
  
  if (user.preferredCountries && user.preferredCountries.length > 0) {
    status += `🌍 Preferred Countries: ${user.preferredCountries.join(', ')}\n`;
  }
  
  if (user.preferredFields && user.preferredFields.length > 0) {
    status += `📚 Preferred Fields: ${user.preferredFields.join(', ')}\n`;
  }

  return status;
}

/**
 * Send opportunity notification to user
 */
export async function sendOpportunityNotification(
  userId: string,
  opportunityId: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { telegramId: true },
  });

  if (!user?.telegramId) {
    return false; // User hasn't linked Telegram
  }

  const program = await prisma.program.findUnique({
    where: { id: opportunityId },
    select: {
      title: true,
      description: true,
      country: true,
      level: true,
      deadline: true,
      slug: true,
    },
  });

  if (!program) {
    return false;
  }

  const message = `🎓 <b>New Opportunity for You!</b>\n\n` +
    `<b>${program.title}</b>\n\n` +
    `📍 Country: ${program.country}\n` +
    `📚 Level: ${program.level}\n` +
    `📅 Deadline: ${new Date(program.deadline).toLocaleDateString()}\n\n` +
    `${program.description.substring(0, 200)}...\n\n` +
    `🔗 <a href="${SITE_URL}/opportunities/${program.slug}">View Details</a>`;

  const keyboard = {
    inline_keyboard: [[
      {
        text: '📖 View Details',
        url: `${SITE_URL}/opportunities/${program.slug}`,
      },
    ]],
  };

  return await sendTelegramMessage(
    user.telegramId,
    message,
    {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    }
  );
}

