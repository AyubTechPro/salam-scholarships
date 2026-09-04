'use client';

import { useEffect, useState, useCallback } from 'react';

type LandingContent = Record<string, unknown> | null;

const landingCache: { data: LandingContent; promise: Promise<LandingContent> | null } = {
  data: null,
  promise: null,
};

async function fetchLandingContent(): Promise<LandingContent> {
  if (landingCache.data) return landingCache.data;
  if (landingCache.promise) return landingCache.promise;
  landingCache.promise = fetch('/api/public/cms/landing')
    .then((res) => {
      if (!res.ok) return null;
      return res.json();
    })
    .then((result) => (result?.success ? result.data : null))
    .catch(() => null)
    .then((data) => {
      landingCache.data = data;
      landingCache.promise = null;
      return data;
    });
  return landingCache.promise;
}

export function LandingContentProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useLandingContent() {
  const [content, setContent] = useState<LandingContent>(landingCache.data);
  const [loading, setLoading] = useState(!landingCache.data);

  const refetch = useCallback(() => {
    landingCache.data = null;
    landingCache.promise = null;
    setLoading(true);
    fetchLandingContent().then((data) => {
      setContent(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (landingCache.data) {
      setContent(landingCache.data);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchLandingContent().then((data) => {
      setContent(data);
      setLoading(false);
    });
  }, []);

  return { content, loading, refetch };
}
