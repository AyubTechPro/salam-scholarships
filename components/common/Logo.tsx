'use client';

import { useTheme } from 'next-themes';
import NextImage from 'next/image';
import { useEffect, useState } from 'react';

interface SiteSettings {
  logoUrl?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
}

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

type LogoProps = {
  showTagline?: boolean;
  className?: string;
  size?: LogoSize;
  variant?: 'light' | 'dark' | 'auto';
};

const sizeConfig: Record<LogoSize, { width: number; height: number }> = {
  sm: { width: 148, height: 38 },
  md: { width: 188, height: 48 },
  lg: { width: 240, height: 62 },
  xl: { width: 300, height: 77 },
};

function isValidLogoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('/upload') ||
    url.startsWith('/api/') ||
    url.startsWith('/logo/')
  );
}

/**
 * Logo Component - Professional quality
 * DB logo > bundled default. Never shows broken image icons.
 */
export default function Logo({
  showTagline = false,
  className = '',
  size = 'md',
  variant = 'auto',
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    setMounted(true);
    if (variant === 'dark') {
      setIsDark(true);
    } else if (variant === 'light') {
      setIsDark(false);
    } else {
      setIsDark(resolvedTheme === 'dark');
    }
  }, [resolvedTheme, variant]);

  useEffect(() => {
    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.data) {
          setSettings(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const { width, height } = sizeConfig[size];

  const resolvedLogoUrl: string | null = (() => {
    if (settings) {
      if (isDark && isValidLogoUrl(settings.logoDarkUrl)) return settings.logoDarkUrl!;
      if (!isDark && isValidLogoUrl(settings.logoLightUrl)) return settings.logoLightUrl!;
      if (isValidLogoUrl(settings.logoUrl)) return settings.logoUrl!;
    }
    return null;
  })();

  // Always show the light logo as SSR default to avoid blank flash
  // After mount, switch to theme-appropriate logo
  const defaultLogoSrc = mounted
    ? isDark
      ? '/logo/salamscholarships-logo-transparent.png'
      : '/logo/salamscholarships-logo-transparent-v2.png'
    : '/logo/salamscholarships-logo-transparent-v2.png'; // SSR safe default

  const logoSrc = resolvedLogoUrl || defaultLogoSrc;

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <NextImage
        src={logoSrc}
        alt="Salam Scholarships – Educational Opportunities"
        width={width}
        height={height}
        className="object-contain"
        style={{ width, height, objectFit: 'contain', objectPosition: 'left center' }}
        priority
        quality={95}
        unoptimized
      />
      {showTagline && (
        <span className="mt-1 text-[10px] font-semibold tracking-[0.2em] uppercase text-brand-gold/80 pl-0.5">
          Educational Opportunities
        </span>
      )}
    </div>
  );
}
