/**
 * SEO Utilities for Global Multilingual Platform
 * Handles dynamic meta tags, hreflang, and SEO-friendly slugs
 */

import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://salamconsulting.com';
const locales = ['en', 'ru', 'tj'] as const;
const localeMap: Record<string, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  tj: 'tg-TJ',
};

/**
 * Generate SEO-friendly slug from title
 */
export function generateSlug(title: string, locale: string = 'en'): string {
  const text = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // Add locale prefix if not English
  return locale === 'en' ? text : `${text}-${locale}`;
}

/**
 * Generate hreflang tags for multilingual pages
 */
export function generateHreflangTags(
  path: string,
  availableLocales: string[] = [...locales]
): Array<{ rel: string; hreflang: string; href: string }> {
  return availableLocales.map((locale) => ({
    rel: 'alternate',
    hreflang: localeMap[locale] || locale,
    href: `${baseUrl}/${locale}${path}`,
  }));
}

/**
 * Generate comprehensive metadata for Opportunities
 */
export function generateOpportunityMetadata(
  opportunity: {
    id: string;
    slug?: string | null;
    title: string;
    titleRu?: string | null;
    titleTj?: string | null;
    description: string;
    descriptionRu?: string | null;
    descriptionTj?: string | null;
    imageUrl?: string | null;
    country?: string | null;
    category?: string | null;
    updatedAt: Date;
  },
  locale: string
): Metadata {
  const title =
    locale === 'ru' && opportunity.titleRu
      ? opportunity.titleRu
      : locale === 'tj' && opportunity.titleTj
      ? opportunity.titleTj
      : opportunity.title;

  const description =
    locale === 'ru' && opportunity.descriptionRu
      ? opportunity.descriptionRu.substring(0, 160)
      : locale === 'tj' && opportunity.descriptionTj
      ? opportunity.descriptionTj.substring(0, 160)
      : opportunity.description.substring(0, 160);

  // Generate canonical URL with slug or ID
  const path = opportunity.slug
    ? `/opportunities/${opportunity.slug}`
    : `/opportunities/${opportunity.id}`;
  const canonical = `${baseUrl}/${locale}${path}`;

  // Generate alternate language links
  const alternates: Metadata['alternates'] = {
    canonical,
    languages: {
      'en': `${baseUrl}/en${path}`,
      'ru': `${baseUrl}/ru${path}`,
      'tg': `${baseUrl}/tj${path}`,
    },
  };

  // Build keywords
  const keywords = [
    opportunity.category?.toLowerCase(),
    opportunity.country?.toLowerCase(),
    'scholarship',
    'opportunity',
    'education',
    locale === 'ru' ? 'стипендия' : locale === 'tj' ? 'стипендия' : 'scholarship',
  ]
    .filter(Boolean)
    .join(', ');

  return {
    title: `${title} - Salam Scholarships`,
    description,
    keywords,
    alternates,
    openGraph: {
      title: `${title} - Salam Scholarships`,
      description,
      type: 'article',
      url: canonical,
      siteName: 'Salam Scholarships',
      images: opportunity.imageUrl
        ? [
            {
              url: opportunity.imageUrl,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : [],
      locale: localeMap[locale] || locale,
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => localeMap[l] || l),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - Salam Scholarships`,
      description,
      images: opportunity.imageUrl ? [opportunity.imageUrl] : [],
    },
    other: {
      'geo.region': opportunity.country || '',
      'article:published_time': opportunity.updatedAt.toISOString(),
      'article:modified_time': opportunity.updatedAt.toISOString(),
    },
  };
}

/**
 * Generate metadata for Events
 */
export function generateEventMetadata(
  event: {
    id: string;
    slug?: string | null;
    title: string;
    titleRu?: string | null;
    titleTj?: string | null;
    description: string;
    descriptionRu?: string | null;
    descriptionTj?: string | null;
    imageUrl?: string | null;
    eventDate: Date;
    updatedAt: Date;
  },
  locale: string
): Metadata {
  const title =
    locale === 'ru' && event.titleRu
      ? event.titleRu
      : locale === 'tj' && event.titleTj
      ? event.titleTj
      : event.title;

  const description =
    locale === 'ru' && event.descriptionRu
      ? event.descriptionRu.substring(0, 160)
      : locale === 'tj' && event.descriptionTj
      ? event.descriptionTj.substring(0, 160)
      : event.description.substring(0, 160);

  const path = event.slug ? `/events/${event.slug}` : `/events/${event.id}`;
  const canonical = `${baseUrl}/${locale}${path}`;

  return {
    title: `${title} - Salam Scholarships`,
    description,
    alternates: {
      canonical,
      languages: {
        'en': `${baseUrl}/en${path}`,
        'ru': `${baseUrl}/ru${path}`,
        'tg': `${baseUrl}/tj${path}`,
      },
    },
    openGraph: {
      title: `${title} - Salam Scholarships`,
      description,
      type: 'website',
      url: canonical,
      siteName: 'Salam Scholarships',
      images: event.imageUrl
        ? [
            {
              url: event.imageUrl,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : [],
      locale: localeMap[locale] || locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - Salam Scholarships`,
      description,
    },
  };
}

