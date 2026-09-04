import { useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Wrench, Globe, ArrowRight } from 'lucide-react';
import Logo from '@/components/common/Logo';

export default function MaintenancePage({ params }: { params: { locale: string } }) {
  const locale = params.locale || 'en';

  const messages = {
    en: {
      title: 'We\'ll be back soon!',
      message: 'We\'re currently performing scheduled maintenance. Please check back shortly.',
      submessage: 'If you need immediate assistance, please contact us via Telegram.',
    },
    ru: {
      title: 'Мы скоро вернемся!',
      message: 'В настоящее время мы выполняем плановое техническое обслуживание. Пожалуйста, проверьте позже.',
      submessage: 'Если вам нужна немедленная помощь, пожалуйста, свяжитесь с нами через Telegram.',
    },
    tj: {
      title: 'Мо ба зудӣ бармегардем!',
      message: 'Мо дар ҳоли таъмири барномавии банақшагирифта ҳастем. Лутфан, баъдтар бозгаштед.',
      submessage: 'Агар ба кӯмаки фаврӣ ниёз доред, лутфан бо мо тавассути Telegram тамос гиред.',
    },
  };

  const message = messages[locale as keyof typeof messages] || messages.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-navy/95 to-brand-navy flex items-center justify-center px-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center text-white">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-gold/20 mb-6">
            <Wrench className="w-12 h-12 text-brand-gold" />
          </div>
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
            {message.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-4">
            {message.message}
          </p>
          <p className="text-lg text-gray-300">
            {message.submessage}
          </p>
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-center space-x-4 text-gray-300">
            <Globe className="w-6 h-6" />
            <span className="text-lg">Salam Scholarships - Educational Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}
