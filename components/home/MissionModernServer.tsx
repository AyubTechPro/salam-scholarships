import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import MissionModernClient from './MissionModernClient';

type MissionValue = {
  title: string;
  titleRu?: string;
  titleTj?: string;
  description?: string;
  descriptionRu?: string;
  descriptionTj?: string;
  icon?: string;
};

type LandingContent = {
  missionTitle?: string | null;
  missionTitleRu?: string | null;
  missionTitleTj?: string | null;
  missionText?: string | null;
  missionTextRu?: string | null;
  missionTextTj?: string | null;
  missionImage?: string | null;
  missionValues?: MissionValue[] | null;
};

export default async function MissionModernServer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home.mission' });
  
  // Fetch content server-side
  let content: LandingContent | null = null;
  try {
    const landingContent = await prisma.landingContent.findUnique({
      where: { id: 'landing' },
      select: {
        missionTitle: true,
        missionTitleRu: true,
        missionTitleTj: true,
        missionText: true,
        missionTextRu: true,
        missionTextTj: true,
        missionImage: true,
        missionValues: true,
      },
    });
    if (landingContent) {
      content = {
        ...landingContent,
        missionValues: Array.isArray(landingContent.missionValues)
          ? (landingContent.missionValues as MissionValue[])
          : null,
      };
    }
  } catch (error) {
    // Silent error - use fallback translations
  }

  // Extract translated strings (don't pass function)
  const translations = {
    title: t('title'),
    text: t('text'),
    badge: t('badge'),
  };

  return <MissionModernClient content={content} locale={locale} translations={translations} />;
}

