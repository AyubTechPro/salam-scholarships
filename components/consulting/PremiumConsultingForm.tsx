'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Send, CheckCircle2, Loader2, GraduationCap, Globe, Award } from 'lucide-react';
import UIDictionaryText from '@/components/common/UIDictionaryText';
import GlobalPhoneInput from '@/components/common/GlobalPhoneInput';
import { worldRegions, globalCountries } from '@/components/common/WorldRegions';

const englishLevels = [
  { value: 'beginner', label: 'Beginner (A1-A2)' },
  { value: 'intermediate', label: 'Intermediate (B1-B2)' },
  { value: 'advanced', label: 'Advanced (C1-C2)' },
  { value: 'native', label: 'Native / Fluent' },
];

export default function PremiumConsultingForm() {
  const t = useTranslations('consulting');
  const tCommon = useTranslations('common');
  const tFilters = useTranslations('filters');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+992',
    country: 'TJ',
    englishLevel: '',
    targetRegion: '',
    targetCountry: '',
    targetLevel: '',
    message: '',
    preferredLanguage: locale,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/consulting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: formData.phone ? `${formData.countryCode}${formData.phone}` : '',
          countryCode: formData.countryCode,
          country: formData.country,
          targetProgramId: searchParams?.get('programId') || undefined,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          countryCode: '+992',
          country: 'TJ',
          englishLevel: '',
          targetRegion: '',
          targetCountry: '',
          targetLevel: '',
          message: '',
          preferredLanguage: locale,
        });
      } else {
        setError(result?.error || t('form.error') || (locale === 'tj' ? 'Ирсоли дархост муяссар нашуд' : 
                                                       locale === 'ru' ? 'Не удалось отправить запрос' : 
                                                       'Failed to submit request'));
      }
    } catch (err) {
      setError(t('form.error') || (locale === 'tj' ? 'Хатогӣ ба амал омад. Лутфан, бори дигар кӯшиш кунед.' : 
                                    locale === 'ru' ? 'Произошла ошибка. Пожалуйста, попробуйте снова.' : 
                                    'An error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="backdrop-blur-2xl bg-white/60 dark:bg-[#112240]/60 border border-white/50 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-12 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]"
      >
        {/* Soft inner glow gradient for Glassmorphism depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none rounded-3xl"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-400/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-sm mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
          >
            <motion.div
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1, pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
            </motion.div>
          </motion.div>
          
          <h3 className="text-3xl font-heading font-extrabold text-brand-navy dark:text-white mb-4 tracking-tight">
            {t('form.success.title')}
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-sans leading-relaxed mb-8">
            {t('form.success.message')}
          </p>
          
          <button
            onClick={() => setSuccess(false)}
            className="w-full bg-transparent border-2 border-brand-gold text-brand-gold px-8 py-4 rounded-xl font-heading font-bold text-lg hover:bg-brand-gold hover:text-brand-navy hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all font-sans mb-4"
          >
            {locale === 'tj' ? 'Бозгашт ба форма' : locale === 'ru' ? 'Вернуться к форме' : 'Return to Form'}
          </button>
          
          <div className="text-center">
            <Link href={`/${locale}/auth/register`} className="text-sm font-sans text-gray-500 hover:text-brand-navy dark:hover:text-white transition-colors underline decoration-brand-gold/30 underline-offset-4 pointer-events-auto relative z-20">
              {locale === 'tj' ? 'Сабти ном кунед то дархости худро пайгирӣ кунед →' : locale === 'ru' ? 'Зарегистрируйтесь, чтобы отслеживать заявку →' : 'Create an account to track your request →'}
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-2xl bg-white/60 dark:bg-[#112240]/60 border border-white/50 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 md:p-12 relative overflow-hidden"
    >
      {/* Soft inner glow gradient for Glassmorphism depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-3xl"></div>
      <div className="relative z-10">
      <div className="mb-8">
        <div className="inline-flex items-center space-x-2 bg-brand-gold/10 text-brand-gold px-4 py-2 rounded-full text-sm font-heading font-semibold mb-4">
          <Award className="w-4 h-4" />
          <span>{t('badge')}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-navy mb-4">
          <UIDictionaryText dictKey="consulting.form.title" fallback={t('title')} />
        </h2>
        <p className="text-lg text-gray-600 font-sans">
          {t('description')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-md font-sans">
            {error || t('form.error')}
          </div>
        )}

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-heading font-bold text-brand-navy mb-2">
              {t('form.name')}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200/80 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-navy-light/50 focus:bg-white dark:focus:bg-navy-light focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 focus:shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all font-sans outline-none backdrop-blur-md"
              placeholder={t('form.namePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-heading font-bold text-brand-navy mb-2">
              {t('form.email')}
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200/80 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-navy-light/50 focus:bg-white dark:focus:bg-navy-light focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 focus:shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all font-sans outline-none backdrop-blur-md"
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-heading font-bold text-brand-navy mb-2">
            {t('form.phone')}
          </label>
          <GlobalPhoneInput
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value })}
            countryCode={formData.countryCode}
            onCountryChange={(code, country) => {
              setFormData({ ...formData, countryCode: code, country });
            }}
            placeholder={t('form.phonePlaceholder')}
          />
        </div>

        {/* Academic Profile */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <GraduationCap className="w-5 h-5 text-brand-gold" />
            <h3 className="text-xl font-heading font-bold text-brand-navy">
              {locale === 'tj' ? 'Маълумоти таълимӣ' : locale === 'ru' ? 'Образовательная информация' : 'Educational Information'}
            </h3>
          </div>

          <div>
            <label className="block text-sm font-heading font-bold text-brand-navy mb-2">
              {t('form.englishLevel')}
            </label>
            <select
              required
              value={formData.englishLevel}
              onChange={(e) => setFormData({ ...formData, englishLevel: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200/80 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-navy-light/50 focus:bg-white dark:focus:bg-navy-light focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 focus:shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all font-sans outline-none backdrop-blur-md"
            >
              <option value="">{t('form.englishLevelPlaceholder')}</option>
              {englishLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {t(`levels.${level.value}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Target Goals */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="w-5 h-5 text-brand-gold" />
            <h3 className="text-xl font-heading font-bold text-brand-navy">
              {locale === 'tj' ? 'Маълумоти дархост' : locale === 'ru' ? 'Детали заявки' : 'Application Details'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-heading font-bold text-brand-navy mb-2">
                {locale === 'tj' ? 'Минтақа' : locale === 'ru' ? 'Регион' : 'Target Region'}
              </label>
              <select
                required
                value={formData.targetRegion}
                onChange={(e) => {
                  setFormData({ ...formData, targetRegion: e.target.value, targetCountry: '' });
                }}
                className="w-full px-4 py-3 border border-gray-200/80 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-navy-light/50 focus:bg-white dark:focus:bg-navy-light focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 focus:shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all font-sans outline-none backdrop-blur-md"
              >
                <option value="">
                  {locale === 'tj' ? 'Минтақаро интихоб кунед' : 
                   locale === 'ru' ? 'Выберите регион' : 
                   'Select Region'}
                </option>
                {worldRegions.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label[locale as 'en' | 'ru' | 'tj'] || region.label.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-heading font-bold text-brand-navy mb-2">
                {t('form.targetCountry')}
              </label>
              <select
                required
                value={formData.targetCountry}
                onChange={(e) => setFormData({ ...formData, targetCountry: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200/80 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-navy-light/50 focus:bg-white dark:focus:bg-navy-light focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 focus:shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all font-sans outline-none backdrop-blur-md"
                disabled={!formData.targetRegion}
              >
                <option value="">{t('form.targetCountryPlaceholder')}</option>
                {globalCountries
                  .filter((c) => !formData.targetRegion || c.region === formData.targetRegion || formData.targetRegion === 'other')
                  .map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.flag} {country.value}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-heading font-bold text-brand-navy mb-2">
                {t('form.targetLevel')}
              </label>
              <select
                required
                value={formData.targetLevel}
                onChange={(e) => setFormData({ ...formData, targetLevel: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200/80 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-navy-light/50 focus:bg-white dark:focus:bg-navy-light focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 focus:shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all font-sans outline-none backdrop-blur-md"
              >
                <option value="">{t('form.targetLevelPlaceholder')}</option>
                <option value="SCHOOL">{tFilters('school')}</option>
                <option value="BACHELOR">{tFilters('bachelor')}</option>
                <option value="MASTER">{tFilters('master')}</option>
                <option value="PHD">{tFilters('phd')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-heading font-bold text-brand-navy mb-2">
            {t('form.message')}
          </label>
          <textarea
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={5}
            className="w-full px-4 py-3 border border-gray-200/80 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-navy-light/50 focus:bg-white dark:focus:bg-navy-light focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 focus:shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all resize-none font-sans outline-none backdrop-blur-md"
            placeholder={t('form.messagePlaceholder')}
          />
          <p className="text-sm text-gray-500 mt-1">
            {locale === 'tj' ? 'Ҳадди ақал 10 аломат' : locale === 'ru' ? 'Минимум 10 символов' : 'Minimum 10 characters'}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-gold text-brand-navy px-8 py-4 rounded-md font-heading font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('form.submitting')}</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>{t('form.submit')}</span>
            </>
          )}
        </button>

        <p className="text-sm text-gray-500 text-center">
          {locale === 'tj' 
            ? 'Бо фиристодани ин форма, шумо ба Сиёсати махфияти мо розӣ мешавед. Мо дар давоми 24-48 соат ба шумо ҷавоб медиҳем.'
            : locale === 'ru'
            ? 'Отправляя эту форму, вы соглашаетесь с нашей Политикой конфиденциальности. Мы ответим в течение 24-48 часов.'
            : 'By submitting this form, you agree to our Privacy Policy. We\'ll respond within 24-48 hours.'}
        </p>
      </form>
      </div>
    </motion.div>
  );
}

