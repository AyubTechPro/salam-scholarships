import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

const getCachedGlobalSettings = unstable_cache(
  async () => {
    // Fetch all settings in parallel for optimal performance
    const [siteSettings, navigationMenu, uiDictionary] = await Promise.all([
      // Site Settings
      prisma.siteSettings.findUnique({
        where: { id: 'global' },
      }),
      // Navigation Menu (active items only, sorted by order)
      prisma.navigationMenu.findMany({
        where: { isActive: true },
        orderBy: [
          { location: 'asc' },
          { order: 'asc' },
          { createdAt: 'asc' },
        ],
        include: {
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
        },
      }),
      // UI Dictionary (all entries)
      prisma.uIDictionary.findMany({
        orderBy: [{ category: 'asc' }, { key: 'asc' }],
      }),
    ]);

    // Ensure siteSettings exists (create default if not)
    let settings = siteSettings;
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'global',
          siteName: 'Salam Scholarships',
        },
      });
    }

    // Transform UI Dictionary into a key-value map for easy access
    const dictionaryMap: Record<string, { en: string; ru?: string | null; tj?: string | null }> = {};
    uiDictionary.forEach((item) => {
      dictionaryMap[item.key] = {
        en: item.en,
        ru: item.ru,
        tj: item.tj,
      };
    });

    // Transform Navigation Menu into a structured tree
    const navigationTree = {
      navbar: navigationMenu
        .filter((item) => item.location === 'navbar' || item.location === 'both')
        .filter((item) => !item.parentId) // Only top-level items
        .map((item) => ({
          ...item,
          children: item.children || [],
        })),
      footer: navigationMenu
        .filter((item) => item.location === 'footer' || item.location === 'both')
        .filter((item) => !item.parentId) // Only top-level items
        .map((item) => ({
          ...item,
          children: item.children || [],
        })),
    };

    return {
      siteSettings: settings,
      navigation: navigationTree,
      dictionary: dictionaryMap,
    };
  },
  ['global-settings-cache'],
  { revalidate: 300, tags: ['settings', 'navigation', 'dictionary'] }
);

/**
 * Global Settings API
 * Returns all site-wide settings, navigation, and UI dictionary in a single request
 * This endpoint is cached and used by the Global Content Provider
 */
export async function GET() {
  try {
    const data = await getCachedGlobalSettings();

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        headers: {
          // Cache for 5 minutes (revalidated on-demand)
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching global settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch global settings' },
      { status: 500 }
    );
  }
}
