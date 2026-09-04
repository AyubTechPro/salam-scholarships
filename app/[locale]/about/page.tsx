import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LandingContentProvider } from '@/contexts/LandingContentContext';
import AboutModern from '@/components/home/AboutModern';
import MissionModern from '@/components/home/MissionModern';
import PathSectionServer from '@/components/home/PathSectionServer';
import CaseStudiesWall from '@/components/home/CaseStudiesWall';
import CommunityGallery from '@/components/home/CommunityGallery';
import TeamModernServer from '@/components/home/TeamModernServer';
import FounderRecognition from '@/components/home/FounderRecognition';
import CallToActionAbout from '@/components/home/CallToActionAbout';
import { Suspense } from 'react';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata' });

  return {
    title: t('about.title') || 'About Us - Salam Scholarships',
    description: t('about.description') || 'Learn about Salam Scholarships, Tajikistan\'s first educational consulting platform.',
  };
}

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <LandingContentProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-navy dark:to-navy-dark">
        <AboutModern />
        <MissionModern />
        <PathSectionServer locale={locale} />

        {/* Unified Achievements & Community Section */}
        <div id="achievements">
          <CaseStudiesWall />
          <CommunityGallery />
        </div>

        {/* Core Team Section */}
        <div id="team">
          <Suspense fallback={<div className="py-20 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-brand-gold border-t-transparent animate-spin" /></div>}>
            <TeamModernServer locale={locale} />
          </Suspense>
        </div>

        <FounderRecognition />
        <CallToActionAbout />
      </div>
    </LandingContentProvider>
  );
}

