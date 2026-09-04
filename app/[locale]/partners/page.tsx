import { Metadata } from 'next';
import PartnersHero from '@/components/partner/PartnersHero';
import PartnersTrustTicker from '@/components/partner/PartnersTrustTicker';
import PartnersValueGrid from '@/components/partner/PartnersValueGrid';
import PartnersGallery from '@/components/partner/PartnersGallery';
import PartnersCTA from '@/components/partner/PartnersCTA';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Partner with Salam Scholarships | Global B2B EdTech Framework',
    description: 'Join the Salam Scholarships network to recruit top-tier Central Asian students across the globe. Access a unified B2B dashboard for student applications.',
  };
}

export default function PartnersLandingPage() {
  return (
    <div className="w-full relative overflow-hidden bg-white dark:bg-navy-dark">
      <PartnersHero />
      <PartnersTrustTicker />
      <PartnersValueGrid />
      <PartnersGallery />
      <PartnersCTA />
    </div>
  );
}
