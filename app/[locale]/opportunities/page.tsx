import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import OpportunitiesListing from '@/components/opportunities/OpportunitiesListing';

export const revalidate = 3600;

type Props = {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata' });

  // Extract common SEO parameters
  const country = typeof searchParams.country === 'string' ? searchParams.country : null;
  const level = typeof searchParams.level === 'string' ? searchParams.level : null;
  const category = typeof searchParams.category === 'string' ? searchParams.category : null;

  let title = t('opportunities.title');
  let description = t('opportunities.description');

  if (country || level || category) {
    const parts = [];
    if (category) parts.push(category === 'SCHOLARSHIP' ? 'Scholarships' : category === 'INTERNSHIP' ? 'Internships' : 'Programs');
    else parts.push('Study Opportunities');

    if (level) parts.push(`for ${level.toLowerCase()} students`);
    if (country) parts.push(`in ${country}`);

    const dynamicSubject = parts.join(' ');
    title = `${dynamicSubject} | Salam Scholarships`;
    description = `Find and securely apply for top ${dynamicSubject.toLowerCase()} worldwide. Guaranteed placement assistance and seamless document uploads.`;
  }

  return {
    title,
    description,
    openGraph: {
      title: t('opportunities.title'),
      description: t('opportunities.description'),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('opportunities.title'),
      description: t('opportunities.description'),
    },
  };
}

export default async function OpportunitiesPage({ params, searchParams }: Props) {


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-dark overflow-x-hidden">
      <OpportunitiesListing />
    </div>
  );
}

