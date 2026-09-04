'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import Image from '@/components/common/ImageWithFallback';
import { Briefcase } from 'lucide-react';

const IMAGES = [
  { src: '/images/partners/IMG_5841.jpg', className: 'col-span-2 md:col-span-3 row-span-2 md:row-span-2' }, // Main highlight left
  { src: '/images/partners/IMG_68341.JPG', className: 'col-span-2 md:col-span-2 row-span-1 md:row-span-1' }, // Top wide right
  { src: '/images/partners/IMG_67221.JPG', className: 'col-span-1 md:col-span-1 row-span-1 md:row-span-1' }, // Top far right
  { src: '/images/partners/IMG_5847.jpg', className: 'col-span-1 md:col-span-1 row-span-1 md:row-span-1' }, // Bottom right small
  { src: '/images/partners/IMG_69801.JPG', className: 'col-span-2 md:col-span-2 row-span-1 md:row-span-1' }, // Bottom wide right
];

export default function PartnersGallery() {
  const locale = useLocale() as 'tj' | 'ru' | 'en';

  const translations = {
    tj: {
      tag: 'Шартномаҳои Расмӣ',
      title: 'Далели Эътимоди Глобалӣ',
      subtitle: 'Вохӯриҳо дар сатҳи роҳбарон, имзои шартномаҳои ҳамкорӣ ва таширифҳои расмӣ асоси фаъолияти мо мебошанд.'
    },
    ru: {
      tag: 'Официальные Соглашения',
      title: 'Доказательство Глобального Доверия',
      subtitle: 'Встречи на высшем уровне, подписание меморандумов и официальные визиты составляют основу нашей деятельности.'
    },
    en: {
      tag: 'Official Agreements',
      title: 'Proof of Global Trust',
      subtitle: 'Executive meetings, memorandum signings, and official delegation visits form the core of our operations.'
    }
  };

  const text = translations[locale];

  return (
    <section className="py-32 bg-white dark:bg-navy overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header content */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold mb-6"
          >
            <Briefcase className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-widest">{text.tag}</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-brand-navy dark:text-white mb-6 leading-tight"
          >
            {text.title}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-400 font-sans leading-relaxed"
          >
            {text.subtitle}
          </motion.p>
        </div>

        {/* Cinematic Masonry-style Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-6 grid-rows-5 md:grid-rows-2 gap-4 h-[1000px] md:h-[600px] lg:h-[700px]"
        >
          {IMAGES.map((img, index) => (
            <div key={index} className={`relative rounded-3xl overflow-hidden group border border-gray-100 dark:border-white/5 ${img.className}`}>
              <Image
                src={img.src}
                alt={`Official Partnership ${index + 1}`}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-brand-navy/10 group-hover:bg-transparent transition-colors duration-500" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
