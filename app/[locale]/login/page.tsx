'use client';

import { useTranslations, useLocale } from 'next-intl';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Logo from '@/components/common/Logo';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('common');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check role before redirecting
      // First authenticate
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Map error messages to user-friendly messages
        const errorMsg = result.error;
        let friendlyError = errorMsg;
        
        if (errorMsg.includes('verify your email')) {
          friendlyError = locale === 'tj' 
            ? 'Лутфан, суроғаи почтаи электронии худро тасдиқ кунед. Рамзи тасдиқро дар паёмҳои почтаи электронӣ шумо тафтиш кунед.'
            : locale === 'ru'
            ? 'Пожалуйста, подтвердите ваш email адрес. Проверьте свою почту на наличие кода подтверждения.'
            : 'Please verify your email address. Check your inbox for the verification code.';
        } else if (errorMsg.includes('Incorrect password')) {
          friendlyError = locale === 'tj'
            ? 'Пароли нодуруст. Лутфан, бори дигар кӯшиш кунед.'
            : locale === 'ru'
            ? 'Неверный пароль. Пожалуйста, попробуйте снова.'
            : 'Incorrect password. Please try again.';
        } else if (errorMsg.includes('No account found')) {
          friendlyError = locale === 'tj'
            ? 'Ҳисобе бо ин суроғаи почтаи электронӣ ёфт нашуд. Лутфан, сабти ном кунед.'
            : locale === 'ru'
            ? 'Аккаунт с этим email адресом не найден. Пожалуйста, зарегистрируйтесь.'
            : 'No account found with this email address. Please sign up.';
        } else if (errorMsg.includes('social login')) {
          friendlyError = locale === 'tj'
            ? 'Ин ҳисоб бо Google ё Apple сохта шудааст. Лутфан, бо онҳо ворид шавед.'
            : locale === 'ru'
            ? 'Этот аккаунт был создан через социальные сети. Пожалуйста, войдите через Google или Apple.'
            : 'This account was created with a social login. Please sign in with Google or Apple.';
        } else if (errorMsg.includes('required')) {
          friendlyError = locale === 'tj'
            ? 'Лутфан, почта ва паролро ворид кунед.'
            : locale === 'ru'
            ? 'Пожалуйста, введите email и пароль.'
            : 'Please enter your email and password.';
        }
        
        setError(friendlyError);
      } else if (result?.ok) {
        // Successfully authenticated - fetch role to determine redirect
        try {
          // Small delay to ensure session is updated
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const roleResponse = await fetch('/api/user/role');
          const roleData = await roleResponse.json();
          
          const userRole = roleData.role || 'USER';
          const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_DIRECTOR', 'GROWTH_MANAGER', 'CONSULTANT'].includes(userRole);
          
          if (isAdmin) {
            window.location.href = `/${locale}/admin`;
          } else {
            window.location.href = `/${locale}/dashboard`;
          }
        } catch (err) {
          // Fallback to dashboard if role check fails
          console.error('Error fetching user role:', err);
          window.location.href = `/${locale}/dashboard`;
        }
      }
    } catch (err) {
      setError(locale === 'tj' ? 'Хатогӣ ба амал омад. Лутфан, бори дигар кӯшиш кунед.' : locale === 'ru' ? 'Произошла ошибка. Пожалуйста, попробуйте снова.' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg"
      >
        <div>
          <div className="flex justify-center mb-4">
            <Logo size="lg" showTagline={true} className="text-navy" />
          </div>
          <h2 className="text-center text-3xl font-bold text-navy">
            {t('login')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {locale === 'tj' ? 'Хуш омадед ба Salam Scholarships' : 
             locale === 'ru' ? 'Добро пожаловать в Salam Scholarships' : 
             'Welcome back to Salam Scholarships'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy mb-2">
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
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                {locale === 'tj' ? 'Маро дар хотир доред' : 
                 locale === 'ru' ? 'Запомнить меня' : 
                 'Remember me'}
              </label>
            </div>

            <div className="text-sm">
              <Link
                href={`/${locale}/forgot-password`}
                className="text-gold hover:text-gold-dark font-medium"
              >
                {locale === 'tj' ? 'Гузарвожаро фаромӯш кардед?' : 
                 locale === 'ru' ? 'Забыли пароль?' : 
                 'Forgot password?'}
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center space-x-2 bg-gold text-white py-3 px-4 rounded-lg hover:bg-gold-dark transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? (locale === 'tj' ? 'Дар ҳол вуруд шудан...' : locale === 'ru' ? 'Вход...' : 'Signing in...') : t('login')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}

