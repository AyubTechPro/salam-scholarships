'use client';

import { useTheme } from 'next-themes';
import Image from '@/components/common/ImageWithFallback';
import { useEffect, useState } from 'react';

interface SiteSettings {
  logoUrl?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
}

type LogoProps = {
  showTagline?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'auto'; // Force light/dark or auto-detect from theme
};

/** Returns true if the URL is from DB/storage or public directory */
function isConfiguredLogoUrl(url: string | null): boolean {
  if (!url) return false;
  return url.startsWith('http') || url.startsWith('/upload') || url.startsWith('/api/') || url.startsWith('/logo/');
}

/**
 * Logo Component - Uses SiteSettings from DB when available
 * Falls back to text when no logo images are configured (avoids 404s)
 */
export default function Logo({ showTagline = false, className = '', size = 'md', variant = 'auto' }: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
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
      setIsDark(resolvedTheme === 'dark' || theme === 'dark');
    }

    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings(data.data);
        }
      })
      .catch((err) => console.error('Error fetching logo settings:', err));
  }, [theme, resolvedTheme, variant]);

  const sizeConfig = {
    sm: { width: 140, height: 40 }, // Premium minimal navbar size
    md: { width: 180, height: 50 }, // Standard navbar size
    lg: { width: 240, height: 75 }, // Forms and Footer size
  };
  const config = sizeConfig[size];

  // Only use Image when we have a configured URL from DB
  const logoUrl = settings
    ? isDark && settings.logoDarkUrl
      ? settings.logoDarkUrl
      : !isDark && settings.logoLightUrl
        ? settings.logoLightUrl
        : settings.logoUrl || null
    : null;

  const TextFallback = () => (
    <div
      className="flex items-center"
      style={{ width: config.width, height: config.height }}
    >
      <Image
        src="/logo/IMG_20260728_215848_226.png"
        alt="Salam Scholarships Logo"
        fill
        className="object-contain object-left scale-[2.5] origin-left translate-x-4"
        priority
      />
    </div>
  );

  if (!mounted) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <div className="relative" style={{ width: config.width, height: config.height }}>
          <TextFallback />
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <div className="relative" style={{ width: config.width, height: config.height }}>
        {logoUrl && isConfiguredLogoUrl(logoUrl) ? (
          <Image
            src={logoUrl}
            alt="Salam Scholarships"
            fill
            className="object-contain object-left scale-[2.5] origin-left translate-x-4"
            priority
            sizes={`${config.width}px`}
            onError={() => setSettings(null)}
          />
        ) : (
          <TextFallback />
        )}
      </div>
      {/* Tagline - only show when we have a configured logo (no separate tagline image to avoid 404s) */}
      {showTagline && logoUrl && (
        <div className="mt-1 text-xs text-muted-foreground">Educational Opportunities</div>
      )}
    </div>
  );
}
