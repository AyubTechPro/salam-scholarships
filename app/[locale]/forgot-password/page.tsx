'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Logo from '@/components/common/Logo';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const t = useTranslations('common');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(locale === 'tj' ? 'Пайванд барои барқарор кардани гузарвожа ба почтаи шумо фиристода шуд.' : locale === 'ru' ? 'Ссылка для сброса пароля отправлена на вашу почту.' : 'Password reset link has been sent to your email.');
      } else {
        setStatus('error');
        setMessage(data.error || (locale === 'tj' ? 'Хатогӣ ба амал омад. Лутфан, бори дигар кӯшиш кунед.' : locale === 'ru' ? 'Произошла ошибка. Пожалуйста, попробуйте снова.' : 'An error occurred. Please try again.'));
      }
    } catch (err) {
      setStatus('error');
      setMessage(locale === 'tj' ? 'Хатогӣ ба амал омад. Лутфан, бори дигар кӯшиш кунед.' : locale === 'ru' ? 'Произошла ошибка. Пожалуйста, попробуйте снова.' : 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100"
      >
        <div>
          <div className="flex justify-center mb-4">
            <Logo size="lg" showTagline={true} className="text-navy" />
          </div>
          <h2 className="text-center text-3xl font-heading font-bold text-navy">
            {locale === 'tj' ? 'Фаромӯш кардед?' : locale === 'ru' ? 'Забыли пароль?' : 'Forgot Password?'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {locale === 'tj' ? 'Почтаи электронии худро ворид кунед ва мо ба шумо пайванди барқароркунӣ мефиристем.' : 
             locale === 'ru' ? 'Введите ваш email и мы отправим ссылку для сброса пароля.' : 
             'Enter your email and we will send you a reset link.'}
          </p>
        </div>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-4"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-green-800 font-medium">{message}</p>
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center text-sm font-semibold text-gold hover:text-gold-dark transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {locale === 'tj' ? 'Бозгашт ба Вуруд' : locale === 'ru' ? 'Вернуться ко Входу' : 'Back to Login'}
            </Link>
          </motion.div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                {message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-navy mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center items-center space-x-2 bg-gold text-white py-3 px-4 rounded-lg hover:bg-gold-dark transition-colors font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {status === 'loading' 
                  ? (locale === 'tj' ? 'Дар ҳоли фиристодан...' : locale === 'ru' ? 'Отправка...' : 'Sending...') 
                  : (locale === 'tj' ? 'Пайванд фиристед' : locale === 'ru' ? 'Отправить ссылку' : 'Send Reset Link')
                }
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="text-center">
              <Link
                href={`/${locale}/login`}
                className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-navy transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {locale === 'tj' ? 'Бозгашт ба вуруд' : locale === 'ru' ? 'Вернуться ко входу' : 'Back to sign in'}
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
