import Hero from '@/components/home/Hero';
import InfrastructureSection from '@/components/home/InfrastructureSection';
import TrustBar from '@/components/home/TrustBar';
import DeadlineCountdownTicker from '@/components/home/DeadlineCountdownTicker';
import HowItWorks from '@/components/home/HowItWorks';
import OpportunitiesSection from '@/components/home/OpportunitiesSection';
import CaseStudiesWall from '@/components/home/CaseStudiesWall';
import FAQSection from '@/components/home/FAQSection';
import CallToActionTelegram from '@/components/home/CallToActionTelegram';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata' });

  return {
    title: t('home.title'),
    description: t('home.description'),
    openGraph: {
      title: t('home.title'),
      description: t('home.description'),
      type: 'website',
      siteName: 'Salam Scholarships',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('home.title'),
      description: t('home.description'),
    },
  };
}

export default async function HomePage({ params }: { params: { locale: string } }) {
  // Fetch active success stories
  const dbStories = await prisma.successStory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" }
  });

  // Fetch active hero slides
  const heroSlides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    take: 1
  });

  const mainSlide = heroSlides.length > 0 ? heroSlides[0] : null;

  return (
    <div className="w-full">
      {/* Simplified Hero with Quick Search */}
      <Hero initialSlide={mainSlide} />

      {/* Infrastructure Process */}
      <InfrastructureSection />

      {/* Trust Bar (Stats) */}
      <TrustBar />

      {/* Hot Deadlines Countdown Ticker */}
      <DeadlineCountdownTicker />

      {/* How It Works (Telegram Funnel) */}
      <HowItWorks />

      {/* Opportunities Section */}
      <OpportunitiesSection />

      {/* Case Studies Wall (Success Stories) */}
      <CaseStudiesWall initialStories={dbStories} />

      {/* Global Lead Gen Telegram CTA */}
      <CallToActionTelegram />

      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
}

