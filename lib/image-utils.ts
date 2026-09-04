/**
 * Image Utilities
 * Helper functions for image optimization and blur placeholders
 */

/** Known broken image URLs (404) - replace with fallback */
const BROKEN_IMAGE_PATTERNS = ['photo-1523050854058-8df90110c9f1'];
const FALLBACK_IMAGE_URL = 'https://picsum.photos/seed/scholarship/800/600';

/**
 * Returns a safe image URL - replaces known broken URLs with fallback
 */
export function getSafeImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const isBroken = BROKEN_IMAGE_PATTERNS.some((p) => url.includes(p));
  return isBroken ? FALLBACK_IMAGE_URL : url;
}

/**
 * Generate a base64 blur placeholder
 * This creates a tiny 10x10 pixel image that can be used as a blur placeholder
 */
export function generateBlurPlaceholder(width: number = 10, height: number = 10): string {
  // Create a simple SVG placeholder that can be base64 encoded
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0a192f"/>
      <text x="50%" y="50%" font-size="8" fill="#eab308" text-anchor="middle" dy=".3em">S</text>
    </svg>
  `.trim();

  // Convert to base64
  if (typeof window !== 'undefined') {
    // Client-side: use btoa
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  } else {
    // Server-side: use Buffer
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
}

/**
 * Generate a blur data URL for next/image placeholder
 * This is a minimal blur placeholder that works with next/image
 */
export function getBlurDataURL(): string {
  // A minimal 1x1 pixel transparent PNG, base64 encoded
  // This creates a blur effect when used with next/image
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}

/**
 * Generate a gradient blur placeholder based on brand colors
 */
export function generateBrandBlurPlaceholder(): string {
  const svg = `
    <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0a192f;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#1e3a5f;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#eab308;stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
    </svg>
  `.trim();

  if (typeof window !== 'undefined') {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  } else {
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
}

