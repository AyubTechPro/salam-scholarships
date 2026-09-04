import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const levels = ['school', 'bachelor', 'master', 'phd'] as const;

function toSlug(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default async function ExploreOpportunitiesPage({
  params,
}: {
  params: { locale: string };
}) {
  const [countries, categories] = await Promise.all([
    prisma.program.findMany({
      where: { isActive: true },
      select: { country: true },
      distinct: ['country'],
      take: 24,
      orderBy: { country: 'asc' },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, name: true, nameRu: true, nameTj: true },
      orderBy: { order: 'asc' },
      take: 12,
    }),
  ]);

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-navy mb-4">
            {params.locale === 'ru'
              ? 'Изучайте возможности'
              : params.locale === 'tj'
              ? 'Имкониятҳоро кашф кунед'
              : 'Explore Opportunities'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {params.locale === 'ru'
              ? 'Быстрые входы по странам, уровням и категориям'
              : params.locale === 'tj'
              ? 'Вурудҳои зуд аз рӯи кишвар, сатҳ ва категория'
              : 'Quick discovery paths by country, level, and category'}
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-heading font-bold text-navy">Countries</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {countries.map((item) => (
              <Link
                key={item.country}
                href={`/${params.locale}/opportunities/country/${toSlug(item.country)}`}
                className="px-4 py-3 rounded-lg bg-white border border-gray-200 hover:border-brand-gold hover:shadow-sm transition"
              >
                {item.country}
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-heading font-bold text-navy">Levels</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {levels.map((level) => (
              <Link
                key={level}
                href={`/${params.locale}/opportunities/level/${level}`}
                className="px-4 py-3 rounded-lg bg-white border border-gray-200 hover:border-brand-gold hover:shadow-sm transition capitalize"
              >
                {level}
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-heading font-bold text-navy">Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category) => {
              const label =
                params.locale === 'ru'
                  ? category.nameRu || category.name
                  : params.locale === 'tj'
                  ? category.nameTj || category.name
                  : category.name;
              return (
                <Link
                  key={category.slug}
                  href={`/${params.locale}/opportunities/category/${category.slug}`}
                  className="px-4 py-3 rounded-lg bg-white border border-gray-200 hover:border-brand-gold hover:shadow-sm transition"
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
