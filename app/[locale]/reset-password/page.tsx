'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Logo from '@/components/common/Logo';
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

function ResetPasswordForm() {
  const t = useTranslations('common');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(locale === 'tj' ? 'Пайванди нодуруст ё муҳлаташ гузашта.' : locale === 'ru' ? 'Недействительная или устаревшая ссылка.' : 'Invalid or expired token.');
    }
  }, [token, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage(locale === 'tj' ? 'Гузарвожаҳо мувофиқат намекунанд.' : locale === 'ru' ? 'Пароли не совпадают.' : 'Passwords do not match.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(locale === 'tj' ? 'Гузарвожа бо муваффақият иваз карда шуд!' : locale === 'ru' ? 'Пароль успешно изменен!' : 'Password successfully reset!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || (locale === 'tj' ? 'Хатогӣ ба амал омад.' : locale === 'ru' ? 'Произошла ошибка.' : 'An error occurred.'));
      }
    } catch (err) {
      setStatus('error');
      setMessage(locale === 'tj' ? 'Хатогӣ ба амал омад. Лутфан, бори дигар кӯшиш кунед.' : locale === 'ru' ? 'Произошла ошибка. Пожалуйста, попробуйте снова.' : 'An error occurred. Please try again.');
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-red-800 font-medium">{message}</p>
        <Link
          href={`/${locale}/login`}
          className="inline-flex items-center text-sm font-semibold text-gold hover:text-gold-dark transition-colors"
        >
          {locale === 'tj' ? 'Бозгашт ба Вуруд' : locale === 'ru' ? 'Вернуться ко Входу' : 'Back to Login'}
        </Link>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-4"
      >
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <p className="text-green-800 font-medium">{message}</p>
        <p className="text-sm text-green-600">
          {locale === 'tj' ? 'Шумо ба саҳифаи вуруд интиқол меёбед...' : locale === 'ru' ? 'Вы будете перенаправлены на страницу входа...' : 'Redirecting to login...'}
        </p>
      </motion.div>
    );
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-navy mb-2">
            {locale === 'tj' ? 'Гузарвожаи нав' : locale === 'ru' ? 'Новый пароль' : 'New Password'}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-navy mb-2">
            {locale === 'tj' ? 'Тасдиқи гузарвожа' : locale === 'ru' ? 'Подтвердите пароль' : 'Confirm Password'}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full flex justify-center items-center space-x-2 bg-gold text-white py-3 px-4 rounded-lg hover:bg-gold-dark transition-colors font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>
          {status === 'loading' 
            ? (locale === 'tj' ? 'Дар ҳоли ивазкунӣ...' : locale === 'ru' ? 'Сохранение...' : 'Resetting...') 
            : (locale === 'tj' ? 'Гузарвожаро навсозӣ кунед' : locale === 'ru' ? 'Обновить пароль' : 'Reset Password')
          }
        </span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const locale = useLocale();

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
            {locale === 'tj' ? 'Гузарвожаро нав кунед' : locale === 'ru' ? 'Сброс пароля' : 'Reset Password'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {locale === 'tj' ? 'Гузарвожаи нави бехатар эҷод кунед.' : 
             locale === 'ru' ? 'Создайте новый безопасный пароль.' : 
             'Create a new secure password.'}
          </p>
        </div>
        
        <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
