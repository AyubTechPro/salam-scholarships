'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import CallToActionTelegram from '@/components/home/CallToActionTelegram';

type SiteSettings = {
  contactEmail: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  officeAddress: string | null;
  officeAddressRu: string | null;
  officeAddressTj: string | null;
  whatsappUrl: string | null;
  telegramSupportUsername: string | null;
};

export default function ContactPage() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setSettings(result.data);
        }
      })
      .catch(err => console.error('Error fetching site settings:', err));
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-brand-gold/10 text-brand-gold px-6 py-2 rounded-full text-base font-bold mb-6 tracking-wide shadow-sm">
            {t('header.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-brand-navy mb-6 leading-tight">
            Ризоияти шумо — <br/><span className="text-brand-gold">Ҳадафи мо!</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-4 font-light">
            Мо барои пур кардани формаҳои дилгиркунанда вақти шуморо сарф намекунем. Танҳо ба Telegram-и мо нависед ва мутахассиси мо фавран бо шумо пайваст мешавад!
          </p>
        </motion.div>

        {/* Telegram High-Conversion Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-20 transform hover:scale-[1.01] transition-transform duration-300"
        >
          <CallToActionTelegram />
        </motion.div>

        {/* Advanced Info Cards (Only Email left) */}
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group bg-white rounded-3xl shadow-lg p-8 border border-gray-100 flex flex-col items-center text-center hover:shadow-2xl hover:border-brand-gold/30 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-blue-50 group-hover:bg-brand-gold/10 group-hover:scale-110 transition-all duration-300 rounded-3xl flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-blue-600 group-hover:text-brand-gold transition-colors" />
            </div>
            <h3 className="font-bold text-brand-navy text-xl mb-2">{t('info.email.label')}</h3>
            <a 
              href="mailto:salamconsultingtj@gmail.com" 
              className="text-gray-600 hover:text-brand-gold transition-colors text-xl font-bold font-sans tracking-wide"
            >
              salamconsultingtj@gmail.com
            </a>
            <p className="mt-4 text-sm text-gray-500">
              Барои ҳамкориҳои расмӣ ва саволҳои тиҷоратӣ
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
