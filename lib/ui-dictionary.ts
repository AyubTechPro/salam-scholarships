/**
 * UI Dictionary Utility
 * Fetches and caches UI text from the database
 */

let dictionaryCache: Record<string, { en: string; ru?: string | null; tj?: string | null }> | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getUIDictionaryText(
  key: string,
  locale: string = 'en'
): Promise<string | null> {
  try {
    // Check cache
    const now = Date.now();
    if (!dictionaryCache || now - cacheTimestamp > CACHE_DURATION) {
      const response = await fetch('/api/ui-dictionary');
      const result = await response.json();
      if (result.success && result.data) {
        dictionaryCache = result.data;
        cacheTimestamp = now;
      }
    }

    if (!dictionaryCache || !dictionaryCache[key]) {
      return null; // Key not found, return null to use fallback
    }

    const item = dictionaryCache[key];
    
    if (locale === 'ru' && item.ru) return item.ru;
    if (locale === 'tj' && item.tj) return item.tj;
    return item.en;
  } catch (error) {
    console.error('Error fetching UI dictionary:', error);
    return null;
  }
}

export function clearUIDictionaryCache() {
  dictionaryCache = null;
  cacheTimestamp = 0;
}

