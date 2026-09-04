'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Network, Building2 } from 'lucide-react';
import Image from '@/components/common/ImageWithFallback';

export default function PartnersHero() {
  const locale = useLocale() as 'tj' | 'ru' | 'en';

  const content = {
    tj: {
      badge: 'Шабакаи B2B Донишгоҳҳо',
      title: 'Экосистемаи Глобалии Таълимӣ',
      subtitle: 'Мо бо муассисаҳои таълимӣ, ташкилотҳо ва шарикон фаъолона ҳамкорӣ мекунем, то дастрасии донишҷӯёнро ба имкониятҳои байналмилалӣ тавсеа диҳем.',
      btn: 'Оғози Ҳамкорӣ'
    },
    ru: {
      badge: 'B2B Сеть Университетов',
      title: 'Глобальная Экосистема Образования',
      subtitle: 'Мы активно сотрудничаем с образовательными учреждениями, организациями и партнёрами, чтобы расширять доступ студентов к международным возможностям.',
      btn: 'Стать Партнером'
    },
    en: {
      badge: 'B2B University Network',
      title: 'Global Educational Ecosystems',
      subtitle: 'We actively collaborate with educational institutions, organizations, and partners to expand access to international opportunities for students.',
      btn: 'Partner With Us'
    }
  };

  const text = content[locale];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-32 overflow-hidden bg-[#050b14]">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/about/IMG_6050.JPG" 
          alt="Partnership Background" 
          fill 
          className="object-cover opacity-20"
        />
        {/* Navy to Transparent Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050b14] via-[#050b14]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050b14] via-transparent to-transparent" />
        {/* Glows */}
        <div className="absolute top-1/4 right-1/4 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-brand-gold/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[30vw] bg-blue-900/20 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
        
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white backdrop-blur-md mb-8"
        >
          <Network className="w-4 h-4 text-brand-gold" />
          <span className="text-sm font-bold tracking-widest uppercase">{text.badge}</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-heading font-black text-white mb-8 leading-[1.1] tracking-tight max-w-5xl drop-shadow-2xl"
        >
          {text.title}
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl leading-relaxed"
        >
          {text.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <button
            onClick={() => document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative inline-flex items-center gap-3 bg-brand-gold text-brand-navy px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            {/* Inner Shine */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12" />
            
            <Building2 className="w-6 h-6" />
            <span className="relative z-10">{text.btn}</span>
          </button>
        </motion.div>

      </div>
    </section>
  );
}
