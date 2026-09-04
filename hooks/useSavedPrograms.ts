'use client';

import { useState, useEffect, useCallback } from 'react';

export type SavedProgramItem = { id: string; programId: string; program?: Record<string, unknown> };

const cache: {
  data: SavedProgramItem[] | null;
  promise: Promise<SavedProgramItem[] | null> | null;
  timestamp: number;
} = { data: null, promise: null, timestamp: 0 };

const CACHE_TTL_MS = 30_000;

async function fetchSavedPrograms(): Promise<SavedProgramItem[] | null> {
  const now = Date.now();
  if (cache.data && now - cache.timestamp < CACHE_TTL_MS) return cache.data;
  if (cache.promise) return cache.promise;

  cache.promise = fetch('/api/user/saved-programs')
    .then((res) => res.json())
    .then((result) => (result.success ? result.data ?? [] : []))
    .catch(() => [])
    .then((data) => {
      cache.data = data;
      cache.timestamp = Date.now();
      cache.promise = null;
      return data;
    });

  return cache.promise;
}

function invalidateSavedCache() {
  cache.data = null;
  cache.promise = null;
  cache.timestamp = 0;
}

export function useSavedPrograms(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled ?? true;
  const [savedPrograms, setSavedPrograms] = useState<SavedProgramItem[]>(cache.data ?? []);
  const [loading, setLoading] = useState(enabled && !cache.data);

  const refetch = useCallback(() => {
    invalidateSavedCache();
    setLoading(true);
    fetchSavedPrograms().then((data) => {
      setSavedPrograms(data ?? []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!enabled) {
      setSavedPrograms([]);
      setLoading(false);
      return;
    }
    if (cache.data) {
      setSavedPrograms(cache.data);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchSavedPrograms().then((data) => {
      setSavedPrograms(data ?? []);
      setLoading(false);
    });
  }, [enabled]);

  const savedIds = new Set(savedPrograms.map((sp) => sp.programId));
  const isSaved = useCallback((programId: string) => savedIds.has(programId), [savedPrograms]);

  return { savedPrograms, savedIds, isSaved, loading, refetch, invalidate: invalidateSavedCache };
}
