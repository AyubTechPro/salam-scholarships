'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, GraduationCap, Globe, BookOpen, ArrowRight, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

type WizardStep = 1 | 2 | 3;

interface WizardData {
  level: string;
  country: string;
  fieldOfStudy: string;
}

const levels = [
  { value: 'SCHOOL', label: { en: 'School', ru: 'Школа', tj: 'Мактаб' } },
  { value: 'BACHELOR', label: { en: 'Bachelor', ru: 'Бакалавр', tj: 'Бакалавр' } },
  { value: 'MASTER', label: { en: 'Master', ru: 'Магистр', tj: 'Магистр' } },
  { value: 'PHD', label: { en: 'PhD', ru: 'Доктор', tj: 'Доктор' } },
];

interface GetStartedWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GetStartedWizard({ isOpen, onClose }: GetStartedWizardProps) {
  const locale = useLocale();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [data, setData] = useState<WizardData>({
    level: '',
    country: '',
    fieldOfStudy: '',
  });
  const [countries, setCountries] = useState<Array<{ name: string; nameRu?: string | null; nameTj?: string | null }>>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [wizardSteps, setWizardSteps] = useState<Array<{
    stepNumber: number;
    title: string;
    titleRu?: string | null;
    titleTj?: string | null;
    description: string;
    descriptionRu?: string | null;
    descriptionTj?: string | null;
    icon?: string | null;
  }>>([]);

  // Fetch wizard steps from database
  useEffect(() => {
    fetch('/api/how-it-works')
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data && result.data.length > 0) {
          setWizardSteps(result.data);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch countries
  useEffect(() => {
    if (isOpen) {
      setLoadingCountries(true);
      fetch('/api/opportunities/countries')
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setCountries(result.data || []);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingCountries(false));
    }
  }, [isOpen]);

  const getLocalizedText = (key: 'en' | 'ru' | 'tj', text: string) => {
    return text;
  };

  const getLocalizedCountryName = (country: { name: string; nameRu?: string | null; nameTj?: string | null }) => {
    if (locale === 'ru' && country.nameRu) return country.nameRu;
    if (locale === 'tj' && country.nameTj) return country.nameTj;
    return country.name;
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const handleFinish = () => {
    // Build search URL with filters
    const params = new URLSearchParams();
    if (data.level) params.append('level', data.level);
    if (data.country) params.append('country', data.country);
    if (data.fieldOfStudy) params.append('search', data.fieldOfStudy);

    router.push(`/${locale}/opportunities?${params.toString()}`);
    onClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!data.level;
      case 2:
        return !!data.country;
      case 3:
        return !!data.fieldOfStudy;
      default:
        return false;
    }
  };

  // Get icon component by name
  const getIconComponent = (iconName?: string | null) => {
    if (!iconName) return GraduationCap;
    const IconComponent = (LucideIcons as any)[iconName] as typeof GraduationCap;
    return IconComponent || GraduationCap;
  };

  const getStepTitle = () => {
    // Try to get from database first
    const dbStep = wizardSteps.find(s => s.stepNumber === currentStep);
    if (dbStep) {
      if (locale === 'ru' && dbStep.titleRu) return dbStep.titleRu;
      if (locale === 'tj' && dbStep.titleTj) return dbStep.titleTj;
      return dbStep.title;
    }

    // Fallback to hardcoded values
    const titles = {
      en: {
        1: 'What is your education level?',
        2: 'Which country interests you?',
        3: 'What field of study?',
      },
      ru: {
        1: 'Какой у вас уровень образования?',
        2: 'Какая страна вас интересует?',
        3: 'Какая область обучения?',
      },
      tj: {
        1: 'Сатҳи таҳсилоти шумо чист?',
        2: 'Кадом кишвар шуморо таваҷҷуҳ медиҳад?',
        3: 'Кадом соҳаи таҳсилот?',
      },
    };
    return titles[locale as keyof typeof titles]?.[currentStep] || titles.en[currentStep];
  };

  const getStepDescription = () => {
    // Try to get from database first
    const dbStep = wizardSteps.find(s => s.stepNumber === currentStep);
    if (dbStep) {
      if (locale === 'ru' && dbStep.descriptionRu) return dbStep.descriptionRu;
      if (locale === 'tj' && dbStep.descriptionTj) return dbStep.descriptionTj;
      return dbStep.description;
    }

    // Fallback to hardcoded values
    const descriptions = {
      en: {
        1: 'Select your current or desired education level',
        2: 'Choose the country where you want to study',
        3: 'Enter your field of interest or study area',
      },
      ru: {
        1: 'Выберите ваш текущий или желаемый уровень образования',
        2: 'Выберите страну, где вы хотите учиться',
        3: 'Введите вашу область интересов или обучения',
      },
      tj: {
        1: 'Сатҳи ҷории ё мақсади таҳсилоти худро интихоб кунед',
        2: 'Кишвареро интихоб кунед, ки дар он таҳсил кардан мехоҳед',
        3: 'Соҳаи манфиат ё таҳсилоти худро ворид кунед',
      },
    };
    return descriptions[locale as keyof typeof descriptions]?.[currentStep] || descriptions.en[currentStep];
  };

  const getStepIcon = () => {
    // Try to get from database first
    const dbStep = wizardSteps.find(s => s.stepNumber === currentStep);
    if (dbStep && dbStep.icon) {
      const IconComponent = getIconComponent(dbStep.icon);
      return IconComponent;
    }

    // Fallback to default icons
    if (currentStep === 1) return GraduationCap;
    if (currentStep === 2) return Globe;
    return BookOpen;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-navy rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
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
              <h2 className="text-2xl font-heading font-bold mb-2">
                {locale === 'tj' ? 'Оғоз кардан' : locale === 'ru' ? 'Начать' : 'Get Started'}
              </h2>
              <p className="text-gray-200 text-sm">
                {locale === 'tj' ? '3 қадам барои ёфтани имкониятҳои беҳтарин' : locale === 'ru' ? '3 шага, чтобы найти лучшие возможности' : '3 steps to find the best opportunities'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                        step <= currentStep
                          ? 'bg-brand-gold text-brand-navy'
                          : 'bg-gray-200 dark:bg-navy-lighter text-gray-500'
                      }`}
                    >
                      {step < currentStep ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step
                      )}
                    </div>
                    {step < 3 && (
                      <div
                        className={`flex-1 h-1 mx-2 transition-all ${
                          step < currentStep ? 'bg-brand-gold' : 'bg-gray-200 dark:bg-navy-lighter'
                        }`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-gold/10 mb-4">
                    {(() => {
                      const IconComponent = getStepIcon();
                      return <IconComponent className="w-8 h-8 text-brand-gold" />;
                    })()}
                  </div>
                  <h3 className="text-xl font-heading font-bold text-brand-navy dark:text-white mb-2">
                    {getStepTitle()}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {getStepDescription()}
                  </p>
                </div>

                {/* Step 1: Level */}
                {currentStep === 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    {levels.map((level) => (
                      <motion.button
                        key={level.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setData({ ...data, level: level.value })}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          data.level === level.value
                            ? 'border-brand-gold bg-brand-gold/10 shadow-lg'
                            : 'border-gray-200 dark:border-navy-lighter hover:border-brand-gold/50'
                        }`}
                      >
                        <GraduationCap
                          className={`w-8 h-8 mb-3 ${
                            data.level === level.value ? 'text-brand-gold' : 'text-gray-400'
                          }`}
                        />
                        <div className="font-semibold text-brand-navy dark:text-white">
                          {level.label[locale as keyof typeof level.label] || level.label.en}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Step 2: Country */}
                {currentStep === 2 && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {loadingCountries ? (
                      <div className="text-center py-8 text-gray-500">
                        {locale === 'tj' ? 'Бор шуда истодааст...' : locale === 'ru' ? 'Загрузка...' : 'Loading...'}
                      </div>
                    ) : (
                      countries.map((country) => (
                        <motion.button
                          key={country.name}
                          whileHover={{ scale: 1.01, x: 4 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setData({ ...data, country: country.name })}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center justify-between ${
                            data.country === country.name
                              ? 'border-brand-gold bg-brand-gold/10 shadow-md'
                              : 'border-gray-200 dark:border-navy-lighter hover:border-brand-gold/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Globe
                              className={`w-5 h-5 ${
                                data.country === country.name ? 'text-brand-gold' : 'text-gray-400'
                              }`}
                            />
                            <span className="font-medium text-brand-navy dark:text-white">
                              {getLocalizedCountryName(country)}
                            </span>
                          </div>
                          {data.country === country.name && (
                            <Check className="w-5 h-5 text-brand-gold" />
                          )}
                        </motion.button>
                      ))
                    )}
                  </div>
                )}

                {/* Step 3: Field of Study */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={data.fieldOfStudy}
                      onChange={(e) => setData({ ...data, fieldOfStudy: e.target.value })}
                      placeholder={
                        locale === 'tj'
                          ? 'Масалан: Компьютер, Тиҷорат, Тиб...'
                          : locale === 'ru'
                          ? 'Например: Компьютер, Бизнес, Медицина...'
                          : 'e.g., Computer Science, Business, Medicine...'
                      }
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-navy-lighter focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-brand-navy dark:text-white bg-white dark:bg-navy-lighter"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        locale === 'tj' ? 'Илмҳои компютерӣ' : locale === 'ru' ? 'Компьютерные науки' : 'Computer Science',
                        locale === 'tj' ? 'Тиҷорат' : locale === 'ru' ? 'Бизнес' : 'Business',
                        locale === 'tj' ? 'Тиб' : locale === 'ru' ? 'Медицина' : 'Medicine',
                        locale === 'tj' ? 'Муҳандисӣ' : locale === 'ru' ? 'Инженерия' : 'Engineering',
                        locale === 'tj' ? 'Санъат' : locale === 'ru' ? 'Искусство' : 'Arts',
                        locale === 'tj' ? 'Ҳуқуқ' : locale === 'ru' ? 'Право' : 'Law',
                      ].map((field) => (
                        <motion.button
                          key={field}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setData({ ...data, fieldOfStudy: field })}
                          className={`p-3 rounded-lg border-2 transition-all text-sm ${
                            data.fieldOfStudy === field
                              ? 'border-brand-gold bg-brand-gold/10'
                              : 'border-gray-200 dark:border-navy-lighter hover:border-brand-gold/50'
                          }`}
                        >
                          {field}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-navy-lighter p-6 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-brand-navy dark:text-white hover:bg-gray-100 dark:hover:bg-navy-lighter'
              }`}
            >
              {locale === 'tj' ? 'Бозгашт' : locale === 'ru' ? 'Назад' : 'Back'}
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                canProceed()
                  ? 'bg-brand-gold text-brand-navy hover:bg-brand-gold/90 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>
                {currentStep === 3
                  ? locale === 'tj'
                    ? 'Оғоз кардан'
                    : locale === 'ru'
                    ? 'Начать поиск'
                    : 'Find Opportunities'
                  : locale === 'tj'
                  ? 'Оянда'
                  : locale === 'ru'
                  ? 'Далее'
                  : 'Next'}
              </span>
              {currentStep === 3 ? (
                <ArrowRight className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

