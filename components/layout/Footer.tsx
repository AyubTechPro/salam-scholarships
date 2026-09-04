'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Globe, Mail, Linkedin, Instagram, MessageCircle, Phone, CheckCircle2, ShieldCheck } from 'lucide-react';
import Logo from '@/components/common/Logo';
import UIDictionaryText from '@/components/common/UIDictionaryText';
import { useState } from 'react';
import FooterLinks, { FooterLegalLinks } from './FooterLinks';
import { useGlobalContent } from '@/components/providers/GlobalContentProvider';

export default function Footer() {
  const t = useTranslations('common');
  const locale = useLocale();
  const { siteSettings, getSiteSetting } = useGlobalContent();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterLoading(true);
    setNewsletterError(null);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsletterEmail,
          locale,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewsletterSuccess(true);
        setNewsletterEmail('');
        setTimeout(() => setNewsletterSuccess(false), 5000);
      } else {
        const errorMessage = data.error === 'Email already subscribed' 
          ? (locale === 'tj' ? 'Ин почта аллакай обуна карда шудааст' : locale === 'ru' ? 'Этот email уже подписан' : 'Email already subscribed')
          : (locale === 'tj' ? 'Обуна карда нашуд' : locale === 'ru' ? 'Не удалось подписаться' : 'Failed to subscribe');
        setNewsletterError(errorMessage);
      }
    } catch (error) {
      setNewsletterError(locale === 'tj' ? 'Хатогӣ ба амал омад. Лутфан, бори дигар кӯшиш кунед.' : locale === 'ru' ? 'Произошла ошибка. Пожалуйста, попробуйте снова.' : 'An error occurred. Please try again.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <footer className="relative bg-[#050B14] text-white overflow-hidden mt-auto border-t border-white/5">
      {/* Decorative Top Glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent opacity-50" />
      

      {/* 2. MAIN FOOTER GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Brand Info & Social (Takes up 5 columns on desktop) */}
          <div className="col-span-1 md:col-span-12 lg:col-span-5 pr-0 lg:pr-12">
            <div className="mb-8">
              <Logo size="lg" showTagline={false} variant="dark" />
            </div>
            
            <p className="text-white/60 mb-8 max-w-md font-sans text-base leading-relaxed">
              {locale === 'tj' 
                ? 'Мо ба донишҷӯёни боистеъдод аз тамоми ҷаҳон кӯмак мекунем, то беҳтарин имкониятҳои таълимӣ, стипендияҳо ва барномаҳои рушди касбиро дар саросари ҷаҳон пайдо кунанд.'
                : locale === 'ru'
                ? 'Объединяем амбициозных студентов со всего мира с элитными образовательными возможностями, стипендиями и программами профессионального развития.'
                : 'Connecting ambitious students worldwide with elite educational opportunities, scholarships, and professional development programs across the globe.'
              }
            </p>
            
            <div className="flex space-x-4">
              <a href={getSiteSetting('linkedinUrl') || "https://www.linkedin.com/company/salamconsulting"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-brand-navy hover:bg-brand-gold hover:border-brand-gold transition-all duration-300" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href={getSiteSetting('instagramUrl') || "https://www.instagram.com/salamconsultingtj"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-brand-navy hover:bg-brand-gold hover:border-brand-gold transition-all duration-300" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={getSiteSetting('telegramChannelUrl') || "https://t.me/salamconsulting"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-brand-navy hover:bg-brand-gold hover:border-brand-gold transition-all duration-300" aria-label="Telegram">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href={getSiteSetting('whatsappUrl') || "https://wa.me/message/WLICN6BZQ7QEL1"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-brand-navy hover:bg-brand-gold hover:border-brand-gold transition-all duration-300" aria-label="WhatsApp">
                <Phone className="w-4 h-4" />
              </a>
              <a href={`mailto:${getSiteSetting('footerEmail') || getSiteSetting('contactEmail') || "salamconsultingtj@gmail.com"}`} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-brand-navy hover:bg-brand-gold hover:border-brand-gold transition-all duration-300" aria-label="Email">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links Grid (Takes up 7 columns) */}
          <div className="col-span-1 md:col-span-12 lg:col-span-7">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
              <FooterLinks locale={locale} />
              
              {/* Extra Column for Global Focus / Support Contact */}
              <div className="col-span-2 md:col-span-1 mt-8 md:mt-0">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-gold/10 to-transparent border border-brand-gold/20 relative overflow-hidden group hover:border-brand-gold/40 transition-all duration-300">
                  <div className="absolute -right-6 -top-6 text-brand-gold/10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                     <Globe className="w-40 h-40" />
                  </div>
                  <h3 className="font-semibold text-brand-gold mb-3 uppercase tracking-wider text-sm relative z-10">
                    {locale === 'tj' ? 'Ба кӯмак ниёз доред?' : locale === 'ru' ? 'Нужна помощь?' : 'Need Help?'}
                  </h3>
                  <div className="space-y-4 text-sm text-white/70 relative z-10">
                    <p className="leading-relaxed">
                      {locale === 'tj' 
                        ? 'Машварати ройгон гиред ва роҳи худро барои таҳсил дар хориҷа пайдо кунед.' 
                        : locale === 'ru' 
                        ? 'Получите бесплатную консультацию и найдите свой путь к учебе за рубежом.' 
                        : 'Get a free consultation and find your perfect path to studying abroad.'}
                    </p>
                    <Link href={`/${locale}/consulting`} className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-white/10 hover:bg-brand-gold hover:text-brand-navy border border-white/10 hover:border-brand-gold rounded-lg font-medium transition-all duration-300">
                      {locale === 'tj' ? 'Машварат гиред' : locale === 'ru' ? 'Получить консультацию' : 'Get Consultation'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. LEGAL BOTTOM BAR */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4">
            <div className="text-white/40 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>&copy; {new Date().getFullYear()} Salam Scholarships. <UIDictionaryText dictKey="footer.copyright" fallback="All rights reserved." /></span>
              
              {/* Discrete Admin/Staff Entry Point */}
              <span className="mx-2 opacity-30">|</span>
              <Link href={`/${locale}/login`} className="hover:text-brand-gold transition-colors flex items-center gap-1 opacity-50 hover:opacity-100" title="Staff Portal">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Portal</span>
              </Link>
            </div>
            
            <FooterLegalLinks locale={locale} />
          </div>
        </div>
      </div>
    </footer>
  );
}
