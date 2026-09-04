'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface LiveTrackerProps {
  entityType?: string;
  entityId?: string;
  metadata?: any;
}

export default function LiveTracker({ entityType = 'PAGE', entityId, metadata = {} }: LiveTrackerProps) {
  const pathname = usePathname();
  const trackedPath = useRef<string>('');

  useEffect(() => {
    // Only track once per path change to avoid duplicate triggers
    if (trackedPath.current === pathname) return;
    trackedPath.current = pathname;

    const trackVisit = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            activityType: 'VIEW',
            entityType,
            entityId,
            metadata: {
              ...metadata,
              path: pathname,
              timestamp: new Date().toISOString()
            }
          }),
        });
      } catch (error) {
        // Silent fail
      }
    };

    // Small delay to ensure page is loaded
    const timer = setTimeout(trackVisit, 1000);
    return () => clearTimeout(timer);
  }, [pathname, entityType, entityId, metadata]);

  return null; // Invisible component
}
