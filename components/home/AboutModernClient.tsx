'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from '@/components/common/ImageWithFallback';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

type LandingContent = {
  aboutTitle?: string | null;
  aboutTitleRu?: string | null;
  aboutTitleTj?: string | null;
  aboutText?: string | null;
  aboutTextRu?: string | null;
  aboutTextTj?: string | null;
  aboutImage?: string | null;
};

interface AboutModernClientProps {
  content: LandingContent | null;
  locale: string;
  translations: {
    badge?: string;
    title: string;
    text: string;
  };
}

export default function AboutModernClient({ content, locale, translations }: AboutModernClientProps) {
  const tCommon = useTranslations('common');
  const [isExpanded, setIsExpanded] = useState(false);

  const title = content 
    ? ((locale === 'ru' && content.aboutTitleRu) || (locale === 'tj' && content.aboutTitleTj) || content.aboutTitle || translations.title)
    : translations.title;
  const fullText = content
    ? ((locale === 'ru' && content.aboutTextRu) || (locale === 'tj' && content.aboutTextTj) || content.aboutText || translations.text)
    : translations.text;
  const imageUrl = content?.aboutImage || null;
  const shortText = fullText && fullText.length > 200 ? fullText.substring(0, 200) + '...' : fullText;

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
          >
            {(imageUrl && !imageUrl.startsWith('/images/placeholder') && !imageUrl.includes('placeholder')) ? (
              <Image
                src={imageUrl}
                alt={locale === 'tj' ? 'Дар бораи Salam Scholarships' : locale === 'ru' ? 'О нас - Salam Scholarships' : 'About Salam Scholarships'}
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
            <div className="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-block bg-gold/10 border border-gold/20 text-gold px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
              {translations.badge || (locale === 'tj' ? 'Дар бораи мо' : locale === 'ru' ? 'О нас' : 'About Us')}
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-navy mb-6 tracking-tight">
              {title}
            </h2>
            <div className="space-y-4 text-lg text-gray-600 leading-relaxed font-sans">
              <p className="whitespace-pre-line">{isExpanded ? fullText : shortText}</p>
            </div>
            {fullText && fullText.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-2 text-brand-gold hover:text-brand-gold/80 font-heading font-semibold transition-colors group"
              >
                <span>{isExpanded ? tCommon('readLess') : tCommon('readMore')}</span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
                ) : (
                  <ChevronDown className="w-5 h-5 transition-transform group-hover:translate-y-1" />
                )}
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

