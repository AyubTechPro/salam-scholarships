'use client';

import { motion } from 'framer-motion';
import Image from '@/components/common/ImageWithFallback';
import * as LucideIcons from 'lucide-react';
import { useTranslations } from 'next-intl';

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

const getIcon = (iconName?: string) => {
  if (!iconName) return LucideIcons.Target;
  const IconComponent = (LucideIcons as any)[iconName] as React.ComponentType<any>;
  if (IconComponent) return IconComponent;
  const iconMap: Record<string, any> = {
    'target': LucideIcons.Target,
    'lightbulb': LucideIcons.Lightbulb,
    'users': LucideIcons.Users,
    'globe': LucideIcons.Globe,
    'award': LucideIcons.Award,
    'heart': LucideIcons.Heart,
    'star': LucideIcons.Star,
  };
  return iconMap[iconName.toLowerCase()] || LucideIcons.Target;
};

const getDefaultValues = (locale: string): MissionValue[] => {
  return [
    { title: 'Mission', titleRu: 'Миссия', titleTj: 'Миссия', icon: 'Target' },
    { title: 'Vision', titleRu: 'Видение', titleTj: 'Дурнамо', icon: 'Lightbulb' },
    { title: 'Values', titleRu: 'Ценности', titleTj: 'Арзишҳо', icon: 'Users' },
    { title: 'Impact', titleRu: 'Влияние', titleTj: 'Таъсир', icon: 'Globe' },
  ];
};

interface MissionModernClientProps {
  content: LandingContent | null;
  locale: string;
  translations: {
    title: string;
    text: string;
    badge: string;
  };
}

export default function MissionModernClient({ content, locale, translations }: MissionModernClientProps) {
  const title = content
    ? ((locale === 'ru' && content.missionTitleRu) || (locale === 'tj' && content.missionTitleTj) || content.missionTitle || translations.title)
    : translations.title;
  const text = content
    ? ((locale === 'ru' && content.missionTextRu) || (locale === 'tj' && content.missionTextTj) || content.missionText || translations.text)
    : translations.text;
  const imageUrl = content?.missionImage || null;

  const missionValues: MissionValue[] = content?.missionValues && Array.isArray(content.missionValues) && content.missionValues.length > 0
    ? (content.missionValues as MissionValue[])
    : getDefaultValues(locale);

  const getLocalizedValue = (value: MissionValue) => {
    if (locale === 'ru' && value.titleRu) {
      return { title: value.titleRu, description: value.descriptionRu || value.description || '' };
    }
    if (locale === 'tj' && value.titleTj) {
      return { title: value.titleTj, description: value.descriptionTj || value.description || '' };
    }
    return { title: value.title, description: value.description || '' };
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #0a192f 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-gold/10 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-4">
            {translations.badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-navy mb-6">
            {title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl order-2 lg:order-1"
          >
            {imageUrl && !imageUrl.startsWith('/images/placeholder') && !imageUrl.includes('placeholder') ? (
              <Image
                src={imageUrl}
                alt={locale === 'tj' ? 'Миссияи мо' : locale === 'ru' ? 'Наша миссия' : 'Our Mission'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '';
                    parent.appendChild(document.createElement('div'));
                  }
                }}
              />
            ) : (
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000&auto=format&fit=crop"
                alt="Salam Scholarships Masterclass"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-navy/30 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 order-1 lg:order-2"
          >
            <p className="text-xl text-gray-700 leading-relaxed whitespace-pre-line">
              {text}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              {missionValues.map((value, index) => {
                const Icon = getIcon(value.icon);
                const localized = getLocalizedValue(value);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-gold/10 to-gold/5 p-6 rounded-xl border border-gold/20 hover:shadow-lg transition-all"
                  >
                    <Icon className="w-8 h-8 text-brand-gold mb-3" />
                    <h3 className="font-heading font-bold text-navy mb-2">
                      {localized.title}
                    </h3>
                    {localized.description && (
                      <p className="text-sm text-gray-600">
                        {localized.description}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

