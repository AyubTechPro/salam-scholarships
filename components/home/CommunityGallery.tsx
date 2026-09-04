'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Users } from 'lucide-react';

const IMAGES = [
  { src: '/images/about/IMG_6050.JPG', className: 'col-span-2 md:col-span-3 row-span-2 md:row-span-2' }, // Main highlight left
  { src: '/images/about/IMG_6333.JPG', className: 'col-span-2 md:col-span-2 row-span-1 md:row-span-1' }, // Top wide right (New KNU)
  { src: '/images/about/IMG_6340.JPG', className: 'col-span-1 md:col-span-1 row-span-1 md:row-span-1' }, // Top far right
  { src: '/images/about/IMG_6337.JPG', className: 'col-span-1 md:col-span-1 row-span-1 md:row-span-1' }, // Bottom right small
  { src: '/images/about/IMG_4392.JPG', className: 'col-span-2 md:col-span-2 row-span-1 md:row-span-1' }, // Bottom wide right
];

export default function CommunityGallery() {
  const locale = useLocale() as 'tj' | 'ru' | 'en';

  const translations = {
    tj: {
      tag: 'Ҷомеаи Глобалӣ',
      title: 'Шабакаи Байналмилалии Истеъдодҳои Ояндасоз',
      subtitle: 'Salam Scholarships танҳо як платформаи рақамӣ нест; ин як шабакаи бузурги ҷаҳонист, ки дар он пешсафони оянда ба ҳам пайваста, имкониятҳои беназирро ба даст меоранд.'
    },
    ru: {
      tag: 'Глобальное Сообщество',
      title: 'Международная Сеть Будущих Лидеров',
      subtitle: 'Salam Scholarships — это не просто цифровая платформа; это масштабная мировая сеть, где будущие лидеры объединяются для покорения новых высот.'
    },
    en: {
      tag: 'Global Community',
      title: 'An International Network of Future Leaders',
      subtitle: 'Salam Scholarships is not just a digital platform; it is a massive global network where future leaders unite to secure unique opportunities.'
    }
  };

  const text = translations[locale];

  return (
    <section className="py-24 bg-gradient-to-b from-[#04080e] to-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header content */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold mb-6"
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-widest">{text.tag}</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-heading font-extrabold text-white mb-6 leading-tight"
          >
            {text.title}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 font-sans leading-relaxed"
          >
            {text.subtitle}
          </motion.p>
        </div>

        {/* Masonry-style Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-6 grid-rows-5 md:grid-rows-2 gap-4 h-[1000px] md:h-[600px] lg:h-[700px]"
        >
          {IMAGES.map((img, index) => (
            <div key={index} className={`relative rounded-3xl overflow-hidden group ${img.className}`}>
              <Image
                src={img.src}
                alt={`Salam Event ${index + 1}`}
                fill
                unoptimized
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
