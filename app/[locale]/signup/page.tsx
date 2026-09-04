'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import Logo from '@/components/common/Logo';
import { Mail, Lock, User, ArrowRight, GraduationCap, Building2, ShieldCheck } from 'lucide-react';
import GlobalPhoneInput from '@/components/common/GlobalPhoneInput';

export default function SignupPage() {
  const t = useTranslations('common');
  const locale = useLocale();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    countryCode: '+992',
    country: 'TJ',
    password: '',
    confirmPassword: '',
    role: 'USER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(locale === 'tj' ? 'Гузарвожаҳо мувофиқат намекунанд' : 
               locale === 'ru' ? 'Пароли не совпадают' : 
               'Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError(locale === 'tj' ? 'Гузарвожа бояд ақаллан 8 аломат бошад' : 
               locale === 'ru' ? 'Пароль должен быть не менее 8 символов' : 
               'Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber ? `${formData.countryCode}${formData.phoneNumber}` : null,
          countryCode: formData.countryCode,
          country: formData.country,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = data.error || (locale === 'tj' ? 'Хатогӣ ба амал омад' : locale === 'ru' ? 'Произошла ошибка' : 'An error occurred');
        
        // Map API errors to user-friendly messages
        if (errorMsg.includes('already exists')) {
          errorMsg = locale === 'tj'
            ? 'Ҳисобе бо ин суроғаи почтаи электронӣ аллакай мавҷуд аст. Лутфан, ворид шавед.'
            : locale === 'ru'
            ? 'Аккаунт с этим email адресом уже существует. Пожалуйста, войдите.'
            : 'An account with this email already exists. Please sign in.';
        } else if (errorMsg.includes('email')) {
          errorMsg = locale === 'tj'
            ? 'Суроғаи почтаи электронӣ нодуруст аст.'
            : locale === 'ru'
            ? 'Неверный email адрес.'
            : 'Invalid email address.';
        }
        
        setError(errorMsg);
      } else {
        // Automatically log the user in after successful registration
        await signIn('credentials', {
          redirect: true,
          email: formData.email,
          password: formData.password,
          callbackUrl: `/${locale}/dashboard`,
        });
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
            {t('signup')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {locale === 'tj' ? 'Ҳисоби худро созед' : 
             locale === 'ru' ? 'Создайте свой аккаунт' : 
             'Create your account to discover opportunities'}
          </p>
          
          <div className="mt-6 flex justify-center space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setFormData({...formData, role: 'USER'})}
              className={`flex-1 flex items-center justify-center py-2 px-3 text-sm font-medium rounded-md transition-all ${
                formData.role === 'USER' ? 'bg-white shadow text-navy' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <GraduationCap className="w-4 h-4 mr-1.5" />
              {locale === 'tj' ? 'Донишҷӯ' : locale === 'ru' ? 'Студент' : 'Student'}
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, role: 'PARTNER'})}
              className={`flex-1 flex items-center justify-center py-2 px-3 text-sm font-medium rounded-md transition-all ${
                formData.role === 'PARTNER' ? 'bg-white shadow text-navy' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="w-4 h-4 mr-1.5" />
              {locale === 'tj' ? 'Шарик' : locale === 'ru' ? 'Партнер' : 'Partner'}
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, role: 'ADMIN'})}
              className={`flex-1 flex items-center justify-center py-2 px-3 text-sm font-medium rounded-md transition-all ${
                formData.role === 'ADMIN' ? 'bg-white shadow text-navy' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              {locale === 'tj' ? 'Стафф' : locale === 'ru' ? 'Персонал' : 'Staff'}
            </button>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-navy mb-2">
                {locale === 'tj' ? 'Номи пурра' : locale === 'ru' ? 'Полное имя' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {locale === 'tj' ? 'Ақаллан 8 аломат' : locale === 'ru' ? 'Не менее 8 символов' : 'At least 8 characters'}
              </p>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-brand-navy mb-2">
                {locale === 'tj' ? 'Рақами телефон' : locale === 'ru' ? 'Номер телефона' : 'Phone Number'}
              </label>
              <GlobalPhoneInput
                value={formData.phoneNumber}
                onChange={(value) => setFormData({ ...formData, phoneNumber: value })}
                countryCode={formData.countryCode}
                onCountryChange={(code, country) => {
                  setFormData({ ...formData, countryCode: code, country });
                }}
                placeholder={locale === 'tj' ? 'Рақами телефон' : locale === 'ru' ? 'Введите номер телефона' : 'Enter phone number'}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {locale === 'tj' ? 'Мисол: 901234567 (барои Тоҷикистон)' : 
                 locale === 'ru' ? 'Пример: 901234567 (для Таджикистана)' : 
                 'Example: 901234567 (for Tajikistan)'}
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy mb-2">
                {locale === 'tj' ? 'Тасдиқи гузарвожа' : locale === 'ru' ? 'Подтвердите пароль' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
              {locale === 'tj' ? (
                <>
                  Ман бо{' '}
                  <Link href={`/${locale}/terms`} className="text-gold hover:text-gold-dark font-medium">
                    Шартҳои хизматрасонӣ
                  </Link>{' '}
                  ва{' '}
                  <Link href={`/${locale}/privacy`} className="text-gold hover:text-gold-dark font-medium">
                    Сиёсати махфият
                  </Link>{' '}
                  розӣ ҳастам
                </>
              ) : locale === 'ru' ? (
                <>
                  Я согласен с{' '}
                  <Link href={`/${locale}/terms`} className="text-gold hover:text-gold-dark font-medium">
                    Условиями использования
                  </Link>{' '}
                  и{' '}
                  <Link href={`/${locale}/privacy`} className="text-gold hover:text-gold-dark font-medium">
                    Политикой конфиденциальности
                  </Link>
                </>
              ) : (
                <>
                  I agree to the{' '}
                  <Link href={`/${locale}/terms`} className="text-gold hover:text-gold-dark font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href={`/${locale}/privacy`} className="text-gold hover:text-gold-dark font-medium">
                    Privacy Policy
                  </Link>
                </>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center space-x-2 bg-gold text-white py-3 px-4 rounded-lg hover:bg-gold-dark transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? (locale === 'tj' ? 'Дар ҳол эҷоди ҳисоб...' : locale === 'ru' ? 'Создание аккаунта...' : 'Creating account...') : t('signup')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {locale === 'tj' ? 'Ё бо' : locale === 'ru' ? 'Или через' : 'Or sign up with'}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  signIn('google', {
                    callbackUrl: `/${locale}/dashboard`,
                    redirect: true,
                  });
                }}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  signIn('apple', {
                    callbackUrl: `/${locale}/dashboard`,
                    redirect: true,
                  });
                }}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span className="ml-2">Apple</span>
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600">
            {locale === 'tj' ? 'Аллакай ҳисоб доред? ' : 
             locale === 'ru' ? 'Уже есть аккаунт? ' : 
             'Already have an account? '}
            <Link
              href={`/${locale}/login`}
              className="text-gold hover:text-gold-dark font-medium"
            >
              {t('login')}
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

