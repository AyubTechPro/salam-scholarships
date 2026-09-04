import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ConsultingPageClient from '@/components/consulting/ConsultingPageClient';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata' });

  return {
    title: t('consulting.title'),
    description: t('consulting.description'),
    openGraph: {
      title: t('consulting.title'),
      description: t('consulting.description'),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('consulting.title'),
      description: t('consulting.description'),
    },
  };
}

export default async function ConsultingPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'consulting' });
  const tCommon = await getTranslations({ locale: params.locale, namespace: 'common' });

  // Pass icon names as strings instead of functions to avoid serialization error
  const benefits = [
    {
      icon: 'award',
      title: t('benefits.expertAnalysis.title'),
      description: t('benefits.expertAnalysis.description'),
    },
    {
      icon: 'users',
      title: t('benefits.personalized.title'),
      description: t('benefits.personalized.description'),
    },
    {
      icon: 'globe',
      title: t('benefits.global.title'),
      description: t('benefits.global.description'),
    },
    {
      icon: 'check-circle-2',
      title: t('benefits.success.title'),
      description: t('benefits.success.description'),
    },
  ];
  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-navy dark:to-navy-dark overflow-hidden">
      {/* Animated Mesh Gradients - Premium Silicon Valley Aesthetic */}
      <div className="absolute top-0 -left-[10%] w-[600px] h-[600px] bg-brand-gold/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob pointer-events-none"></div>
      <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-brand-navy/30 dark:bg-brand-navy/80 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-[20%] left-[20%] w-[600px] h-[600px] bg-brand-gold/10 rounded-full mix-blend-multiply filter blur-[128px] opacity-60 animate-blob pointer-events-none" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ConsultingPageClient benefits={benefits} />
      </div>
    </div>
  );
}

