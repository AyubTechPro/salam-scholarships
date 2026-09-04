'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Globe2, Sparkles } from 'lucide-react';

export default function PartnersValueGrid() {
  const locale = useLocale() as 'tj' | 'ru' | 'en';

  const content = {
    tj: {
      tag: 'Чаро бо мо?',
      title: 'Механизми Филтркунии Истеъдодҳо',
      subtitle: 'Мо донишҷӯёни тасодуфиро намефиристем. Ҳар як номзад тавассути системаи зеҳни сунъӣ санҷида шуда, таҳлили амиқ мегузарад.',
      features: [
        { icon: ShieldCheck, title: 'Талантҳои Санҷидашуда', desc: '1 фоизи беҳтарин номзадҳо бо баҳоҳои аъло ва мотиватсияи баланд интихоб карда мешаванд.' },
        { icon: Cpu, title: 'Платформаи Мукаммал', desc: 'Ҳама ҳуҷҷатҳо ва профили донишҷӯён ба таври рақамӣ дар системаи Salam Scholarships барои шумо дастрасанд.' },
        { icon: Globe2, title: 'Интегратсияи Фарҳангӣ', desc: 'Мо донишҷӯёнро на танҳо мефиристем, балки онҳоро барои мутобиқшавӣ ба фарҳанги донишгоҳи шумо омода мекунем.' }
      ]
    },
    ru: {
      tag: 'Почему мы?',
      title: 'Механизм Фильтрации Талантов',
      subtitle: 'Мы не отправляем случайных студентов. Каждый кандидат проходит строгий отбор и проверку через нашу интеллектуальную систему.',
      features: [
        { icon: ShieldCheck, title: 'Проверенные Таланты', desc: 'Мы отбираем только 1% лучших кандидатов с высокими оценками и сильной мотивацией.' },
        { icon: Cpu, title: 'Технологичная Платформа', desc: 'Все документы и профили студентов оцифрованы и доступны в экосистеме Salam Scholarships OS.' },
        { icon: Globe2, title: 'Культурная Адаптация', desc: 'Мы не просто отправляем студентов — мы готовим их к жизни в новой академической среде.' }
      ]
    },
    en: {
      tag: 'Why Us?',
      title: 'The Talent Filtration Engine',
      subtitle: 'We don’t send random applicants. Every candidate undergoes rigorous vetting and strategic filtering through our intelligent platform.',
      features: [
        { icon: ShieldCheck, title: 'Pre-Vetted Excellence', desc: 'We select the top 1% of highly motivated students with verified academic records.' },
        { icon: Cpu, title: 'Tech-Driven Pipeline', desc: 'All student portfolios and documents are digitized and accessible instantly through Salam Scholarships OS.' },
        { icon: Globe2, title: 'Cultural Bridging', desc: 'We prepare our students extensively to adapt and thrive in your specific university environment.' }
      ]
    }
  };

  const text = content[locale];

  return (
    <section className="py-32 bg-gray-50 dark:bg-navy-dark relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
             initial={{ opacity: 0, y: -10 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold mb-6 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold tracking-widest uppercase">{text.tag}</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-heading font-extrabold text-brand-navy dark:text-white mb-6 leading-tight"
          >
            {text.title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 font-sans"
          >
            {text.subtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {text.features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-[#0a1120] p-10 rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5 hover:shadow-2xl transition-all group"
            >
              <div className="w-16 h-16 bg-brand-gold/10 dark:bg-brand-gold/5 rounded-2xl flex items-center justify-center mb-8 border border-brand-gold/20 group-hover:scale-110 transition-transform">
                <feature.icon className="w-8 h-8 text-brand-gold" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-brand-navy dark:text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
