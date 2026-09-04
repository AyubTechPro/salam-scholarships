'use client';

import { useGlobalContent } from '@/components/providers/GlobalContentProvider';

type UIDictionaryTextProps = {
  dictKey: string;
  fallback?: string;
  category?: string;
};

/**
 * Renders localized text from UI Dictionary.
 * Uses GlobalContent (loaded once) - no per-key API fetch.
 */
export default function UIDictionaryText({ dictKey, fallback }: UIDictionaryTextProps) {
  const { getDictionaryText, loading } = useGlobalContent();
  const text = loading ? (fallback ?? dictKey) : getDictionaryText(dictKey, fallback);
  return <>{text}</>;
}
