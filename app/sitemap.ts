import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const DEFAULT_BASE_URL = 'https://salamconsulting.com';
const LOCALES = ['en', 'ru', 'tj'] as const;
const PROGRAM_LEVELS = ['school', 'bachelor', 'master', 'phd'] as const;

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function slugifyCountry(country: string): string {
  return country.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function buildStaticPages(baseUrl: string): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    ...LOCALES.flatMap((locale) => [
      {
        url: `${baseUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/${locale}/opportunities`,
        lastModified: new Date(),
        changeFrequency: 'hourly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/${locale}/opportunities/explore`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/${locale}/dashboard`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
    ]),
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_BASE_URL);
  const staticPages = buildStaticPages(baseUrl);

  let opportunityPages: MetadataRoute.Sitemap = [];
  let countryPages: MetadataRoute.Sitemap = [];
  let levelPages: MetadataRoute.Sitemap = [];
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const [opportunities, countries, categories] = await Promise.all([
      prisma.program.findMany({
        where: {
          isActive: true,
          isExpired: false,
          deletedAt: null,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
        take: 1000, // Limit to prevent sitemap from being too large
      }),
      prisma.program.findMany({
        where: {
          isActive: true,
          deletedAt: null,
        },
        select: {
          country: true,
          updatedAt: true,
        },
        distinct: ['country'],
        take: 200,
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: {
          slug: true,
          updatedAt: true,
        },
        take: 100,
      }),
    ]);

    opportunityPages = opportunities
      .filter((opp) => typeof opp.slug === 'string' && opp.slug.trim().length > 0)
      .flatMap((opp) =>
        LOCALES.map((locale) => ({
          url: `${baseUrl}/${locale}/opportunities/${opp.slug}`,
          lastModified: opp.updatedAt,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }))
      );

    countryPages = countries
      .filter((item) => typeof item.country === 'string' && item.country.trim().length > 0)
      .flatMap((item) =>
        LOCALES.flatMap((locale) => [
            {
              url: `${baseUrl}/${locale}/opportunities/country/${slugifyCountry(item.country)}`,
              lastModified: item.updatedAt,
              changeFrequency: 'daily' as const,
              priority: 0.75,
            },
            {
              url: `${baseUrl}/${locale}/scholarships-in/${slugifyCountry(item.country)}`,
              lastModified: item.updatedAt,
              changeFrequency: 'daily' as const,
              priority: 0.72,
            },
            {
              url: `${baseUrl}/${locale}/study-in/${slugifyCountry(item.country)}`,
              lastModified: item.updatedAt,
              changeFrequency: 'daily' as const,
              priority: 0.72,
            },
          ])
      );

    levelPages = PROGRAM_LEVELS.flatMap((level) =>
      LOCALES.map((locale) => ({
        url: `${baseUrl}/${locale}/opportunities/level/${level}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.75,
      }))
    );

    categoryPages = categories.flatMap((item) =>
      LOCALES.map((locale) => ({
        url: `${baseUrl}/${locale}/opportunities/category/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.75,
      }))
    );
  } catch (error) {
    console.error('Failed to load opportunities for sitemap:', error);
  }

  // Keep sitemap stable and remove accidental duplicates.
  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const item of [...staticPages, ...opportunityPages, ...countryPages, ...levelPages, ...categoryPages]) {
    byUrl.set(item.url, item);
  }

  return Array.from(byUrl.values());
}
