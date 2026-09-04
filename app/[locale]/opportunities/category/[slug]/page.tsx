import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

import OpportunitiesListing from '@/components/opportunities/OpportunitiesListing';
import { getCategorySlugFromUrl, isValidCategorySlug, getProgramCategoryFromSlug } from '@/lib/category-mapping';
import { getScopedTranslation } from '@/lib/scoped-translation';

export const revalidate = 3600;

export async function generateMetadata({ 
  params 
}: { 
  params: { locale: string; slug: string } 
}): Promise<Metadata> {
  const { locale, slug } = params;
  
  // Validate category slug
  if (!isValidCategorySlug(slug)) {
    const t = await getTranslations({ locale, namespace: 'metadata' });
    return {
      title: t('opportunities.title'),
      description: t('opportunities.description'),
    };
  }

  const categorySlug = getCategorySlugFromUrl(slug);
  if (!categorySlug) {
    const t = await getTranslations({ locale, namespace: 'metadata' });
    return {
      title: t('opportunities.title'),
      description: t('opportunities.description'),
    };
  }

  // Fetch category from database
  const categoryData = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: {
      name: true,
      nameRu: true,
      nameTj: true,
      description: true,
    },
  });

  if (!categoryData) {
    const t = await getTranslations({ locale, namespace: 'metadata' });
    return {
      title: t('opportunities.title'),
      description: t('opportunities.description'),
    };
  }

  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  // Get localized category name - try dictionary first, then fallback to DB
  const dictKey = `category.${categorySlug}`;
  let categoryName = await getScopedTranslation(dictKey, locale);
  
  // If dictionary doesn't have it, use DB value
  if (categoryName === dictKey) {
    categoryName = 
      locale === 'ru' && categoryData.nameRu ? categoryData.nameRu :
      locale === 'tj' && categoryData.nameTj ? categoryData.nameTj :
      categoryData.name;
  }

  return {
    title: `${categoryName} - ${t('opportunities.title')}`,
    description: categoryData.description || `${categoryName} - ${t('opportunities.description')}`,
    openGraph: {
      title: `${categoryName} - ${t('opportunities.title')}`,
      description: categoryData.description || `${categoryName} - ${t('opportunities.description')}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} - ${t('opportunities.title')}`,
      description: categoryData.description || `${categoryName} - ${t('opportunities.description')}`,
    },
  };
}

export default async function CategoryOpportunitiesPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const { locale, slug } = params;

  // Validate category slug - redirect if invalid
  if (!isValidCategorySlug(slug)) {
    redirect(`/${locale}/opportunities`);
  }

  const categorySlug = getCategorySlugFromUrl(slug);
  if (!categorySlug) {
    redirect(`/${locale}/opportunities`);
  }

  // Verify category exists in database
  const categoryData = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: {
      id: true,
      name: true,
      nameRu: true,
      nameTj: true,
      isActive: true,
    },
  });

  // Redirect if category doesn't exist or is inactive
  if (!categoryData || !categoryData.isActive) {
    redirect(`/${locale}/opportunities`);
  }

  // Get localized category name - try dictionary first, then fallback to DB
  const dictKey = `category.${categorySlug}`;
  let categoryName = await getScopedTranslation(dictKey, locale);
  
  // If dictionary doesn't have it, use DB value
  if (categoryName === dictKey) {
    categoryName = 
      locale === 'ru' && categoryData.nameRu ? categoryData.nameRu :
      locale === 'tj' && categoryData.nameTj ? categoryData.nameTj :
      categoryData.name;
  }

  // Get ProgramCategory enum value
  const programCategory = getProgramCategoryFromSlug(categorySlug);

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-navy mb-4">
            {categoryName}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {locale === 'tj'
              ? 'Имкониятҳои таълимии байналмилалӣ'
              : locale === 'ru'
              ? 'Международные образовательные возможности'
              : 'Global educational opportunities'}
          </p>
        </div>


        {/* Opportunities Listing with Pre-filled Category Filter */}
        <OpportunitiesListing 
          initialCategory={programCategory || undefined}
          categoryName={categoryName}
        />
      </div>
    </div>
  );
}

