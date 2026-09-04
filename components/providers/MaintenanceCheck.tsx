'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useGlobalContent } from './GlobalContentProvider';

export default function MaintenanceCheck() {
  const pathname = usePathname();
  const locale = useLocale();
  const { getSiteSetting, loading } = useGlobalContent();

  useEffect(() => {
    if (loading) return;
    if (pathname?.includes('/admin') || pathname?.includes('/maintenance')) return;

    const maintenanceMode = getSiteSetting('maintenanceMode');
    if (maintenanceMode) {
      window.location.href = `/${locale}/maintenance`;
    }
  }, [pathname, locale, loading, getSiteSetting]);

  return null;
}

