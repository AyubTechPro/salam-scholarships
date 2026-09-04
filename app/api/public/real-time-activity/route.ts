/**
 * Truth Engine API - Real-Time Activity Feed
 * Returns ONLY real database signals, NO mock data
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ActivityItem {
  type: 'new' | 'application' | 'popular' | 'tip';
  icon: string;
  text: string;
  textRu: string;
  textTj: string;
}

export async function GET() {
  try {
    const activities: ActivityItem[] = [];
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Check for latest application (submitted in last hour)
    const latestApplication = await prisma.application.findFirst({
      where: {
        submittedAt: {
          gte: oneHourAgo,
          not: null,
        },
        status: 'SUBMITTED',
      },
      include: {
        program: {
          select: {
            title: true,
            country: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    if (latestApplication && latestApplication.program) {
      activities.push({
        type: 'application',
        icon: '🚀',
        text: `A student just applied to ${latestApplication.program.title}`,
        textRu: `Студент только что подал заявку на ${latestApplication.program.title}`,
        textTj: `Як донишҷӯ ҳоло ба ${latestApplication.program.title} ҳуҷҷат супорид`,
      });
    }

    // 2. Check for most viewed opportunity in last 24 hours (AUTO mode)
    const mostViewedOpportunity = await prisma.program.findFirst({
      where: {
        isActive: true,
        isVerified: true,
        viewCount: {
          gt: 0,
        },
      },
      orderBy: {
        viewCount: 'desc',
      },
      select: {
        title: true,
        country: true,
        category: true,
        viewCount: true,
      },
    });

    if (mostViewedOpportunity && mostViewedOpportunity.viewCount > 0) {
      activities.push({
        type: 'popular',
        icon: '🔥',
        text: `Popular now: ${mostViewedOpportunity.title} in ${mostViewedOpportunity.country}`,
        textRu: `Популярно сейчас: ${mostViewedOpportunity.title} в ${mostViewedOpportunity.country}`,
        textTj: `Машҳур аст: ${mostViewedOpportunity.title} дар ${mostViewedOpportunity.country}`,
      });
    }

    // 3. Check for new opportunities (created in last 24 hours)
    const latestOpportunity = await prisma.program.findFirst({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
        isActive: true,
        isVerified: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        title: true,
        country: true,
        category: true,
      },
    });

    if (latestOpportunity) {
      activities.push({
        type: 'new',
        icon: '🆕',
        text: `New: ${latestOpportunity.title} in ${latestOpportunity.country}`,
        textRu: `Новое: ${latestOpportunity.title} в ${latestOpportunity.country}`,
        textTj: `Нав: ${latestOpportunity.title} дар ${latestOpportunity.country}`,
      });
    }

    // 4. Get most viewed category (from active programs)
    const categoryViews = await prisma.program.groupBy({
      by: ['category'],
      where: {
        isActive: true,
        isVerified: true,
      },
      _sum: {
        viewCount: true,
      },
      orderBy: {
        _sum: {
          viewCount: 'desc',
        },
      },
      take: 1,
    });

    if (categoryViews.length > 0 && categoryViews[0]._sum.viewCount && categoryViews[0]._sum.viewCount > 0) {
      const category = categoryViews[0].category;
      const categoryNames: Record<string, { en: string; ru: string; tj: string }> = {
        SCHOLARSHIP: { en: 'Scholarships', ru: 'Стипендии', tj: 'Стипендияҳо' },
        FORUM: { en: 'Forums', ru: 'Форумы', tj: 'Форумҳо' },
        EXCHANGE: { en: 'Exchange Programs', ru: 'Программы обмена', tj: 'Барномаҳои мубодила' },
        INTERNSHIP: { en: 'Internships', ru: 'Стажировки', tj: 'Стажировкаҳо' },
        SEMINAR: { en: 'Seminars', ru: 'Семинары', tj: 'Семинарҳо' },
        SUMMER_SCHOOL: { en: 'Summer Schools', ru: 'Летние школы', tj: 'Мактабҳои тобистона' },
        CONFERENCE: { en: 'Conferences', ru: 'Конференции', tj: 'Конференсияҳо' },
      };

      const categoryName = categoryNames[category] || { en: category, ru: category, tj: category };

      activities.push({
        type: 'popular',
        icon: '⚡',
        text: `Popular now: ${categoryName.en}`,
        textRu: `Популярно сейчас: ${categoryName.ru}`,
        textTj: `Машҳур аст: ${categoryName.tj}`,
      });
    }

    // 5. If no real activity, return helpful tips (truthful, not fake stats)
    if (activities.length === 0) {
      activities.push({
        type: 'tip',
        icon: '💡',
        text: 'Search for opportunities that match your goals',
        textRu: 'Ищите возможности, которые соответствуют вашим целям',
        textTj: 'Имкониятҳои худро ҷустуҷӯ кунед',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        activities,
        timestamp: now.toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch real-time activity',
        data: {
          activities: [
            {
              type: 'tip' as const,
              icon: '💡',
              text: 'Search for opportunities that match your goals',
              textRu: 'Ищите возможности, которые соответствуют вашим целям',
              textTj: 'Имкониятҳои худро ҷустуҷӯ кунед',
            },
          ],
        },
      },
      { status: 500 }
    );
  }
}

