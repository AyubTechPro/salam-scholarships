'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Sparkles, ShieldCheck, AreaChart, Clock, Send, CheckCircle2, Building2, User, Mail, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PartnersCTA() {
  const locale = useLocale() as 'tj' | 'ru' | 'en';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Split Layout Text Dictionary
  const text = {
    tj: {
      tag: 'ҚАДАМИ НАВБАТӢ',
      title: 'Шабакаи худро ба сатҳи ҷаҳонӣ бароред',
      subtitle: 'Ба шабакаи элитарии Salam Scholarships ҳамроҳ шавед ва бевосита ба беҳтарин истеъдодҳои Осиёи Марказӣ дастрасӣ пайдо кунед. Менеҷери инфиродии мо дар давоми 24 соат бо шумо тамос мегирад.',
      bullet1: 'Дастрасӣ ба 10,000+ донишҷӯёни тафтишшуда',
      bullet2: 'Дашборди шахсии аналитикӣ',
      bullet3: 'Менеҷери инфиродӣ 24/7',
      formTitle: 'Дархости Ҳамкорӣ',
      formOrg: 'Номи Муассиса / Донишгоҳ',
      formContact: 'Шахси Тамос',
      formEmail: 'Почтаи электронии расмӣ',
      formWebsite: 'Вебсайт',
      formGoals: 'Шумо кадом намуди номзадҳоро мекобед?',
      submitBtn: 'Фиристодани Дархост',
      successTitle: 'Дархост қабул шуд!',
      successText: 'Мо ба наздикӣ бо шумо тамос мегирем.',
    },
    ru: {
      tag: 'СЛЕДУЮЩИЙ ШАГ',
      title: 'Выведите свою сеть на мировой уровень',
      subtitle: 'Присоединяйтесь к элитной сети Salam Scholarships и получите прямой доступ к лучшим талантам Центральной Азии. Наш B2B-менеджер свяжется с вами в течение 24 часов.',
      bullet1: 'Доступ к 10,000+ проверенных кандидатов',
      bullet2: 'Персональный аналитический дашборд',
      bullet3: 'Персональный менеджер 24/7',
      formTitle: 'Заявка на партнерство',
      formOrg: 'Название Учреждения / Университета',
      formContact: 'Контактное лицо',
      formEmail: 'Официальный Email',
      formWebsite: 'Вебсайт',
      formGoals: 'Кого вы ищете? (Ваши цели)',
      submitBtn: 'Отправить Заявку',
      successTitle: 'Заявка принята!',
      successText: 'Наша команда свяжется с вами в течение 24 часов.',
    },
    en: {
      tag: 'NEXT STEP',
      title: 'Elevate Your Network to Global Standards',
      subtitle: 'Join the elite Salam Scholarships ecosystem and gain direct access to the top vetted talent in Central Asia. A dedicated representative will contact you within 24 hours.',
      bullet1: 'Direct access to 10,000+ pre-vetted candidates',
      bullet2: 'Personalized analytical dashboard',
      bullet3: 'Dedicated account manager 24/7',
      formTitle: 'Partnership Inquiry',
      formOrg: 'Organization/University Name',
      formContact: 'Contact Person',
      formEmail: 'Official Email',
      formWebsite: 'Website',
      formGoals: 'Partnership Goals',
      submitBtn: 'Submit Inquiry',
      successTitle: 'Inquiry Received!',
      successText: 'Our B2B team will contact you within 24 hours.',
    }
  }[locale];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const data = {
      organizationName: formData.get('organizationName'),
      contactName: formData.get('contactName'),
      email: formData.get('email'),
      website: formData.get('website'),
      message: formData.get('message'),
    };

    try {
      const resp = await fetch('/api/partners/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await resp.json();
      if (result.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(result.error || 'Something went wrong.');
      }
    } catch (error) {
      setErrorMessage('Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative py-24 bg-[#03060a] overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/40 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-gold/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column Text & Bullets */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col space-y-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold tracking-widest uppercase">{text.tag}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-white mb-6 leading-tight">
                {text.title}
              </h2>
              <p className="text-xl text-gray-400 font-sans leading-relaxed">
                {text.subtitle}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors shadow-sm">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-white font-medium text-lg">{text.bullet1}</div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors shadow-sm">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <AreaChart className="w-6 h-6" />
                </div>
                <div className="text-white font-medium text-lg">{text.bullet2}</div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors shadow-sm">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-white font-medium text-lg">{text.bullet3}</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-brand-gold rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative w-full bg-[#0a1120]/80 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl">
              
              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{text.formTitle}</h3>
                    <div className="w-12 h-1 bg-brand-gold rounded-full"></div>
                    {errorMessage && <p className="text-red-500 text-sm mt-3">{errorMessage}</p>}
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">{text.formOrg} *</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                          <input required name="organizationName" type="text" className="pl-10 w-full bg-white/5 border border-white/10 rounded-xl py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 transition-all" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">{text.formContact} *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                          <input required name="contactName" type="text" className="pl-10 w-full bg-white/5 border border-white/10 rounded-xl py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 transition-all" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">{text.formEmail} *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                          <input required name="email" type="email" className="pl-10 w-full bg-white/5 border border-white/10 rounded-xl py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 transition-all" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">{text.formWebsite}</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                          <input name="website" type="url" className="pl-10 w-full bg-white/5 border border-white/10 rounded-xl py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 transition-all" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 ml-1">{text.formGoals} *</label>
                      <textarea required name="message" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 transition-all resize-none"></textarea>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-base font-bold rounded-xl text-brand-navy bg-brand-gold hover:bg-yellow-400 focus:outline-none overflow-hidden transition-all disabled:opacity-70 mt-4 shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                      <div className="absolute inset-0 -translate-x-full bg-white/40 group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none mix-blend-overlay"></div>
                      <span className="flex items-center gap-2 relative z-10">
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            {text.submitBtn}
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-16 h-full">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">{text.successTitle}</h3>
                  <p className="text-gray-400 text-lg">{text.successText}</p>
                </motion.div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
