import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import PathSectionClient from './PathSectionClient';

type PathContent = {
  pathTitle?: string | null;
  pathTitleRu?: string | null;
  pathTitleTj?: string | null;
  pathText1?: string | null;
  pathText1Ru?: string | null;
  pathText1Tj?: string | null;
  pathText2?: string | null;
  pathText2Ru?: string | null;
  pathText2Tj?: string | null;
  pathImage?: string | null;
};

export default async function PathSectionServer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home.path' });
  
  // Fetch content server-side
  let content: PathContent | null = null;
  try {
    const landingContent = await prisma.landingContent.findUnique({
      where: { id: 'landing' },
      select: {
        pathTitle: true,
        pathTitleRu: true,
        pathTitleTj: true,
        pathText1: true,
        pathText1Ru: true,
        pathText1Tj: true,
        pathText2: true,
        pathText2Ru: true,
        pathText2Tj: true,
        pathImage: true,
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
    title: t('title'),
    text1: t('text1'),
    text2: t('text2'),
  };

  return <PathSectionClient content={content} locale={locale} translations={translations} />;
}

