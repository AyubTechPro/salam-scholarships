/**
 * Scoped Translation Utility
 * Checks UIDictionary first, then falls back to next-intl JSON files
 */

import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';

// Cache for dictionary entries
let dictionaryCache: Map<string, { en: string; ru?: string | null; tj?: string | null }> | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Server-side function to get translation with fallback
 * @param key - Translation key (e.g., 'common.consulting' or 'navbar.scholarships')
 * @param locale - Current locale
 * @param namespace - Optional namespace for next-intl fallback
 * @returns Translated string
 */
export async function getScopedTranslation(
  key: string,
  locale: string,
  namespace?: string
): Promise<string> {
  try {
    // Check cache first
    const now = Date.now();
    if (!dictionaryCache || now - cacheTimestamp > CACHE_DURATION) {
      // Fetch all dictionary entries
      const items = await prisma.uIDictionary.findMany({
        select: {
          key: true,
          en: true,
          ru: true,
          tj: true,
        },
      });

      dictionaryCache = new Map();
      items.forEach((item) => {
        dictionaryCache!.set(item.key, {
          en: item.en,
          ru: item.ru,
          tj: item.tj,
        });
      });
      cacheTimestamp = now;
    }

    // Check UIDictionary first
    if (dictionaryCache && dictionaryCache.has(key)) {
      const item = dictionaryCache.get(key)!;
      if (locale === 'ru' && item.ru) return item.ru;
      if (locale === 'tj' && item.tj) return item.tj;
      return item.en;
    }

    // Fallback to next-intl
    const t = await getTranslations({ locale, namespace });
    try {
      return t(key);
    } catch {
      // If key doesn't exist in next-intl, return the key itself
      return key;
    }
  } catch (error) {
    console.error('Error in getScopedTranslation:', error);
    // Final fallback: try next-intl
    try {
      const t = await getTranslations({ locale, namespace });
      return t(key);
    } catch {
      return key;
    }
  }
}

/**
 * Clear the dictionary cache (call after updates)
 */
export function clearScopedTranslationCache() {
  dictionaryCache = null;
  cacheTimestamp = 0;
}

/**
 * Client-side hook for scoped translations
 */
export function useScopedTranslation(key: string, fallbackKey?: string) {
  // This will be used in client components
  // For now, we'll use the existing UIDictionaryText component
  return { key, fallbackKey };
}

