import { Metadata } from 'next';
import OpportunitiesListing from '@/components/opportunities/OpportunitiesListing';

export const revalidate = 3600;

function slugToCountry(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; country: string };
}): Promise<Metadata> {
  const country = slugToCountry(params.country);
  const title =
    params.locale === 'ru'
      ? `Стипендии в ${country} | Salam Scholarships`
      : params.locale === 'tj'
      ? `Стипендияҳо дар ${country} | Salam Scholarships`
      : `Scholarships in ${country} | Salam Scholarships`;
  const description =
    params.locale === 'ru'
      ? `Актуальные стипендии и гранты в ${country}.`
      : params.locale === 'tj'
      ? `Стипендия ва грантҳои фаъол дар ${country}.`
      : `Active scholarships and grants in ${country}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.locale}/scholarships-in/${params.country}`,
    },
  };
}

export default async function ScholarshipsInCountryPage({
  params,
}: {
  params: { locale: string; country: string };
}) {
  const country = slugToCountry(params.country);

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-navy mb-4">
            {params.locale === 'ru'
              ? `Стипендии в ${country}`
              : params.locale === 'tj'
              ? `Стипендияҳо дар ${country}`
              : `Scholarships in ${country}`}
          </h1>
        </div>
        <OpportunitiesListing
          initialCountry={country}
          initialCategory="SCHOLARSHIP"
          categoryName={country}
        />
      </div>
    </div>
  );
}
