/**
 * Telegram Notification Utility
 * Sends notifications to Telegram chat/channel via Bot API
 */

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
  disable_notification?: boolean;
}

/**
 * Send message to Telegram
 */
export async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  message: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const payload: TelegramMessage = {
      chat_id: chatId,
      text: message,
      parse_mode: parseMode,
      disable_notification: false,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error('Telegram API error:', data);
      return {
        success: false,
        error: data.description || 'Failed to send Telegram notification',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format consultation request notification
 */
export function formatConsultationNotification(data: {
  name: string;
  email: string;
  phoneNumber?: string;
  goal?: string;
  targetRegion?: string;
  targetCountry?: string;
}): string {
  const phone = data.phoneNumber ? `📱 <b>Phone:</b> ${data.phoneNumber}\n` : '';
  const goal = data.goal ? `🎯 <b>Goal:</b> ${data.goal}\n` : '';
  const country = data.targetCountry ? `🌍 <b>Target Country:</b> ${data.targetCountry}\n` : '';
  const region = data.targetRegion ? `🌍 <b>Target Region:</b> ${data.targetRegion}\n` : '';
  
  return `
🆕 <b>New Consultation Request</b>

👤 <b>Name:</b> ${data.name}
📧 <b>Email:</b> ${data.email}
${phone}${country || region}${goal}
⏰ <i>Received: ${new Date().toLocaleString()}</i>
  `.trim();
}

/**
 * Format partner inquiry notification
 */
export function formatPartnerInquiryNotification(data: {
  organizationName: string;
  contactName: string;
  email: string;
  phoneNumber?: string;
  website?: string;
}): string {
  const phone = data.phoneNumber ? `📱 ${data.phoneNumber}\n` : '';
  const website = data.website ? `🌐 Website: ${data.website}\n` : '';
  
  return `
🤝 <b>New Partner Inquiry</b>

🏢 <b>Organization:</b> ${data.organizationName}
👤 <b>Contact:</b> ${data.contactName}
📧 <b>Email:</b> ${data.email}
${phone}${website}
⏰ <i>Received: ${new Date().toLocaleString()}</i>
  `.trim();
}

/**
 * Format new user signup notification with profile link and avatar
 */
export function formatNewUserNotification(data: {
  name: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  profession?: string;
  userId?: string;
  avatarUrl?: string;
  baseUrl?: string;
}): string {
  const phone = data.phoneNumber ? `📱 <b>Phone:</b> ${data.phoneNumber}\n` : '';
  const country = data.country ? `🌍 <b>Country:</b> ${data.country}\n` : '';
  const profession = data.profession ? `💼 <b>Profession:</b> ${data.profession}\n` : '';
  
  // Build profile link
  const profileLink = data.userId && data.baseUrl 
    ? `\n🔗 <a href="${data.baseUrl}/admin/users?userId=${data.userId}">View Profile →</a>`
    : '';
  
  // Add avatar if available (Telegram supports inline images via photo URL)
  const avatar = data.avatarUrl 
    ? `\n🖼️ <a href="${data.avatarUrl}">👤</a>`
    : '';
  
  return `
👋 <b>🆕 New User Signup</b>

👤 <b>Name:</b> ${data.name}
📧 <b>Email:</b> ${data.email}
${phone}${country}${profession}${avatar}
⏰ <i>Signed up: ${new Date().toLocaleString()}</i>${profileLink}
  `.trim();
}

/**
 * Send notification if Telegram is configured
 */
export async function sendNotificationIfEnabled(
  message: string
): Promise<{ success: boolean; sent: boolean }> {
  try {
    const { prisma } = await import('./prisma');
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'global' },
      select: {
        telegramBotToken: true,
        telegramChatId: true,
        telegramNotificationsEnabled: true,
      },
    });

    if (
      !settings?.telegramNotificationsEnabled ||
      !settings.telegramBotToken ||
      !settings.telegramChatId
    ) {
      return { success: true, sent: false };
    }

    const result = await sendTelegramNotification(
      settings.telegramBotToken,
      settings.telegramChatId,
      message
    );

    return {
      success: result.success,
      sent: result.success,
    };
  } catch (error) {
    console.error('Error checking Telegram settings:', error);
    return { success: false, sent: false };
  }
}

