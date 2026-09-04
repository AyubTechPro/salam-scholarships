import { ProgramLevel, ProgramCategory } from '@prisma/client';
import { prisma } from './prisma';
import { createStudentNotification } from './notifications';

/**
 * Send notification to user's Telegram if linked
 */
export async function sendTelegramNotification(
  userId: string,
  message: string,
  options?: {
    parse_mode?: 'HTML' | 'Markdown';
    disable_web_page_preview?: boolean;
    reply_markup?: any;
  }
): Promise<boolean> {
  try {
    // Get user's Telegram ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { telegramId: true },
    });

    if (!user?.telegramId) {
      return false; // User hasn't linked Telegram
    }

    // Get bot token
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'global' },
      select: { telegramBotToken: true, telegramNotificationsEnabled: true },
    });

    if (!settings?.telegramBotToken || !settings.telegramNotificationsEnabled) {
      return false; // Telegram not configured
    }

    // Send message via Telegram Bot API
    const response = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: user.telegramId,
        text: message,
        parse_mode: options?.parse_mode || 'HTML',
        disable_web_page_preview: options?.disable_web_page_preview || false,
        reply_markup: options?.reply_markup,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Telegram API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

/**
 * Notify users about new opportunity matching their preferences
 */
export async function notifyUsersAboutNewOpportunity(opportunity: {
  id: string;
  title: string;
  titleRu?: string | null;
  titleTj?: string | null;
  level: ProgramLevel;
  country: string;
  category: ProgramCategory;
  slug: string;
}): Promise<{ notified: number; errors: string[] }> {
  const errors: string[] = [];
  let notified = 0;

  try {
    // Find users who might be interested in this opportunity
    // Based on their saved programs, preferences, or saved searches
    const interestedUsers = await prisma.user.findMany({
      where: {
        role: 'USER',
        emailVerified: { not: null },
        telegramId: { not: null }, // Only users with linked Telegram
        // You can add more filters based on user preferences
      },
      select: {
        id: true,
        preferredLanguage: true,
        telegramId: true,
        savedPrograms: {
          where: {
            program: {
              level: opportunity.level,
              country: { contains: opportunity.country, mode: 'insensitive' },
              category: opportunity.category,
            },
          },
          take: 1,
        },
      },
    });

    // Also check users who have saved similar programs
    const usersWithSimilarInterests = await prisma.user.findMany({
      where: {
        role: 'USER',
        emailVerified: { not: null },
        telegramId: { not: null },
        savedPrograms: {
          some: {
            program: {
              level: opportunity.level,
              OR: [
                { country: { contains: opportunity.country, mode: 'insensitive' } },
                { category: opportunity.category },
              ],
            },
          },
        },
      },
      select: {
        id: true,
        preferredLanguage: true,
        telegramId: true,
      },
    });

    // Combine and deduplicate users
    const allUsers = Array.from(
      new Map([...interestedUsers, ...usersWithSimilarInterests].map((u) => [u.id, u])).values()
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://salamconsulting.com';
    const locale = 'en'; // Default, you might want to use user's preferred language

    // Notify each user
    for (const user of allUsers) {
      try {
        // Get localized title
        const title =
          user.preferredLanguage === 'ru' && opportunity.titleRu
            ? opportunity.titleRu
            : user.preferredLanguage === 'tj' && opportunity.titleTj
            ? opportunity.titleTj
            : opportunity.title;

        const message = `🎓 <b>New Opportunity Available!</b>\n\n${title}\n\n📍 ${opportunity.country}\n📚 ${opportunity.level}\n\n<a href="${baseUrl}/${user.preferredLanguage || 'en'}/opportunities/${opportunity.slug}">View Details →</a>`;

        // Send Telegram notification
        const sent = await sendTelegramNotification(user.id, message);
        
        if (sent) {
          notified++;
          
          // Also create in-app notification
          await createStudentNotification(
            user.id,
            'NEW_OPPORTUNITY',
            'New Opportunity Available',
            title,
            `/${user.preferredLanguage || 'en'}/opportunities/${opportunity.slug}`,
            'NORMAL'
          );
        }
      } catch (error) {
        errors.push(`Failed to notify user ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { notified, errors };
  } catch (error) {
    console.error('Error notifying users about new opportunity:', error);
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    return { notified, errors };
  }
}

