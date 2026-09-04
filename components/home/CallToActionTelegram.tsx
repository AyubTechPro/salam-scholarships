'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight, Zap, Target } from 'lucide-react';
import UIDictionaryText from '@/components/common/UIDictionaryText';

export default function CallToActionTelegram() {
  const locale = useLocale();
  const telegramUsername = process.env.NEXT_PUBLIC_TELEGRAM_SUPPORT || 'ayub_it_tj';
  const telegramLink = `https://t.me/${telegramUsername}`;

  return (
    <section className="relative py-24 overflow-hidden bg-navy dark:bg-[#050b14]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-gold/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white mb-8 backdrop-blur-md shadow-xl"
        >
          <Zap className="w-5 h-5 text-brand-gold" />
          <span className="text-sm font-semibold tracking-wider uppercase">
            {locale === 'tj' ? 'Қадами навбатии шумо' : locale === 'ru' ? 'Ваш следующий шаг' : 'Your Next Step'}
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-7xl font-heading font-black text-white mb-8 tracking-tight drop-shadow-2xl leading-tight"
        >
          <UIDictionaryText 
            dictKey="cta.title" 
            fallback={
               locale === 'tj' ? 'Ояндаи худро имрӯз оғоз кунед' : 
               locale === 'ru' ? 'Начните свое будущее сегодня' : 
               'Start Your Future Today'
            }
          />
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 font-medium leading-relaxed"
        >
          <UIDictionaryText 
            dictKey="cta.subtitle" 
            fallback={
               locale === 'tj' ? 'Мо ба шумо дар интихоби донишгоҳ, супоридани ҳуҷҷатҳо ва гирифтани стипендия кӯмак мерасонем. Танҳо ба мо нависед!' : 
               locale === 'ru' ? 'Мы поможем вам с выбором университета, подачей документов и получением стипендии. Просто напишите нам!' : 
               'We will help you choose a university, submit documents, and get a scholarship. Just text us!'
            }
          />
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center space-x-3 bg-brand-gold text-navy font-bold text-xl px-10 py-5 rounded-[2rem] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,215,0,0.5)] w-full sm:w-auto"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-yellow-300 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <MessageCircle className="w-8 h-8 relative z-10 animate-bounce" />
            <span className="relative z-10 w-[2px] h-8 bg-navy/20 mx-2" />
            <span className="relative z-10">
               {locale === 'tj' ? 'Дарёфти Машварат' : locale === 'ru' ? 'Получить Консультацию' : 'Get Consultation'}
            </span>
            <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
          </a>
        </motion.div>
        
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ delay: 0.6 }}
           className="mt-10 flex items-center justify-center space-x-2 text-brand-gold/80 text-sm font-medium"
        >
           <Target className="w-4 h-4" />
           <span>
             {locale === 'tj' ? 'Ҷавоб дар давоми 15 дақиқа!' : locale === 'ru' ? 'Ответ в течение 15 минут!' : 'Response within 15 minutes!'}
           </span>
        </motion.div>
      </div>
    </section>
  );
}
