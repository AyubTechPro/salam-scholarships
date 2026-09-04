'use client';

import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import PremiumConsultingForm from './PremiumConsultingForm';
import { Award, Users, Globe, CheckCircle2, Loader2 } from 'lucide-react';

type Benefit = {
  icon: string; // Changed from function to string
  title: string;
  description: string;
};

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'award': Award,
  'users': Users,
  'globe': Globe,
  'check-circle-2': CheckCircle2,
};

export default function ConsultingPageClient({ benefits }: { benefits: Benefit[] }) {
  const t = useTranslations('consulting');
  const tCommon = useTranslations('common');

  return (
    <>
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-block bg-brand-gold/10 text-brand-gold px-4 py-2 rounded-full text-sm font-semibold mb-4">
          {t('badge')}
        </div>
        <h1 className="text-4xl md:text-6xl font-heading font-bold text-brand-navy mb-6">
          {t('title')}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-brand-gold" /></div>}>
            <PremiumConsultingForm />
          </Suspense>
        </div>

        {/* Benefits Sidebar */}
        <div className="space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-navy to-[#020c1b] rounded-3xl p-8 text-white shadow-2xl border border-white/10">
            {/* Premium Noise Overlay */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-heading font-bold mb-6">{t('benefits.title')}</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => {
                  const IconComponent = iconMap[benefit.icon] || Award;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-brand-gold/20 rounded-xl flex items-center justify-center border border-white/5 backdrop-blur-sm">
                        <IconComponent className="w-5 h-5 text-brand-gold" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{benefit.title}</h3>
                        <p className="text-sm text-gray-300">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 border border-white/50">
            <h3 className="font-heading font-bold text-brand-navy mb-4">{t('responseTime.title')}</h3>
            <p className="text-gray-600 text-sm mb-4">
              {t('responseTime.description')}
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>✓ {t('responseTime.feature1')}</p>
              <p>✓ {t('responseTime.feature2')}</p>
              <p>✓ {t('responseTime.feature3')}</p>
              <p>✓ {t('responseTime.feature4')}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

