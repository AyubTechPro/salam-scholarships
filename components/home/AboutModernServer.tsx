import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import AboutModernClient from './AboutModernClient';

type LandingContent = {
  aboutTitle?: string | null;
  aboutTitleRu?: string | null;
  aboutTitleTj?: string | null;
  aboutText?: string | null;
  aboutTextRu?: string | null;
  aboutTextTj?: string | null;
  aboutImage?: string | null;
};

export default async function AboutModernServer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home.about' });
  
  // Fetch content server-side
  let content: LandingContent | null = null;
  try {
    const landingContent = await prisma.landingContent.findUnique({
      where: { id: 'landing' },
      select: {
        aboutTitle: true,
        aboutTitleRu: true,
        aboutTitleTj: true,
        aboutText: true,
        aboutTextRu: true,
        aboutTextTj: true,
        aboutImage: true,
      },
    });
    if (landingContent) {
      content = landingContent;
    }
  } catch (error) {
    // Silent error - use fallback translations
  }

  // Extract translated strings (don't pass function)
  const translations = {
    badge: t('badge'),
    title: t('title'),
    text: t('text'),
  };

  return <AboutModernClient content={content} locale={locale} translations={translations} />;
}

