'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Compass, MessageCircle, Trophy } from 'lucide-react';
import UIDictionaryText from '@/components/common/UIDictionaryText';

const steps = [
  {
    icon: Compass,
    title: {
      tj: 'Имкониятро кашф кунед',
      ru: 'Изучите возможности',
      en: 'Discover Opportunities'
    },
    description: {
      tj: 'Аз рӯйхати беҳтарин стипендияҳо ва форумҳои ҷаҳонӣ барномаи ба шумо мувофиқро пайдо кунед.',
      ru: 'Найдите подходящую программу из нашего списка лучших мировых стипендий и форумов.',
      en: 'Find the right program from our curated list of top global scholarships and forums.'
    }
  },
  {
    icon: MessageCircle,
    title: {
      tj: 'Тавассути Telegram тамос гиред',
      ru: 'Свяжитесь через Telegram',
      en: 'Contact via Telegram'
    },
    description: {
      tj: 'Ба мушовирони коршиноси мо нависед, то имкониятҳои худро арзёбӣ кунед ва роҳнамоӣ гиред.',
      ru: 'Напишите нашим экспертам-консультантам, чтобы оценить свои шансы и получить рекомендации.',
      en: 'Message our expert consultants to evaluate your chances and get personalized guidance.'
    }
  },
  {
    icon: Trophy,
    title: {
      tj: 'Муваффақиятро ба даст оред',
      ru: 'Достигните успеха',
      en: 'Achieve Success'
    },
    description: {
      tj: 'Бо кӯмаки мо ҳуҷҷатҳоро омода кунед, хулосаи қавӣ нависед ва стипендияи худро ба даст оред.',
      ru: 'С нашей помощью подготовьте документы и получите желаемую стипендию.',
      en: 'With our help, prepare your documents and secure your dream scholarship.'
    }
  }
];

export default function HowItWorks() {
  const locale = useLocale() as 'tj' | 'ru' | 'en';

  return (
    <section className="py-24 bg-navy dark:bg-[#050b14] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
             initial={{ opacity: 0, y: -10 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-gold mb-6"
          >
             <span className="text-xs font-bold tracking-widest uppercase">
               {locale === 'tj' ? 'Раванди Кор' : locale === 'ru' ? 'Как это работает' : 'How It Works'}
             </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white mb-6"
          >
            <UIDictionaryText 
              dictKey="howitworks.title" 
              fallback={
                 locale === 'tj' ? 'Се қадами оддӣ то муваффақият' : 
                 locale === 'ru' ? 'Три простых шага к успеху' : 
                 'Three simple steps to success'
              }
            />
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            {locale === 'tj' ? 'Мо раванди дарёфти стипендияҳоро осон кардем. Танҳо ин қадамҳоро иҷро кунед.' : locale === 'ru' ? 'Мы упростили процесс получения стипендий. Просто следуйте этим шагам.' : 'We have simplified the process of getting scholarships. Just follow these steps.'}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent -translate-y-1/2 z-0" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                {/* Number Badge */}
                <div className="absolute -top-4 -right-2 md:top-0 md:right-4 font-heading font-black text-6xl lg:text-8xl text-white/5 opacity-50 group-hover:text-brand-gold/10 transition-colors pointer-events-none select-none">
                  0{index + 1}
                </div>

                {/* Icon Container */}
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 backdrop-blur-sm group-hover:bg-brand-gold/10 group-hover:border-brand-gold/30 transition-all duration-300 shadow-xl group-hover:shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                  <Icon className="w-10 h-10 text-brand-gold" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 font-heading">
                  {step.title[locale]}
                </h3>
                
                <p className="text-gray-400 leading-relaxed max-w-xs px-2 mx-auto">
                  {step.description[locale]}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
