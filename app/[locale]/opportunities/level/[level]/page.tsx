import { Metadata } from 'next';
import OpportunitiesListing from '@/components/opportunities/OpportunitiesListing';

export const dynamic = 'force-dynamic';

const allowedLevels = ['SCHOOL', 'BACHELOR', 'MASTER', 'PHD'] as const;
type AllowedLevel = (typeof allowedLevels)[number];

function normalizeLevel(raw: string): AllowedLevel {
  const upper = raw.toUpperCase();
  if (allowedLevels.includes(upper as AllowedLevel)) {
    return upper as AllowedLevel;
  }
  return 'BACHELOR';
}

function levelLabel(level: AllowedLevel, locale: string): string {
  const labels: Record<AllowedLevel, { en: string; ru: string; tj: string }> = {
    SCHOOL: { en: 'School', ru: 'Школа', tj: 'Мактаб' },
    BACHELOR: { en: 'Bachelor', ru: 'Бакалавр', tj: 'Бакалавр' },
    MASTER: { en: 'Master', ru: 'Магистр', tj: 'Магистр' },
    PHD: { en: 'PhD', ru: 'PhD', tj: 'PhD' },
  };
  if (locale === 'ru') return labels[level].ru;
  if (locale === 'tj') return labels[level].tj;
  return labels[level].en;
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; level: string };
}): Promise<Metadata> {
  const normalizedLevel = normalizeLevel(params.level);
  const label = levelLabel(normalizedLevel, params.locale);
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://salamconsulting.com').replace(/\/+$/, '');
  const path = `/opportunities/level/${normalizedLevel.toLowerCase()}`;

  const title =
    params.locale === 'ru'
      ? `${label}: стипендии и программы | Salam Scholarships`
      : params.locale === 'tj'
      ? `${label}: стипендия ва барномаҳо | Salam Scholarships`
      : `${label} Scholarships and Programs | Salam Scholarships`;

  const description =
    params.locale === 'ru'
      ? `Найдите возможности уровня ${label}: стипендии, программы и международное обучение.`
      : params.locale === 'tj'
      ? `Имкониятҳои сатҳи ${label}-ро пайдо кунед: стипендия, барнома ва таҳсили байналмилалӣ.`
      : `Find ${label}-level opportunities: scholarships, programs, and global study paths.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.locale}${path}`,
      languages: {
        en: `/en${path}`,
        ru: `/ru${path}`,
        'tj-TJ': `/tj${path}`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/${params.locale}${path}`,
    },
  };
}

export default async function OpportunitiesByLevelPage({
  params,
}: {
  params: { locale: string; level: string };
}) {
  const normalizedLevel = normalizeLevel(params.level);
  const label = levelLabel(normalizedLevel, params.locale);
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name:
          params.locale === 'ru'
            ? `Какие стипендии доступны для уровня ${label}?`
            : params.locale === 'tj'
            ? `Кадом стипендияҳо барои сатҳи ${label} дастрасанд?`
            : `Which scholarships are available for ${label} level?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            params.locale === 'ru'
              ? 'На этой странице собраны релевантные программы по выбранному уровню обучения.'
              : params.locale === 'tj'
              ? 'Дар ин саҳифа барномаҳои мувофиқ барои сатҳи интихобшуда ҷамъ оварда шудаанд.'
              : 'This page aggregates relevant opportunities for the selected education level.',
        },
      },
      {
        '@type': 'Question',
        name:
          params.locale === 'ru'
            ? 'Как увеличить шанс поступления?'
            : params.locale === 'tj'
            ? 'Чӣ тавр эҳтимоли қабулро зиёд кунам?'
            : 'How can I improve admission chances?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            params.locale === 'ru'
              ? 'Подготовьте сильный CV, мотивационное письмо и следите за дедлайнами.'
              : params.locale === 'tj'
              ? 'CV, номаи ҳавасмандӣ ва идоракунии дурусти муҳлатҳоро мустаҳкам кунед.'
              : 'Strengthen your CV, motivation letter, and deadline planning.',
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
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-navy mb-4">
            {label} {params.locale === 'ru' ? 'возможности' : params.locale === 'tj' ? 'имкониятҳо' : 'Opportunities'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {params.locale === 'ru'
              ? 'Подборка международных программ и стипендий по уровню обучения'
              : params.locale === 'tj'
              ? 'Интихоби барномаҳои байналмилалӣ ва стипендияҳо аз рӯи сатҳи таҳсил'
              : 'Curated global scholarships and programs by education level'}
          </p>
        </div>
        <OpportunitiesListing initialLevel={normalizedLevel} categoryName={`${label} opportunities`} />
        <section className="mt-12 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-2xl font-heading font-bold text-navy mb-4">
            {params.locale === 'ru' ? 'FAQ' : params.locale === 'tj' ? 'Саволҳои маъмул' : 'FAQ'}
          </h2>
          <p className="text-gray-700">
            {params.locale === 'ru'
              ? 'Используйте фильтры по стране, финансированию и дедлайну, чтобы быстро найти подходящую программу.'
              : params.locale === 'tj'
              ? 'Барои зуд ёфтани барномаи мувофиқ филтрҳои кишвар, маблағгузорӣ ва муҳлатро истифода баред.'
              : 'Use country, funding, and deadline filters to quickly find the best-fit program.'}
          </p>
        </section>
      </div>
    </div>
  );
}
