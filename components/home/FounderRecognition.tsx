'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Award, Globe, Quote } from 'lucide-react';

export default function FounderRecognition() {
  const locale = useLocale();

  const title = locale === 'tj' ? 'Бунёдгузор ва Дастовардҳои Ҷаҳонӣ' : locale === 'ru' ? 'Основатель и глобальные достижения' : 'Founder & Global Recognition';

  const founderText = locale === 'tj'
    ? 'Абдураҳмонбек Ахмедов, муассиси Salam Scholarships, дар Мактаби Тобистонаи Satyarthi 2025 дар Ню-Делии Ҳиндустон, ки аз ҷониби Ҷунбиши Satyarthi Movement for Global Compassion (таъсисёфта аз тарафи барандаи Ҷоизаи Сулҳи Нобел Кайлаш Сатярти) созмон ёфта буд, иштирок намуд. Ӯ Тоҷикистонро дар саҳнаи байналмилалӣ муаррифӣ карда, бо пешвоёни ҷаҳонӣ дар соҳаи таъсири иҷтимоӣ ва роҳбарӣ ҳамкорӣ намуд.'
    : locale === 'ru'
      ? 'Абдурахмонбек Ахмедов, основатель Salam Scholarships, принял участие в Satyarthi Summer School 2025 в Нью-Дели, Индия, организованной движением Satyarthi Movement for Global Compassion, основанным лауреатом Нобелевской премии мира Kailash Satyarthi, представляя Таджикистан на международной арене и взаимодействуя с мировыми лидерами в области социального воздействия и лидерства.'
      : 'Abdurahmonbek Akhmedov, Founder of Salam Scholarships, participated in the Satyarthi Summer School 2025 in New Delhi, India, organized by the Satyarthi Movement for Global Compassion, founded by Nobel Peace Laureate Kailash Satyarthi, representing Tajikistan on an international stage and engaging with global leaders in social impact and leadership.';

  return (
    <section className="py-32 bg-white dark:bg-[#060b14] relative overflow-hidden">

      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-gold/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 text-brand-gold mb-6"
          >
            <Award className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-wider uppercase">Global Leadership</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-heading font-extrabold text-navy dark:text-white mb-6"
          >
            {title}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl">
              <Image
                src="/images/about/IMG_6634.PNG"
                alt="Founder Recognition"
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-white dark:bg-navy p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 hidden md:block">
              <div className="flex items-center gap-4">
                <Globe className="w-10 h-10 text-brand-gold" />
                <div>
                  <p className="font-bold text-navy dark:text-white text-lg">Satyarthi Summer School</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">New Delhi, India 2025</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7 lg:pl-8"
          >
            <Quote className="w-16 h-16 text-brand-gold/20 mb-8" />
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed font-sans font-medium mb-12">
              &quot;{founderText}&quot;
            </p>

            <div className="flex items-center gap-6">
              <div className="w-16 h-[2px] bg-brand-gold" />
              <div>
                <h4 className="text-2xl font-bold font-heading text-navy dark:text-white">Abdurahmonbek Akhmedov</h4>
                <p className="text-brand-gold font-bold uppercase tracking-wider text-sm mt-1">Founder & CEO</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

