'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Globe,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  MapPin,
  Award,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getBlurDataURL } from '@/lib/image-utils';

interface SuccessWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

interface WizardData {
  level: 'SCHOOL' | 'BACHELOR' | 'MASTER' | 'PHD' | '';
  country: string;
  interests: string;
  cvFile: File | null;
  cvText: string;
}

interface MatchedOpportunity {
  id: string;
  title: string;
  titleRu?: string | null;
  titleTj?: string | null;
  description: string;
  descriptionRu?: string | null;
  descriptionTj?: string | null;
  level: string;
  category: string;
  country: string;
  fundingType: string;
  deadline: string;
  imageUrl?: string | null;
  isVerified: boolean;
  slug: string;
}

export default function SuccessWizard({ isOpen, onClose }: SuccessWizardProps) {
  const locale = useLocale();
  const router = useRouter();
  const { data: session } = useSession();
  const t = useTranslations('common');
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    level: '',
    country: '',
    interests: '',
    cvFile: null,
    cvText: '',
  });
  const [countries, setCountries] = useState<Array<{ name: string; nameRu?: string | null; nameTj?: string | null; code?: string }>>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matchedOpportunities, setMatchedOpportunities] = useState<MatchedOpportunity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const fetchCountries = useCallback(async () => {
    setLoadingCountries(true);
    try {
      // Try opportunities/countries first (countries from active programs)
      const response = await fetch('/api/opportunities/countries');
      const result = await response.json();
      
      if (result.success && result.data) {
        setCountries(result.data);
      } else {
        // Fallback to data-dictionary/countries
        const fallbackResponse = await fetch('/api/data-dictionary/countries');
        const fallbackResult = await fallbackResponse.json();
        
        if (fallbackResult.success && fallbackResult.data) {
          setCountries(fallbackResult.data);
        }
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  // Fetch countries when modal opens
  useEffect(() => {
    if (isOpen && countries.length === 0 && !loadingCountries) {
      fetchCountries();
    }
  }, [isOpen, countries.length, loadingCountries, fetchCountries]);

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!wizardData.level) {
        setError(locale === 'tj' ? 'Лутфан, сатҳи таълимиро интихоб кунед' : locale === 'ru' ? 'Пожалуйста, выберите уровень образования' : 'Please select your education level');
        return;
      }
      setCurrentStep(2);
      setError(null);
    } else if (currentStep === 2) {
      setCurrentStep(3);
      setError(null);
    } else if (currentStep === 3) {
      // Step 3: Immediately redirect to opportunities with filters
      // Skip AI matching and go straight to results
      setRedirecting(true);
      await redirectToOpportunities();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
      setError(null);
    }
  };

  const matchOpportunities = async () => {
    setMatching(true);
    setError(null);

    try {
      // Save preferences to database first
      try {
        const preferencesResponse = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferredCountries: wizardData.country ? [wizardData.country] : [],
            preferredFields: wizardData.interests ? [wizardData.interests] : [],
          }),
        });
        // Don't fail if preferences save fails
        if (preferencesResponse.ok) {
          console.log('Preferences saved successfully');
        }
      } catch (prefError) {
        console.error('Error saving preferences:', prefError);
        // Continue with matching even if preferences save fails
      }

      // Extract text from CV if uploaded
      let cvText = wizardData.interests;
      if (wizardData.cvFile) {
        // For now, use interests. In production, extract text from PDF
        cvText = wizardData.interests || 'Student interested in studying abroad';
      }

      const response = await fetch('/api/ai/match-opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: wizardData.level,
          country: wizardData.country,
          interests: wizardData.interests,
          cvText: cvText,
          locale: locale,
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.opportunities) {
        setMatchedOpportunities(result.data.opportunities);
      } else {
        // If matching fails, redirect to opportunities page with filters
        redirectToOpportunities();
      }
    } catch (error) {
      console.error('Error matching opportunities:', error);
      // On error, redirect to opportunities with filters
      redirectToOpportunities();
    } finally {
      setMatching(false);
    }
  };

  const redirectToOpportunities = async () => {
    setSavingPreferences(true);
    setRedirecting(true);
    
    try {
      // Scenario B: If user is logged in, save preferences to profile
      if (session?.user?.id) {
        try {
          const preferencesData: any = {};
          if (wizardData.country) {
            preferencesData.preferredCountries = [wizardData.country];
          }
          if (wizardData.interests) {
            preferencesData.preferredFields = wizardData.interests.split(',').map(f => f.trim()).filter(f => f.length > 0);
          }

          // Save preferences to user profile
          await fetch('/api/user/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(preferencesData),
          });
        } catch (error) {
          // Silent error - continue with redirect even if save fails
          console.error('Error saving preferences:', error);
        }
      }

      // Build search parameters for redirect
      const params = new URLSearchParams();
      
      // Map level values to enum format
      if (wizardData.level) {
        const levelMap: Record<string, string> = {
          'BACHELOR': 'BACHELOR',
          'MASTER': 'MASTER',
          'PHD': 'PHD',
          "Master's": 'MASTER',
          "Bachelor's": 'BACHELOR',
          "PhD": 'PHD',
          "Doctorate": 'PHD',
        };
        const mappedLevel = levelMap[wizardData.level] || wizardData.level.toUpperCase();
        params.append('level', mappedLevel);
      }
      
      // Add country filter
      if (wizardData.country) {
        params.append('country', wizardData.country);
      }
      
      // Add search query from interests (field of study)
      if (wizardData.interests) {
        // Use AI to extract field of study from interests
        try {
          const searchResponse = await fetch('/api/ai/magic-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              query: wizardData.interests, 
              locale 
            }),
          });
          const searchResult = await searchResponse.json();
          if (searchResult.success && searchResult.data?.searchParams) {
            const searchParams = searchResult.data.searchParams;
            if (searchParams.fieldOfStudy) {
              params.append('search', searchParams.fieldOfStudy);
            } else if (searchParams.keywords?.length > 0) {
              params.append('search', searchParams.keywords.join(' '));
            } else {
              params.append('search', wizardData.interests);
            }
          } else {
            params.append('search', wizardData.interests);
          }
        } catch (error) {
          // Silent error - just use interests as search
          params.append('search', wizardData.interests);
        }
      }
      
      // Redirect to opportunities page with filters
      router.push(`/${locale}/opportunities?${params.toString()}`);
      onClose();
    } catch (error) {
      // Silent error - still redirect
      console.error('Error in redirectToOpportunities:', error);
      const fallbackParams = new URLSearchParams();
      if (wizardData.level) fallbackParams.append('level', wizardData.level);
      if (wizardData.country) fallbackParams.append('country', wizardData.country);
      if (wizardData.interests) fallbackParams.append('search', wizardData.interests);
      router.push(`/${locale}/opportunities?${fallbackParams.toString()}`);
      onClose();
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWizardData({ ...wizardData, cvFile: file });
    }
  };

  const getLocalizedContent = (opp: MatchedOpportunity) => {
    if (locale === 'ru' && opp.titleRu) {
      return {
        title: opp.titleRu,
        description: opp.descriptionRu || opp.description,
      };
    }
    if (locale === 'tj' && opp.titleTj) {
      return {
        title: opp.titleTj,
        description: opp.descriptionTj || opp.description,
      };
    }
    return {
      title: opp.title,
      description: opp.description,
    };
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-brand-navy rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-brand-navy to-brand-navy/90 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pr-12">
              <div className="flex items-center space-x-3 mb-2">
                <Sparkles className="w-6 h-6 text-brand-gold" />
                <h2 className="text-2xl font-heading font-bold">
                  {locale === 'tj' ? 'Кӯмаккунандаи интихоб' : locale === 'ru' ? 'Помощник по выбору' : 'AI Smart Match'}
                </h2>
              </div>
              <p className="text-gray-200 text-sm">
                {locale === 'tj' 
                  ? 'Ба 3 савол ҷавоб диҳед ва мо беҳтарин стипендияҳоро барои ШУМО нишон медиҳем' 
                  : locale === 'ru'
                  ? 'Ответьте на 3 вопроса, и мы покажем вам лучшие стипендии для ВАС'
                  : 'Answer 3 questions, and we will show you the best scholarships for YOU'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {locale === 'tj' ? `Қадами ${currentStep} аз 3` : locale === 'ru' ? `Шаг ${currentStep} из 3` : `Step ${currentStep} of 3`}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / 3) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-brand-gold to-yellow-400 h-full rounded-full"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Goal */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-8 h-8 text-brand-gold" />
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-brand-navy dark:text-white mb-2">
                      {locale === 'tj' ? 'Мақсади шумо чист?' : locale === 'ru' ? 'Какова ваша цель?' : 'What is your goal?'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {locale === 'tj' 
                        ? 'Сатҳи таълимиро, ки мехоҳед пайдо кунед, интихоб кунед' 
                        : locale === 'ru'
                        ? 'Выберите уровень образования, который вы хотите получить'
                        : 'Select the education level you want to pursue'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { value: 'SCHOOL', label: locale === 'tj' ? 'Мактаб' : locale === 'ru' ? 'Школа' : 'School', icon: '🎓' },
                      { value: 'BACHELOR', label: locale === 'tj' ? 'Бакалавр' : locale === 'ru' ? 'Бакалавриат' : 'Bachelor', icon: '📚' },
                      { value: 'MASTER', label: locale === 'tj' ? 'Магистр' : locale === 'ru' ? 'Магистратура' : 'Master', icon: '🎓' },
                      { value: 'PHD', label: locale === 'tj' ? 'Доктор' : locale === 'ru' ? 'Докторантура' : 'PhD', icon: '👨‍🎓' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setWizardData({ ...wizardData, level: option.value as any });
                          setError(null);
                        }}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          wizardData.level === option.value
                            ? 'border-brand-gold bg-brand-gold/10 shadow-lg scale-105'
                            : 'border-gray-200 dark:border-gray-700 hover:border-brand-gold/50'
                        }`}
                      >
                        <div className="text-4xl mb-2">{option.icon}</div>
                        <div className="font-semibold text-brand-navy dark:text-white">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Country */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Globe className="w-8 h-8 text-brand-gold" />
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-brand-navy dark:text-white mb-2">
                      {locale === 'tj' ? 'Кишвари дилхоҳ?' : locale === 'ru' ? 'Какая страна предпочтительна?' : 'Which country do you prefer?'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {locale === 'tj' 
                        ? 'Кишвареро интихоб кунед ё "Ҳама" -ро интихоб кунед' 
                        : locale === 'ru'
                        ? 'Выберите страну или выберите "Любая"'
                        : 'Select a country or choose "Any"'}
                    </p>
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={wizardData.country}
                      onChange={(e) => {
                        setWizardData({ ...wizardData, country: e.target.value });
                        setError(null);
                      }}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 text-lg bg-white dark:bg-brand-navy-dark text-brand-navy dark:text-white"
                    >
                      <option value="">
                        {locale === 'tj' ? 'Ҳама кишварҳо' : locale === 'ru' ? 'Любая страна' : 'Any Country'}
                      </option>
                      {loadingCountries ? (
                        <option disabled>{locale === 'tj' ? 'Бор кардани кишварҳо...' : locale === 'ru' ? 'Загрузка стран...' : 'Loading countries...'}</option>
                      ) : (
                        countries.map((country) => (
                          <option key={country.code} value={country.name}>
                            {locale === 'ru' && (country as any).nameRu ? (country as any).nameRu : locale === 'tj' && (country as any).nameTj ? (country as any).nameTj : country.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </motion.div>
              )}

              {/* Step 3: CV/Interests */}
              {currentStep === 3 && !matching && !redirecting && matchedOpportunities.length === 0 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-brand-gold" />
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-brand-navy dark:text-white mb-2">
                      {locale === 'tj' ? 'CV-и худро бор кунед ё манфиатҳоро нависед' : locale === 'ru' ? 'Загрузите резюме или укажите интересы' : 'Upload your CV or type your interests'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {locale === 'tj' 
                        ? 'Ба мо кӯмак кунед, ки беҳтарин имкониятҳоро барои шумо пайдо кунем' 
                        : locale === 'ru'
                        ? 'Помогите нам найти лучшие возможности для вас'
                        : 'Help us find the best opportunities for you'}
                    </p>
                  </div>

                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-brand-gold transition-colors">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="cv-upload"
                    />
                    <label
                      htmlFor="cv-upload"
                      className="cursor-pointer inline-block bg-brand-gold text-brand-navy px-6 py-3 rounded-lg font-semibold hover:bg-brand-gold/90 transition-colors mb-4"
                    >
                      {locale === 'tj' ? 'CV-ро бор кардан' : locale === 'ru' ? 'Загрузить резюме' : 'Upload CV'}
                    </label>
                    {wizardData.cvFile && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {wizardData.cvFile.name}
                      </p>
                    )}
                  </div>

                  {/* Or Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-brand-navy text-gray-500">
                        {locale === 'tj' ? 'Ё' : locale === 'ru' ? 'Или' : 'OR'}
                      </span>
                    </div>
                  </div>

                  {/* Interests Text Area */}
                  <div>
                    <label className="block text-sm font-semibold text-brand-navy dark:text-white mb-2">
                      {locale === 'tj' ? 'Манфиатҳо ё соҳаи таълим' : locale === 'ru' ? 'Интересы или область обучения' : 'Interests or Field of Study'}
                    </label>
                    <textarea
                      value={wizardData.interests}
                      onChange={(e) => {
                        setWizardData({ ...wizardData, interests: e.target.value });
                        setError(null);
                      }}
                      placeholder={
                        locale === 'tj'
                          ? 'Масалан: IT, тиб, иқтисод, муҳандисӣ...'
                          : locale === 'ru'
                          ? 'Например: IT, медицина, экономика, инженерия...'
                          : 'e.g., IT, Medicine, Economics, Engineering...'
                      }
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 resize-none text-brand-navy dark:text-white bg-white dark:bg-brand-navy-dark"
                    />
                  </div>
                </motion.div>
              )}

              {/* Matching State */}
              {matching && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <Loader2 className="w-16 h-16 text-brand-gold animate-spin mb-4" />
                  <p className="text-xl font-semibold text-brand-navy dark:text-white mb-2">
                    {locale === 'tj' ? 'Имкониятҳоро меҷӯем...' : locale === 'ru' ? 'Ищем возможности...' : 'Finding your perfect opportunities...'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {locale === 'tj' 
                      ? 'Бо AI беҳтарин мувофиқатҳоро пайдо мекунем' 
                      : locale === 'ru'
                      ? 'Используем ИИ для поиска лучших совпадений'
                      : 'Using AI to find the best matches'}
                  </p>
                </motion.div>
              )}

              {/* Redirecting State */}
              {redirecting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <Loader2 className="w-16 h-16 text-brand-gold animate-spin mb-4" />
                  <p className="text-xl font-semibold text-brand-navy dark:text-white mb-2">
                    {locale === 'tj' ? 'Бор кардани имкониятҳо...' : locale === 'ru' ? 'Загрузка возможностей...' : 'Loading your opportunities...'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {locale === 'tj' 
                      ? 'Мо шуморо ба беҳтарин стипендияҳо мебарем' 
                      : locale === 'ru'
                      ? 'Мы ведем вас к лучшим стипендиям'
                      : 'Taking you to the best scholarships for you'}
                  </p>
                </motion.div>
              )}

              {/* Results */}
              {!matching && matchedOpportunities.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-heading font-bold text-brand-navy dark:text-white mb-2">
                      {locale === 'tj' ? 'Беҳтарин имкониятҳо барои шумо!' : locale === 'ru' ? 'Лучшие возможности для вас!' : 'Best Opportunities for You!'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {locale === 'tj' 
                        ? `Мо ${matchedOpportunities.length} имконияти мувофиқро пайдо кардем` 
                        : locale === 'ru'
                        ? `Мы нашли ${matchedOpportunities.length} подходящих возможностей`
                        : `We found ${matchedOpportunities.length} perfect matches`}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {matchedOpportunities.map((opp, index) => {
                      const localized = getLocalizedContent(opp);
                      return (
                        <Link
                          key={opp.id}
                          href={`/${locale}/opportunities/${opp.slug || opp.id}`}
                          className="group bg-white dark:bg-brand-navy-dark rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-brand-gold transition-all overflow-hidden"
                        >
                          {opp.imageUrl && (
                            <div className="relative h-32 w-full overflow-hidden">
                              <Image
                                src={opp.imageUrl}
                                alt={localized.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                sizes="(max-width: 768px) 100vw, 33vw"
                                placeholder="blur"
                                blurDataURL={getBlurDataURL()}
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs bg-brand-gold/20 text-brand-gold px-2 py-1 rounded font-semibold">
                                {opp.category}
                              </span>
                              {opp.isVerified && (
                                <Award className="w-4 h-4 text-brand-gold" />
                              )}
                            </div>
                            <h4 className="font-bold text-brand-navy dark:text-white mb-1 line-clamp-2 group-hover:text-brand-gold transition-colors">
                              {localized.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {localized.description}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span>{opp.country}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={redirectToOpportunities}
                      disabled={savingPreferences}
                      className="flex-1 bg-brand-gold text-brand-navy px-6 py-3 rounded-xl font-bold text-center hover:bg-brand-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {savingPreferences ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{locale === 'tj' ? 'Сабт кардани тартиботҳо...' : locale === 'ru' ? 'Сохранение предпочтений...' : 'Saving preferences...'}</span>
                        </>
                      ) : (
                        <span>{locale === 'tj' ? 'Ҳамаи имкониятҳоро дидан' : locale === 'ru' ? 'Посмотреть все возможности' : 'View All Opportunities'}</span>
                      )}
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-brand-navy dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {locale === 'tj' ? 'Бозгашт' : locale === 'ru' ? 'Назад' : 'Close'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}
          </div>

          {/* Footer Navigation */}
          {currentStep < 3 && !redirecting && matchedOpportunities.length === 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-brand-navy dark:text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{locale === 'tj' ? 'Бозгашт' : locale === 'ru' ? 'Назад' : 'Back'}</span>
              </button>
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-brand-gold text-brand-navy px-6 py-3 rounded-xl font-bold hover:bg-brand-gold/90 transition-colors"
              >
                <span>
                  {currentStep === 3
                    ? locale === 'tj' ? 'Нишон додани натиҷаҳо' : locale === 'ru' ? 'Показать результаты' : 'Show Results'
                    : locale === 'tj' ? 'Оянда' : locale === 'ru' ? 'Далее' : 'Next'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
  );
}

