import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import OpportunityDetail from '@/components/opportunities/OpportunityDetail';
import { generateOpportunityMetadata } from '@/lib/seo';
import { generateOpportunityJSONLD } from '@/lib/json-ld';

export async function generateMetadata({ params }: { params: { locale: string; id: string } }): Promise<Metadata> {
  // Try to find by slug first, then by ID
  const opportunity = await prisma.program.findFirst({
    where: {
      OR: [
        { slug: params.id },
        { id: params.id },
      ],
      isActive: true,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      titleRu: true,
      titleTj: true,
      description: true,
      descriptionRu: true,
      descriptionTj: true,
      imageUrl: true,
      country: true,
      category: true,
      level: true,
      institution: true,
      deadline: true,
      startDate: true,
      fundingType: true,
      websiteUrl: true,
      applicationUrl: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  if (!opportunity) {
    return {
      title: 'Opportunity Not Found - Salam Scholarships',
      description: 'The opportunity you are looking for could not be found.',
    };
  }

  // Enhanced metadata with more fields
  const baseMetadata = generateOpportunityMetadata(opportunity, params.locale);
  
  // Get localized content
  const title = params.locale === 'ru' && opportunity.titleRu
    ? opportunity.titleRu
    : params.locale === 'tj' && opportunity.titleTj
    ? opportunity.titleTj
    : opportunity.title;

  const description = params.locale === 'ru' && opportunity.descriptionRu
    ? opportunity.descriptionRu.substring(0, 160)
    : params.locale === 'tj' && opportunity.descriptionTj
    ? opportunity.descriptionTj.substring(0, 160)
    : opportunity.description.substring(0, 160);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://salamconsulting.com';
  const path = opportunity.slug
    ? `/opportunities/${opportunity.slug}`
    : `/opportunities/${opportunity.id}`;
  const canonical = `${baseUrl}/${params.locale}${path}`;

  // Enhanced metadata with additional SEO fields
  return {
    ...baseMetadata,
    title: `${title} | ${opportunity.category} in ${opportunity.country} - Salam Scholarships`,
    description,
    keywords: [
      opportunity.category?.toLowerCase(),
      opportunity.level?.toLowerCase(),
      opportunity.country?.toLowerCase(),
      opportunity.institution?.toLowerCase(),
      'scholarship',
      'opportunity',
      'education',
      'study abroad',
      params.locale === 'ru' ? 'стипендия' : params.locale === 'tj' ? 'стипендия' : 'scholarship',
    ].filter(Boolean).join(', '),
    alternates: {
      canonical,
      languages: {
        'en': `${baseUrl}/en${path}`,
        'ru': `${baseUrl}/ru${path}`,
        'tg': `${baseUrl}/tj${path}`,
      },
    },
    openGraph: {
      ...baseMetadata.openGraph,
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
      publishedTime: opportunity.createdAt.toISOString(),
      modifiedTime: opportunity.updatedAt.toISOString(),
      section: opportunity.category,
      tags: [
        opportunity.category,
        opportunity.level,
        opportunity.country,
        opportunity.institution,
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - Salam Scholarships`,
      description,
      images: opportunity.imageUrl ? [opportunity.imageUrl] : [],
      creator: '@salamconsulting',
    },
    other: {
      'geo.region': opportunity.country || '',
      'geo.placename': opportunity.country || '',
      'article:published_time': opportunity.createdAt.toISOString(),
      'article:modified_time': opportunity.updatedAt.toISOString(),
      'article:section': opportunity.category || '',
      'article:tag': [
        opportunity.category,
        opportunity.level,
        opportunity.country,
      ].filter(Boolean).join(', '),
    },
  };
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  // Try to find by slug first, then by ID
  const opportunity = await prisma.program.findFirst({
    where: {
      OR: [
        { slug: params.id },
        { id: params.id },
      ],
      isActive: true,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      titleRu: true,
      titleTj: true,
      description: true,
      descriptionRu: true,
      descriptionTj: true,
      level: true,
      category: true,
      fundingType: true,
      country: true,
      institution: true,
      deadline: true,
      startDate: true,
      endDate: true,
      imageUrl: true,
      websiteUrl: true,
      applicationUrl: true,
      isVerified: true,
      viewCount: true,
      createdAt: true,
    },
  });

  if (!opportunity) {
    notFound();
  }

  // Generate JSON-LD structured data for SEO
  const jsonLd = generateOpportunityJSONLD(
    {
      id: opportunity.id,
      slug: opportunity.slug,
      title: params.locale === 'ru' && opportunity.titleRu
        ? opportunity.titleRu
        : params.locale === 'tj' && opportunity.titleTj
        ? opportunity.titleTj
        : opportunity.title,
      description: params.locale === 'ru' && opportunity.descriptionRu
        ? opportunity.descriptionRu
        : params.locale === 'tj' && opportunity.descriptionTj
        ? opportunity.descriptionTj
        : opportunity.description,
      imageUrl: opportunity.imageUrl,
      websiteUrl: opportunity.websiteUrl,
      category: opportunity.category,
      level: opportunity.level,
      country: opportunity.country,
      institution: opportunity.institution,
      deadline: opportunity.deadline,
      startDate: opportunity.startDate,
      createdAt: opportunity.createdAt,
    },
    params.locale
  );
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://salamconsulting.com').replace(/\/+$/, '');
  const path = opportunity.slug
    ? `/opportunities/${opportunity.slug}`
    : `/opportunities/${opportunity.id}`;
  const opportunityUrl = `${baseUrl}/${params.locale}${path}`;
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name:
          params.locale === 'ru'
            ? 'Кто может подать заявку?'
            : params.locale === 'tj'
            ? 'Кӣ метавонад дархост диҳад?'
            : 'Who can apply for this opportunity?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            params.locale === 'ru'
              ? 'Проверьте требования к уровню, стране и дедлайну на странице возможности.'
              : params.locale === 'tj'
              ? 'Талаботи сатҳ, кишвар ва муҳлатро дар саҳифаи имконият бинед.'
              : 'Check level, country, and deadline requirements on this opportunity page.',
        },
      },
      {
        '@type': 'Question',
        name:
          params.locale === 'ru'
            ? 'Где найти официальный источник программы?'
            : params.locale === 'tj'
            ? 'Манбаи расмии барномаро аз куҷо ёбам?'
            : 'Where can I find the official program source?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            params.locale === 'ru'
              ? 'Используйте кнопку официального сайта в карточке возможности.'
              : params.locale === 'tj'
              ? 'Тугмаи сомонаи расмиро дар корти имконият истифода баред.'
              : 'Use the official website link available in the opportunity details.',
        },
      },
    ],
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${baseUrl}/${params.locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Opportunities',
        item: `${baseUrl}/${params.locale}/opportunities`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: opportunity.title,
        item: opportunityUrl,
      },
    ],
  };

  // View tracking is handled client-side via OpportunityDetail component
  // This prevents double-counting views (one per page load, not one per render)
  // Client-side tracking also creates UserActivity records for analytics

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <OpportunityDetail opportunity={opportunity} locale={params.locale} />
    </>
  );
}

