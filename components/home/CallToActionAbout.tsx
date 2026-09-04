'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Globe2, Sparkles, Zap, GraduationCap } from 'lucide-react';
import GlobeBackground from './GlobeBackground';

export default function CallToActionAbout() {
  const locale = useLocale() as 'tj' | 'ru' | 'en';

  const content = {
    tj: {
      badge: 'Қадами Навбатӣ',
      title: 'Ҷаҳон мунтазири шумост.',
      subtitle: 'Навбати шумо.',
      desc: 'Аз як орзу то донишгоҳҳои Top-100-и ҷаҳон танҳо як қадам мондааст. Ба шабакаи 2,000+ донишҷӯёни байналмилалии мо пайваст шавед ва таърихи худро бисозед.',
      btn: 'Оғози Сафар',
      secondary: 'Машварати стратегии ройгон'
    },
    ru: {
      badge: 'Следующий Шаг',
      title: 'Мир ждет вас.',
      subtitle: 'Ваш ход.',
      desc: 'От мечты до поступления в Top-100 университетов мира — всего один шаг. Присоединяйтесь к сети из 2,000+ наших международных студентов и напишите свою историю.',
      btn: 'Начать Путь',
      secondary: 'Бесплатная стратегическая сессия'
    },
    en: {
      badge: 'The Next Step',
      title: 'The world is waiting.',
      subtitle: 'Your move.',
      desc: 'From a single dream to the Top-100 universities globally — it takes one strategic step. Join our network of 2,000+ international students and engineer your success.',
      btn: 'Start Your Journey',
      secondary: 'Free strategic consultation'
    }
  };

  const text = content[locale];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-white dark:bg-navy-dark">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-100 via-white to-white dark:from-navy-light dark:via-navy-dark dark:to-navy-dark opacity-50 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Cinematic Monolith Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-[3rem] p-[1px] overflow-hidden group"
        >
          {/* Animated 3D Border Aura */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/40 via-blue-500/40 to-brand-gold/40 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(255,215,0,0.8)_360deg)] animate-[spin_4s_linear_infinite] opacity-20" />
          
          {/* Main Card Content */}
          <div className="relative bg-[#050b14] rounded-[3rem] px-8 py-20 lg:p-24 overflow-hidden flex flex-col items-center text-center shadow-2xl">
            
            {/* Embedded 3D Globe Background */}
            <div className="absolute inset-0 z-0 mix-blend-screen opacity-60">
              <GlobeBackground />
            </div>

            {/* Internal Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-blue-600/30 blur-[120px] rounded-full pointer-events-none z-0" />
            <div className="absolute bottom-0 right-[-10%] w-[50%] h-[50%] bg-brand-gold/20 blur-[100px] rounded-full pointer-events-none z-0" />
            
            {/* The stationary background globe icon (subtle) */}
            <div className="absolute top-10 left-10 text-white/5 animate-pulse-slow z-0">
              <Globe2 className="w-40 h-40" />
            </div>
            {/* The stationary cap icon */}
            <div className="absolute bottom-10 right-10 text-brand-gold/5 animate-bounce-slow z-0">
              <GraduationCap className="w-48 h-48" />
            </div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8 shadow-xl"
            >
              <Zap className="w-4 h-4 text-brand-gold fill-brand-gold" />
              <span className="text-sm font-bold tracking-widest uppercase text-white">{text.badge}</span>
            </motion.div>

            {/* Massive Typography */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="max-w-4xl mx-auto relative z-10"
            >
              <h2 className="text-5xl md:text-7xl font-heading font-black text-white mb-2 tracking-tight">
                {text.title}
              </h2>
              <h3 className="text-5xl md:text-7xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-200 to-brand-gold mb-8 italic drop-shadow-lg">
                {text.subtitle}
              </h3>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed font-sans max-w-3xl mx-auto">
                {text.desc}
              </p>
            </motion.div>

            {/* Interactive Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center gap-6 relative z-10"
            >
              {/* Correct route: /tj/consulting */}
              <Link 
                href={`/${locale}/consulting`} 
                className="group relative inline-flex items-center justify-center gap-4 bg-brand-gold text-navy px-10 py-5 rounded-full font-black text-xl md:text-2xl uppercase tracking-wider overflow-hidden transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,215,0,0.4)]"
              >
                {/* Button Shine Effect */}
                <div className="absolute inset-0 -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                
                <span className="relative z-10">{text.btn}</span>
                <div className="bg-navy rounded-full p-2 group-hover:rotate-45 transition-transform duration-300 relative z-10">
                  <ArrowRight className="w-6 h-6 text-brand-gold" />
                </div>
              </Link>
              
              <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                <Sparkles className="w-4 h-4 text-brand-gold" />
                {text.secondary}
              </div>
            </motion.div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
