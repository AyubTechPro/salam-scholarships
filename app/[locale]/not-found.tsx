'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Home, Mail, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const t = useTranslations('common');
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-blue-900 to-navy flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold text-gold mb-4">404</h1>
          <h2 className="text-4xl font-bold text-white mb-4">
            {t('notFound.title') || 'Page Not Found'}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {t('notFound.message') || 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center space-x-2 bg-gold text-navy px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors duration-300"
          >
            <Home className="w-5 h-5" />
            <span>{t('notFound.goHome') || 'Go to Homepage'}</span>
          </Link>

          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center space-x-2 bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors duration-300 border border-white/20"
          >
            <Mail className="w-5 h-5" />
            <span>{t('notFound.contactSupport') || 'Contact Support'}</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center space-x-2 bg-transparent text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-300 border border-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('notFound.goBack') || 'Go Back'}</span>
          </button>
        </div>

        <div className="mt-12 text-gray-400 text-sm">
          <p>{t('notFound.helpText') || 'If you believe this is an error, please contact our support team.'}</p>
        </div>
      </div>
    </div>
  );
}

