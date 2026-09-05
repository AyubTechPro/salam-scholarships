'use client';

import { motion } from 'framer-motion';
import { Database, ShieldCheck, FileCheck2 } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function InfrastructureSection() {
  const locale = useLocale();

  const features = [
    {
      icon: <Database className="w-6 h-6 text-white" />,
      title: locale === 'tj' ? 'Пойгоҳи додаҳои тасдиқшуда' : locale === 'ru' ? 'Проверенная база данных' : 'Verified Database',
      description: locale === 'tj' 
        ? 'Тамоми стипендияҳо бевосита аз сарчашмаҳои расмӣ ва донишгоҳҳо гирифта шуда, пеш аз нашр аз санҷиши коршиносон мегузаранд.'
        : locale === 'ru'
        ? 'Все стипендии получены из официальных источников и проходят экспертную проверку перед публикацией.'
        : 'All scholarships are sourced directly from official university portals and undergo expert verification before publication.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
      title: locale === 'tj' ? 'Раванди идорашаванда' : locale === 'ru' ? 'Управляемый процесс' : 'Managed Process',
      description: locale === 'tj'
        ? 'Аз интихоби барнома то қабул — мо як инфрасохтори дақиқе сохтаем, ки хатогиҳои инсониро ҳангоми ҳуҷҷатсупорӣ ба сифр мерасонад.'
        : locale === 'ru'
        ? 'От выбора программы до зачисления — мы создали инфраструктуру, которая сводит человеческие ошибки при подаче к нулю.'
        : 'From program selection to admission — we have built an infrastructure that reduces human error in applications to zero.',
    },
    {
      icon: <FileCheck2 className="w-6 h-6 text-white" />,
      title: locale === 'tj' ? 'Назорати сифат' : locale === 'ru' ? 'Контроль качества' : 'Quality Assurance',
      description: locale === 'tj'
        ? 'Ҳар як дархости Premium аз ҷониби коршиносоне тафтиш мешавад, ки худ ин марҳилаҳоро гузаштаанд. Кафолати пурраи махфият ва стандартҳо.'
        : locale === 'ru'
        ? 'Каждая заявка Premium проверяется экспертами. Полная гарантия конфиденциальности и соблюдения стандартов.'
        : 'Every Premium application is reviewed by experts. Full guarantee of privacy and compliance with international academic standards.',
    }
  ];

  return (
    <section className="bg-[#020617] py-32 border-t border-white/5 relative overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-brand-navy/30 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-900/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-brand-gold/5 blur-[200px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Massive Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-6 tracking-tight">
              {locale === 'tj' ? 'Стандартҳои нави таҳсили байналмилалӣ' : locale === 'ru' ? 'Новые стандарты международного образования' : 'New Standards in International Education'}
            </h2>
            <p className="text-lg md:text-xl text-gray-400 font-medium">
              {locale === 'tj' ? 'Инфрасохтори ягонаи мо раванди дарёфти стипендияҳоро ба таври куллӣ тағйир медиҳад.' : locale === 'ru' ? 'Наша единая инфраструктура полностью меняет процесс получения стипендий.' : 'Our unified infrastructure completely changes the scholarship application process.'}
            </p>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: idx * 0.15, ease: "easeOut" }}
              className="group relative bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-3xl p-8 lg:p-10 transition-all duration-500 hover:bg-white/[0.04] hover:border-brand-gold/30 overflow-hidden"
            >
              {/* Card Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/0 to-brand-gold/0 group-hover:from-brand-gold/5 group-hover:to-transparent transition-all duration-500 opacity-0 group-hover:opacity-100" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 group-hover:border-brand-gold/50 transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-brand-gold transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-base leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
