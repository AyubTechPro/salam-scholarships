/**
 * Most Popular Category API
 * Returns the most viewed category from real database data
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get most viewed category
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

    if (categoryViews.length === 0 || !categoryViews[0]._sum.viewCount || categoryViews[0]._sum.viewCount === 0) {
      // No data yet, return default education levels
      return NextResponse.json({
        success: true,
        data: {
          categories: [
            { en: 'Masters', ru: 'Магистратура', tj: 'Магистр' },
            { en: 'PhD', ru: 'Докторантура', tj: 'Доктор' },
            { en: 'Bachelor', ru: 'Бакалавриат', tj: 'Бакалавр' },
          ],
        },
      });
    }

    const category = categoryViews[0].category;

    // Map category to education level if applicable, otherwise use category name
    const categoryToLevel: Record<string, { en: string; ru: string; tj: string }[]> = {
      SCHOLARSHIP: [
        { en: 'Masters', ru: 'Магистратура', tj: 'Магистр' },
        { en: 'PhD', ru: 'Докторантура', tj: 'Доктор' },
        { en: 'Bachelor', ru: 'Бакалавриат', tj: 'Бакалавр' },
      ],
      FORUM: [
        { en: 'Forums', ru: 'Форумы', tj: 'Форумҳо' },
        { en: 'Conferences', ru: 'Конференции', tj: 'Конференсияҳо' },
      ],
      EXCHANGE: [
        { en: 'Exchange Programs', ru: 'Программы обмена', tj: 'Барномаҳои мубодила' },
      ],
      INTERNSHIP: [
        { en: 'Internships', ru: 'Стажировки', tj: 'Стажировкаҳо' },
      ],
      SEMINAR: [
        { en: 'Seminars', ru: 'Семинары', tj: 'Семинарҳо' },
      ],
      SUMMER_SCHOOL: [
        { en: 'Summer Schools', ru: 'Летние школы', tj: 'Мактабҳои тобистона' },
      ],
      CONFERENCE: [
        { en: 'Conferences', ru: 'Конференции', tj: 'Конференсияҳо' },
      ],
    };

    // Get most popular levels for this category
    const levelViews = await prisma.program.groupBy({
      by: ['level'],
      where: {
        isActive: true,
        isVerified: true,
        category: category,
      },
      _sum: {
        viewCount: true,
      },
      orderBy: {
        _sum: {
          viewCount: 'desc',
        },
      },
      take: 3,
    });

    // Map levels to display names
    const levelNames: Record<string, { en: string; ru: string; tj: string }> = {
      MASTER: { en: 'Masters', ru: 'Магистратура', tj: 'Магистр' },
      PHD: { en: 'PhD', ru: 'Докторантура', tj: 'Доктор' },
      BACHELOR: { en: 'Bachelor', ru: 'Бакалавриат', tj: 'Бакалавр' },
      SCHOOL: { en: 'School Programs', ru: 'Школьные программы', tj: 'Барномаҳои мактаб' },
    };

    const categories = levelViews.length > 0
      ? levelViews.map(lv => levelNames[lv.level] || { en: lv.level, ru: lv.level, tj: lv.level })
      : categoryToLevel[category] || [
          { en: 'Masters', ru: 'Магистратура', tj: 'Магистр' },
          { en: 'PhD', ru: 'Докторантура', tj: 'Доктор' },
          { en: 'Bachelor', ru: 'Бакалавриат', tj: 'Бакалавр' },
        ];

    return NextResponse.json({
      success: true,
      data: {
        categories,
        mostPopularCategory: category,
      },
    });
  } catch (error) {
    // Fallback to default education levels
    return NextResponse.json({
      success: true,
      data: {
        categories: [
          { en: 'Masters', ru: 'Магистратура', tj: 'Магистр' },
          { en: 'PhD', ru: 'Докторантура', tj: 'Доктор' },
          { en: 'Bachelor', ru: 'Бакалавриат', tj: 'Бакалавр' },
        ],
      },
    });
  }
}

