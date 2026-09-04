/**
 * Client-side Scoped Translation Hook
 * Uses GlobalContent dictionary (loaded once) - no per-key API fetch.
 */

'use client';

import { useTranslations } from 'next-intl';
import { useGlobalContent } from '@/components/providers/GlobalContentProvider';

/**
 * Hook to get translation with UIDictionary fallback
 * @param key - Translation key
 * @param namespace - Optional namespace for next-intl
 * @returns Translated string
 */
export function useScopedTranslation(key: string, namespace?: string) {
  const t = useTranslations(namespace);
  const { getDictionaryText, loading } = useGlobalContent();
  const fallback = t(key);
  const dictText = loading ? null : getDictionaryText(key, fallback);
  return dictText ?? fallback;
}
