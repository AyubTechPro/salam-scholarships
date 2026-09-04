'use client';

import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw, Mail } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');
  const locale = useLocale();

  useEffect(() => {
    // Log error to monitoring service (e.g., Sentry)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-blue-900 to-navy flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-white mb-4">
            {locale === 'tj' ? 'Хато рӯй дод!' : 
             locale === 'ru' ? 'Произошла ошибка!' : 
             'Something went wrong!'}
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            {locale === 'tj' ? 'Мо аз ин нороҳатӣ узр мехӯҳем. Лутфан дубора кӯшиш кунед ё бо дастгирӣ тамос гиред.' :
             locale === 'ru' ? 'Произошла ошибка. Попробуйте снова или свяжитесь с поддержкой.' :
             'An unexpected error occurred. Please try again or contact support.'}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-left">
              <p className="text-sm text-red-300 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={reset}
            className="inline-flex items-center space-x-2 bg-gold text-navy px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors duration-300"
          >
            <RefreshCw className="w-5 h-5" />
            <span>{locale === 'tj' ? 'Дубора кӯшиш кардан' : locale === 'ru' ? 'Попробовать снова' : 'Try Again'}</span>
          </button>

          <Link
            href={`/${locale}`}
            className="inline-flex items-center space-x-2 bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors duration-300 border border-white/20"
          >
            <Home className="w-5 h-5" />
            <span>{locale === 'tj' ? 'Ба саҳифаи асосӣ' : locale === 'ru' ? 'На главную' : 'Go to Homepage'}</span>
          </Link>

          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center space-x-2 bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors duration-300 border border-white/20"
          >
            <Mail className="w-5 h-5" />
            <span>{locale === 'tj' ? 'Тамос бо дастгирӣ' : locale === 'ru' ? 'Связаться с поддержкой' : 'Contact Support'}</span>
          </Link>
        </div>

        <div className="mt-12 text-gray-400 text-sm">
          <p>{locale === 'tj' ? 'Агар ин мушкил идома ёбад, лутфан бо дастаи дастгирии мо бо маълумоти хато тамос гиред.' :
             locale === 'ru' ? 'Если эта проблема сохраняется, пожалуйста, свяжитесь с нашей службой поддержки с подробностями об ошибке.' :
             'If this problem persists, please contact our support team with the error details.'}</p>
          {error.digest && (
            <p className="mt-2 text-xs">Error ID: {error.digest}</p>
          )}
        </div>
      </div>
    </div>
  );
}

