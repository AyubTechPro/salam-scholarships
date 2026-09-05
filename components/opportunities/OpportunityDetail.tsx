'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Award, CheckCircle2, Clock, Globe, GraduationCap, ExternalLink, ArrowLeft, MessageCircle, ShieldCheck, XCircle, AlertCircle, Zap, TrendingUp, Send, Loader2, BrainCircuit, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from '@/components/common/ImageWithFallback';
import { getBlurDataURL, getSafeImageUrl } from '@/lib/image-utils';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ru, type Locale } from 'date-fns/locale';
import { formatDistanceToNowTajik, formatDateTajik, formatSmartCountdown } from '@/lib/date-fns-tajik';
import { useState, useEffect } from 'react';
import OpportunityCard from './OpportunityCard';
import InteractiveRoadmap from './InteractiveRoadmap';
import GlobalProtectionsGrid from './GlobalProtectionsGrid';
import { useScopedTranslation } from '@/lib/scoped-translation-client';
import ApplicationForm from './ApplicationForm';
import ApplicationSuccessModal from './ApplicationSuccessModal';
import { useSession } from 'next-auth/react';
import { DFYApplyModal } from './DFYApplyModal';

type Program = {
  id: string;
  title: string;
  titleRu?: string | null;
  titleTj?: string | null;
  description: string;
  descriptionRu?: string | null;
  descriptionTj?: string | null;
  level: string;
  category: string;
  fundingType: string;
  country: string;
  institution: string;
  deadline: Date | string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  imageUrl?: string | null;
  websiteUrl?: string | null;
  officialWebsiteUrl?: string | null;
  applicationUrl?: string | null;
  isVerified: boolean;
  viewCount?: number;
  requiresEnglishCert?: boolean;
  region?: string | null;
};

const dateLocales: Record<string, Locale> = {
  en: enUS,
  ru: ru,
  tj: enUS,
};

// Consultation Form Component - Premium Design
function ConsultationForm({ locale, onSuccess, onCancel }: { locale: string; onSuccess: () => void; onCancel: () => void }) {
  const t = useTranslations('consulting');
  const tCommon = useTranslations('common');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    englishLevel: '',
    targetCountry: '',
    targetLevel: '',
    message: '',
    preferredLanguage: locale,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const englishLevels = [
    { value: 'beginner', label: 'Beginner (A1-A2)' },
    { value: 'intermediate', label: 'Intermediate (B1-B2)' },
    { value: 'advanced', label: 'Advanced (C1-C2)' },
    { value: 'native', label: 'Native / Fluent' },
  ];

  const targetCountries = [
    'United States', 'United Kingdom', 'Germany', 'Canada', 'Australia',
    'Netherlands', 'Sweden', 'France', 'Turkey', 'Japan', 'South Korea', 'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/consulting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          englishLevel: '',
          targetCountry: '',
          targetLevel: '',
          message: '',
          preferredLanguage: locale,
        });
        onSuccess();
      } else {
        setError(result.error || t('form.errorSubmit') || t('form.errorGeneric') || 'Ирсоли дархост муяссар нашуд');
      }
    } catch (err) {
      setError(t('form.errorGeneric') || 'Хатогӣ ба амал омад. Лутфан, бори дигар кӯшиш кунед.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-2">
          {t('form.name')}
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] transition-all"
          placeholder={t('form.namePlaceholder')}
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-2">
          {t('form.email')}
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] transition-all"
          placeholder={t('form.emailPlaceholder') || 'email@example.com'}
        />
      </div>

      {/* Phone (Optional) */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-2">
          {t('form.phone')} <span className="text-gray-400 text-xs">{t('form.phoneOptional') || '(Ихтиёрӣ)'}</span>
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] transition-all"
          placeholder={t('form.phonePlaceholder')}
        />
      </div>

      {/* English Level */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-2">
          {t('form.englishLevel')}
        </label>
        <select
          required
          value={formData.englishLevel}
          onChange={(e) => setFormData({ ...formData, englishLevel: e.target.value })}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] transition-all"
        >
          <option value="" className="bg-[#020617]">{t('form.englishLevelPlaceholder')}</option>
          {englishLevels.map((level) => (
            <option key={level.value} value={level.value} className="bg-[#020617]">
              {t(`levels.${level.value}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Target Country */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-2">
          {t('form.targetCountry')}
        </label>
        <select
          required
          value={formData.targetCountry}
          onChange={(e) => setFormData({ ...formData, targetCountry: e.target.value })}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] transition-all"
        >
          <option value="" className="bg-[#020617]">{t('form.targetCountryPlaceholder')}</option>
          {targetCountries.map((country) => (
            <option key={country} value={country} className="bg-[#020617]">
              {country}
            </option>
          ))}
        </select>
      </div>

      {/* Target Level */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-2">
          {t('form.targetLevel')}
        </label>
        <select
          required
          value={formData.targetLevel}
          onChange={(e) => setFormData({ ...formData, targetLevel: e.target.value })}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] transition-all"
        >
          <option value="" className="bg-[#020617]">{t('form.targetLevelPlaceholder')}</option>
          <option value="SCHOOL" className="bg-[#020617]">{tCommon('filters.school')}</option>
          <option value="BACHELOR" className="bg-[#020617]">{tCommon('filters.bachelor')}</option>
          <option value="MASTER" className="bg-[#020617]">{tCommon('filters.master')}</option>
          <option value="PHD" className="bg-[#020617]">{tCommon('filters.phd')}</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-2">
          {t('form.message')}
        </label>
        <textarea
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] transition-all resize-none"
          placeholder={t('form.messagePlaceholder')}
        />
      </div>

      {/* Buttons */}
      <div className="space-y-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#eab308] via-[#facc15] to-[#eab308] text-[#020617] px-6 py-4 rounded-xl font-bold text-base hover:shadow-[0_0_25px_rgba(234,179,8,0.5)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
        
        <button
          type="button"
          onClick={onCancel}
          className="w-full bg-white/5 border border-white/10 text-gray-300 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-white/10 hover:border-white/20 transition-all"
        >
          {locale === 'tj' ? t('form.cancel') || t('cancel') || 'Бекор кардан' : locale === 'ru' ? 'Отмена' : 'Cancel'}
        </button>
      </div>
    </form>
  );
}

export default function OpportunityDetail({ opportunity, locale: propLocale }: { opportunity: Program; locale: string }) {
  const t = useTranslations('common');
  const tConsulting = useTranslations('consulting');
  const tFilters = useTranslations('filters');
  const currentLocale = useLocale();
  const locale = propLocale || currentLocale;
  const dateLocale = dateLocales[locale] || enUS;
  
  // UIDictionary translations with fallback
  const discussButtonText = useScopedTranslation('buttons.discussTelegram');
  const visitWebsiteText = useScopedTranslation('buttons.visitOfficialWebsite');
  const registrationClosedText = useScopedTranslation('buttons.registrationClosed');
  const needHelpTitle = useScopedTranslation('opportunityDetail.needHelpTitle');
  const needHelpDescription = useScopedTranslation('opportunityDetail.needHelpDescription');
  const successRate = useScopedTranslation('opportunityDetail.successRate');
  const withOurHelp = useScopedTranslation('opportunityDetail.withOurHelp');
  const average = useScopedTranslation('opportunityDetail.average');
  const aboutThisOpportunity = useScopedTranslation('opportunityDetail.aboutThisOpportunity');
  const programTimeline = useScopedTranslation('opportunityDetail.programTimeline');
  const startDate = useScopedTranslation('opportunityDetail.startDate');
  const endDate = useScopedTranslation('opportunityDetail.endDate');
  const howToApply = useScopedTranslation('opportunityDetail.howToApply');
  const countryLabel = useScopedTranslation('opportunityDetail.country');
  const institutionLabel = useScopedTranslation('opportunityDetail.institution');
  const deadlineLabel = useScopedTranslation('opportunityDetail.deadline');
  const timeLeftLabel = useScopedTranslation('opportunityDetail.timeLeft');
  const backButton = useScopedTranslation('opportunityDetail.back');
  const backToOpportunities = useScopedTranslation('opportunityDetail.backToOpportunities');
  const profileAnalysis = useScopedTranslation('opportunityDetail.profileAnalysis');
  const applicationStrategy = useScopedTranslation('opportunityDetail.applicationStrategy');
  const documentReview = useScopedTranslation('opportunityDetail.documentReview');
  const weWillRegisterText = useScopedTranslation('opportunityDetail.weWillRegister');
  const needProfessionalHelp = useScopedTranslation('opportunityDetail.needProfessionalHelp');
  const registrationClosedNotice = useScopedTranslation('opportunityDetail.registrationClosedNotice');
  const { data: session } = useSession();
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isDfyModalOpen, setIsDfyModalOpen] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState<{
    applicationId: string;
    telegramUrl: string;
  } | null>(null);
  const [relatedPrograms, setRelatedPrograms] = useState<Program[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [telegramSupportUsername, setTelegramSupportUsername] = useState<string>('ayub_it_tj');
  const [successToast, setSuccessToast] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Lead Gen MVP: Replaced complex 1-Click Apply with direct Telegram routing

  // Localize country name
  const getLocalizedCountryName = (countryName: string) => {
    const countryMap: Record<string, Record<string, string>> = {
      'Turkey': { tj: 'Туркия', ru: 'Турция', en: 'Turkey' },
      'Germany': { tj: 'Олмон', ru: 'Германия', en: 'Germany' },
      'United States': { tj: 'ИМА', ru: 'Соединенные Штаты', en: 'United States' },
      'United Kingdom': { tj: 'Бритониё', ru: 'Великобритания', en: 'United Kingdom' },
      'Netherlands': { tj: 'Нидерланд', ru: 'Нидерланды', en: 'Netherlands' },
    };
    return countryMap[countryName]?.[locale] || countryName;
  };

  // Get localized content
  const title = (locale === 'ru' && opportunity.titleRu) || (locale === 'tj' && opportunity.titleTj) || opportunity.title;
  const description = (locale === 'ru' && opportunity.descriptionRu) || (locale === 'tj' && opportunity.descriptionTj) || opportunity.description;

  const deadline = typeof opportunity.deadline === 'string' 
    ? new Date(opportunity.deadline) 
    : opportunity.deadline;
  
  // Smart countdown with urgency logic
  const countdown = formatSmartCountdown(deadline, locale);
  const timeRemaining = countdown.text;
  const isExpired = countdown.isExpired;
  const isDeadlineSoon = countdown.isUrgent;

  // Fetch Telegram support username
  useEffect(() => {
    const fetchTelegramUsername = async () => {
      try {
        const response = await fetch('/api/site-settings');
        const result = await response.json();
        if (result.success && result.data?.telegramSupportUsername) {
          setTelegramSupportUsername(result.data.telegramSupportUsername);
        }
      } catch (error) {
        console.error('Error fetching Telegram support username:', error);
      }
    };
    fetchTelegramUsername();
  }, []);

  // Track opportunity view
  useEffect(() => {
    const trackView = async () => {
      try {
        // Track view (this also creates UserActivity if user is logged in)
        await fetch(`/api/opportunities/${opportunity.id}/track-view`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Error tracking view:', error);
        // Don't block the UI if tracking fails
      }
    };

    trackView();
  }, [opportunity.id]);

  // Fetch related programs
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const params = new URLSearchParams();
        params.append('category', opportunity.category);
        params.append('limit', '3');
        // Exclude current program
        const response = await fetch(`/api/opportunities?${params.toString()}`);
        const result = await response.json();
        if (result.success && result.data) {
          // Filter out current program and limit to 3
          const related = result.data
            .filter((p: Program) => p.id !== opportunity.id)
            .slice(0, 3);
          setRelatedPrograms(related);
        }
      } catch (error) {
        console.error('Error fetching related programs:', error);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelated();
  }, [opportunity.id, opportunity.category]);

  const getLevelLabel = (level: string) => {
    const levelKey = level.toLowerCase();
    const translation = tFilters(levelKey as any);
    return translation || level;
  };

  const getCategoryLabel = (category: string) => {
    let categoryKey = category.toLowerCase().replace('_', '');
    if (category === 'SUMMER_SCHOOL') categoryKey = 'summerSchool';
    const translation = tFilters(categoryKey as any);
    return translation || category;
  };

  const getFundingLabel = (funding: string) => {
    if (funding === 'NONE') return '';
    const fundingKey = funding.toLowerCase();
    const translation = tFilters(fundingKey as any);
    return translation || funding;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Cinematic Full-Width Hero */}
      <div className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-navy">
        {/* Background Image */}
        {opportunity.imageUrl ? (
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
            style={{ backgroundImage: `url("${getSafeImageUrl(opportunity.imageUrl)}")` }}
          />
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-navy to-navy-light opacity-50" />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-navy via-navy/80 to-[#020617]/50" />
        
        {/* Animated Elements */}
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-brand-gold/20 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${currentLocale}/opportunities`}
            className="inline-flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">{backToOpportunities}</span>
          </Link>

          <div className="max-w-4xl">
            <div className="flex items-center flex-wrap gap-3 mb-6">
              <span className="bg-[#eab308] text-[#020617] px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                {getCategoryLabel(opportunity.category)}
              </span>
              <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                {getLevelLabel(opportunity.level)}
              </span>
              {opportunity.fundingType !== 'NONE' && (
                <span className="bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-300 px-4 py-1.5 rounded-full text-sm font-semibold">
                  {getFundingLabel(opportunity.fundingType)}
                </span>
              )}
              {opportunity.isVerified && (
                <span className="bg-blue-500/20 backdrop-blur-md border border-blue-500/30 text-blue-300 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('verified')}</span>
                </span>
              )}
              {opportunity.viewCount && opportunity.viewCount > 100 && (
                <span className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-300 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 flex-shrink-0" />
                  <span>{t('popular') || (locale === 'tj' ? 'Машҳур' : locale === 'ru' ? 'Популярный' : 'Popular')}</span>
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white mb-8 leading-tight drop-shadow-lg">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mt-4">
              <div className="flex items-center space-x-3 bg-[#020617]/40 backdrop-blur-sm border border-white/10 px-5 py-3 rounded-2xl">
                <MapPin className="w-6 h-6 text-[#eab308]" />
                <div>
                  <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">{countryLabel}</p>
                  <p className="font-bold text-white text-base">{getLocalizedCountryName(opportunity.country)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-[#020617]/40 backdrop-blur-sm border border-white/10 px-5 py-3 rounded-2xl">
                <GraduationCap className="w-6 h-6 text-[#eab308]" />
                <div>
                  <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">{institutionLabel}</p>
                  <p className="font-bold text-white text-base">{opportunity.institution}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-[#020617]/40 backdrop-blur-sm border border-white/10 px-5 py-3 rounded-2xl">
                <Calendar className="w-6 h-6 text-[#eab308]" />
                <div>
                  <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">{deadlineLabel}</p>
                  <p className="font-bold text-white text-base">
                    {locale === 'tj' 
                      ? formatDateTajik(deadline)
                      : deadline.toLocaleDateString(locale)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Box */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Urgent Deadline Alert */}
            <div className={`rounded-xl p-5 shadow-lg border-2 ${
              isExpired || countdown.daysLeft === 0
                ? 'bg-red-50 border-red-200'
                : isDeadlineSoon
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-white border-white'
            }`}>
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${
                  isExpired || countdown.daysLeft === 0 ? 'bg-red-100 text-red-600' : isDeadlineSoon ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                }`}>
                  {isExpired ? <XCircle className="w-6 h-6" /> : countdown.daysLeft === 0 ? <AlertCircle className="w-6 h-6" /> : isDeadlineSoon ? <Zap className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{timeLeftLabel}</p>
                  <p className={`font-bold text-lg ${
                    isExpired || countdown.daysLeft === 0 ? 'text-red-700' : isDeadlineSoon ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    {timeRemaining}
                  </p>
                </div>
              </div>
            </div>



            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-heading font-bold text-navy mb-4">{aboutThisOpportunity}</h2>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                {description}
              </div>
            </div>

            {/* Program Dates */}
            {(opportunity.startDate || opportunity.endDate) && (
              <div className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl p-8 border-l-4 border-gold">
                <h3 className="text-xl font-heading font-bold text-navy mb-4">{programTimeline}</h3>
                <div className="space-y-3">
                  {opportunity.startDate && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gold" />
                      <div>
                        <p className="text-sm text-gray-600">{startDate}</p>
                        <p className="font-semibold text-navy">
                          {locale === 'tj' 
                            ? formatDateTajik(opportunity.startDate)
                            : (typeof opportunity.startDate === 'string' 
                              ? new Date(opportunity.startDate) 
                              : opportunity.startDate
                            ).toLocaleDateString(locale, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                        </p>
                      </div>
                    </div>
                  )}
                  {opportunity.endDate && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gold" />
                      <div>
                        <p className="text-sm text-gray-600">{endDate}</p>
                        <p className="font-semibold text-navy">
                          {locale === 'tj' 
                            ? formatDateTajik(opportunity.endDate)
                            : (typeof opportunity.endDate === 'string' 
                              ? new Date(opportunity.endDate) 
                              : opportunity.endDate
                            ).toLocaleDateString(locale, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}


          </div>

          {/* Sidebar - Premium Consultation Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Premium Consultation Sidebar - Unified Design */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-[#020617] to-[#0f172a] rounded-2xl p-8 text-white shadow-2xl border border-gold/20"
              >
                {/* Toast Notification */}
                <AnimatePresence>
                  {successToast && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="fixed top-24 right-8 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center space-x-3 max-w-md"
                    >
                      <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                      <div>
                        <p className="font-bold">{tConsulting('form.success.title')}</p>
                        <p className="text-sm text-green-50">{tConsulting('form.success.message')}</p>
                      </div>
                      <button
                        onClick={() => setSuccessToast(false)}
                        className="ml-4 text-white/80 hover:text-white"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Title */}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-heading font-bold mb-2 text-gold">
                    Идоракунии Дархост
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {needHelpDescription}
                  </p>
                </div>

                {/* Service Checklist - Elegant */}
                <div className="mb-8 space-y-2.5">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200 leading-relaxed">{profileAnalysis}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200 leading-relaxed">{applicationStrategy}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200 leading-relaxed">{documentReview}</span>
                  </div>
                </div>

                {/* Dual Call-to-Action Buttons */}
                <div className="flex flex-col space-y-4">
                  <button
                    onClick={() => setIsDfyModalOpen(true)}
                    className="relative w-full group overflow-hidden rounded-2xl bg-gradient-to-b from-[#eab308] to-[#a16207] p-[1px] hover:shadow-[0_0_40px_rgba(234,179,8,0.4)] transition-all duration-500 transform hover:-translate-y-0.5"
                  >
                    {/* Animated Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    
                    <div className="relative flex items-center justify-center space-x-2 bg-gradient-to-b from-[#facc15] to-[#eab308] px-6 py-4 rounded-[15px] text-[#020617] font-black text-lg shadow-inner">
                      <Sparkles className="w-5 h-5 text-[#020617]" />
                      <span>
                        {locale === 'tj' ? 'Оғози Раванди Идорашаванда' : locale === 'ru' ? 'Начать управляемый процесс' : 'Start Managed Process'}
                      </span>
                    </div>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        const message = locale === 'tj'
                          ? encodeURIComponent(`Салом! Ман мехоҳам дар бораи ин барнома машварат гирам:\n\n${title}`)
                          : locale === 'ru'
                          ? encodeURIComponent(`Здравствуйте! Я хотел бы получить консультацию по этой программе:\n\n${title}`)
                          : encodeURIComponent(`Hello! I would like to get a consultation for this program:\n\n${title}`);
                        window.open(`https://t.me/${telegramSupportUsername}?start=${message}`, '_blank');
                      }}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-all flex items-center justify-center space-x-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{locale === 'tj' ? 'Тамос бо коршинос' : 'Связаться с экспертом'}</span>
                    </button>

                    {opportunity.officialWebsiteUrl || opportunity.websiteUrl ? (
                      <Link
                        href={opportunity.officialWebsiteUrl || opportunity.websiteUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-white/5 border border-white/10 text-gray-300 px-4 py-3 rounded-xl font-semibold text-sm hover:bg-white/10 hover:text-white transition-all flex items-center justify-center space-x-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>{locale === 'tj' ? 'Мустақилона' : 'Самостоятельно'}</span>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-white/5 border border-white/10 text-gray-500 px-4 py-3 rounded-xl font-semibold text-sm cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>{locale === 'tj' ? 'Мустақилона' : 'Самостоятельно'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Success Stats */}
                <div className="mt-8 pt-8 border-t border-white/10">
                  <h4 className="font-bold text-gold mb-4 text-sm">{successRate}</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-300">{withOurHelp}</span>
                        <span className="font-semibold text-gold">85%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-[#eab308] to-[#facc15] h-1.5 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-400">{average}</span>
                        <span className="font-semibold text-gray-400">35%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="bg-gray-500 h-1.5 rounded-full" style={{ width: '35%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Related Programs Section */}
        {relatedPrograms.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-heading font-bold text-navy mb-8">
              {t('similarOpportunities') || (locale === 'tj' 
                ? 'Имкониятҳои шабеҳ'
                : locale === 'ru'
                ? 'Похожие возможности'
                : 'Similar Opportunities')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPrograms.map((related) => {
                const relatedTitle = (locale === 'ru' && related.titleRu) || (locale === 'tj' && related.titleTj) || related.title;
                const relatedDescription = (locale === 'ru' && related.descriptionRu) || (locale === 'tj' && related.descriptionTj) || related.description;
                return (
                  <Link key={related.id} href={`/${locale}/opportunities/${related.id}`}>
                    <OpportunityCard
                      id={related.id}
                      title={relatedTitle}
                      description={relatedDescription}
                      level={related.level as 'SCHOOL' | 'BACHELOR' | 'MASTER' | 'PHD'}
                      category={related.category as 'SCHOLARSHIP' | 'FORUM' | 'SUMMER_SCHOOL' | 'CONFERENCE'}
                      fundingType={related.fundingType as 'FULL' | 'PARTIAL' | 'NONE'}
                      country={related.country}
                      deadline={typeof related.deadline === 'string' ? new Date(related.deadline) : related.deadline}
                      isVerified={related.isVerified}
                      imageUrl={getSafeImageUrl(related.imageUrl) || undefined}
                      requiresEnglishCert={related.requiresEnglishCert !== false}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 lg:hidden flex items-center justify-between pb-safe">
        <div className="flex-1 mr-4 overflow-hidden">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate">{locale === 'tj' ? 'Муроҷиат кунед' : locale === 'ru' ? 'Свяжитесь с нами' : 'Contact Us'}</p>
          <p className="text-navy font-bold text-sm truncate leading-tight mt-0.5">{title}</p>
        </div>
        <button
          onClick={() => {
            const message = locale === 'tj'
              ? encodeURIComponent(`Салом! Ман мехоҳам дар бораи ин барнома машварат гирам:\n\n${title}`)
              : locale === 'ru'
              ? encodeURIComponent(`Здравствуйте! Я хотел бы получить консультацию по этой программе:\n\n${title}`)
              : encodeURIComponent(`Hello! I would like to get a consultation for this program:\n\n${title}`);
            window.open(`https://t.me/${telegramSupportUsername}?start=${message}`, '_blank');
          }}
          className="flex-shrink-0 bg-gradient-to-r from-[#0088cc] to-[#0077b5] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#0088cc]/30 flex items-center space-x-2 active:scale-95 transition-transform"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{locale === 'tj' ? 'Машварат' : locale === 'ru' ? 'Консультация' : 'Consultation'}</span>
        </button>
      </div>

      {/* Premium DFY Modal */}
      <DFYApplyModal 
        isOpen={isDfyModalOpen}
        onClose={() => setIsDfyModalOpen(false)}
        programId={opportunity.id}
        programTitle={title}
      />
    </div>
  );
}
