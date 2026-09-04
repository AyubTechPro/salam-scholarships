import { Metadata } from 'next';
import OpportunitiesListing from '@/components/opportunities/OpportunitiesListing';

export const dynamic = 'force-dynamic';

function slugToCountry(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getCopy(locale: string, country: string) {
  if (locale === 'ru') {
    return {
      title: `Стипендии и обучение в ${country} | Salam Scholarships`,
      description: `Найдите актуальные стипендии, программы и образовательные возможности в ${country}.`,
      heading: `Возможности в ${country}`,
      subtitle: 'Проверенные международные образовательные программы',
    };
  }
  if (locale === 'tj') {
    return {
      title: `Стипендия ва таҳсил дар ${country} | Salam Scholarships`,
      description: `Имкониятҳои фаъол, стипендия ва барномаҳои таҳсилро барои ${country} пайдо кунед.`,
      heading: `Имкониятҳо дар ${country}`,
      subtitle: 'Барномаҳои санҷидашудаи таҳсили байналмилалӣ',
    };
  }
  return {
    title: `Scholarships and Study Opportunities in ${country} | Salam Scholarships`,
    description: `Find active scholarships, study programs, and education opportunities in ${country}.`,
    heading: `Opportunities in ${country}`,
    subtitle: 'Verified international education programs',
  };
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; country: string };
}): Promise<Metadata> {
  const country = slugToCountry(params.country);
  const copy = getCopy(params.locale, country);
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://salamconsulting.com').replace(/\/+$/, '');
  const path = `/opportunities/country/${params.country}`;

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: `/${params.locale}${path}`,
      languages: {
        en: `/en${path}`,
        ru: `/ru${path}`,
        'tj-TJ': `/tj${path}`,
      },
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      type: 'website',
      url: `${baseUrl}/${params.locale}${path}`,
    },
  };
}

export default async function OpportunitiesByCountryPage({
  params,
}: {
  params: { locale: string; country: string };
}) {
  const country = slugToCountry(params.country);
  const copy = getCopy(params.locale, country);
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name:
          params.locale === 'ru'
            ? `Как найти стипендии в ${country}?`
            : params.locale === 'tj'
            ? `Чӣ тавр стипендияҳоро дар ${country} ёбам?`
            : `How do I find scholarships in ${country}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            params.locale === 'ru'
              ? `Используйте фильтры по уровню, дедлайну и типу финансирования для программ в ${country}.`
              : params.locale === 'tj'
              ? `Филтрҳои сатҳ, муҳлат ва намуди маблағгузориро барои барномаҳои ${country} истифода баред.`
              : `Use level, deadline, and funding filters to discover programs in ${country}.`,
        },
      },
      {
        '@type': 'Question',
        name:
          params.locale === 'ru'
            ? 'Можно ли подать заявку прямо на платформе?'
            : params.locale === 'tj'
            ? 'Оё метавонам бевосита аз платформа ариза диҳам?'
            : 'Can I apply directly from the platform?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            params.locale === 'ru'
              ? 'Да, для многих возможностей доступны прямые ссылки и маршруты подачи заявки.'
              : params.locale === 'tj'
              ? 'Бале, барои бисёр имкониятҳо пайвандҳои мустақим ва роҳҳои ариза мавҷуданд.'
              : 'Yes, many opportunities include direct links and application pathways.',
        },
      },
    ],
  };

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-navy mb-4">{copy.heading}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{copy.subtitle}</p>
        </div>
        <OpportunitiesListing
          initialCountry={country}
          categoryName={copy.heading}
        />
        <section className="mt-12 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-2xl font-heading font-bold text-navy mb-4">
            {params.locale === 'ru' ? 'FAQ' : params.locale === 'tj' ? 'Саволҳои маъмул' : 'FAQ'}
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>
                {params.locale === 'ru'
                  ? `Какие программы в ${country} наиболее популярны?`
                  : params.locale === 'tj'
                  ? `Кадом барномаҳо дар ${country} маъмуланд?`
                  : `Which programs are most popular in ${country}?`}
              </strong>
            </p>
            <p>
              {params.locale === 'ru'
                ? 'Обычно это стипендии бакалавриата, магистратуры и краткосрочные международные программы.'
                : params.locale === 'tj'
                ? 'Одатан инҳо стипендияҳои бакалавр, магистр ва барномаҳои кӯтоҳмуддати байналмилалӣ мебошанд.'
                : 'Typically these include bachelor and master scholarships plus short-term global programs.'}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
