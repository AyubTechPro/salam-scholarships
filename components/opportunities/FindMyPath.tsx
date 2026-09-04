'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Globe, Award, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Step = 'category' | 'region' | 'level' | 'result';

const categories = [
  { id: 'SCHOLARSHIP', label: 'filters.scholarship', icon: Award, color: 'from-gold to-gold-dark' },
  { id: 'FORUM', label: 'filters.forum', icon: Globe, color: 'from-blue-500 to-blue-600' },
  { id: 'SUMMER_SCHOOL', label: 'filters.summerSchool', icon: GraduationCap, color: 'from-green-500 to-green-600' },
  { id: 'CONFERENCE', label: 'filters.conference', icon: Sparkles, color: 'from-purple-500 to-purple-600' },
];

const regions = [
  { 
    id: 'Europe', 
    labelKey: 'regions.europe',
    countries: ['Germany', 'Netherlands', 'United Kingdom', 'France', 'Sweden'] 
  },
  { 
    id: 'North America', 
    labelKey: 'regions.northAmerica',
    countries: ['United States', 'Canada'] 
  },
  { 
    id: 'Asia', 
    labelKey: 'regions.asia',
    countries: ['Turkey', 'Japan', 'South Korea', 'Singapore'] 
  },
  { 
    id: 'Oceania', 
    labelKey: 'regions.oceania',
    countries: ['Australia', 'New Zealand'] 
  },
];

const levels = [
  { id: 'SCHOOL', label: 'filters.school' },
  { id: 'BACHELOR', label: 'filters.bachelor' },
  { id: 'MASTER', label: 'filters.master' },
  { id: 'PHD', label: 'filters.phd' },
];

export default function FindMyPath() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('category');
  const [selectedPath, setSelectedPath] = useState({
    category: '',
    region: '',
    level: '',
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedPath({ ...selectedPath, category: categoryId });
    setCurrentStep('region');
  };

  const handleRegionSelect = (regionId: string) => {
    setSelectedPath({ ...selectedPath, region: regionId });
    setCurrentStep('level');
  };

  const handleLevelSelect = (levelId: string) => {
    setSelectedPath({ ...selectedPath, level: levelId });
    setCurrentStep('result');
  };

  const handleFindOpportunities = () => {
    const params = new URLSearchParams();
    if (selectedPath.category) params.append('category', selectedPath.category);
    if (selectedPath.level) params.append('level', selectedPath.level);
    if (selectedPath.region) {
      const region = regions.find(r => r.id === selectedPath.region);
      if (region && region.countries.length > 0) {
        params.append('country', region.countries[0]);
      }
    }
    router.push(`/${locale}/opportunities?${params.toString()}`);
    
    // Scroll to results after navigation
    setTimeout(() => {
      const resultsElement = document.getElementById('opportunities-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const resetPath = () => {
    setSelectedPath({ category: '', region: '', level: '' });
    setCurrentStep('category');
  };

  return (
    <div className="bg-gradient-to-br from-navy via-navy-light to-navy-dark rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative z-10">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {locale === 'tj' ? t('findMyPath.badge') : locale === 'ru' ? 'Умное открытие' : 'Smart Discovery'}
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            {t('findMyPath.title')}
          </h2>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            {t('findMyPath.subtitle')}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center items-center space-x-4 mb-8">
          {['category', 'region', 'level'].map((step, index) => {
            const isActive = currentStep === step;
            const isCompleted = ['category', 'region', 'level'].indexOf(currentStep) > index;
            return (
              <div key={step} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    isActive
                      ? 'bg-gold text-navy scale-110'
                      : isCompleted
                      ? 'bg-gold/50 text-white'
                      : 'bg-white/20 text-gray-300'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 2 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-all ${
                      isCompleted ? 'bg-gold' : 'bg-white/20'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'category' && (
            <motion.div
              key="category"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`bg-gradient-to-br ${cat.color} p-6 rounded-2xl text-white hover:shadow-2xl transition-all group`}
                  >
                    <Icon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                    <p className="font-semibold text-sm">{t(cat.label)}</p>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {currentStep === 'region' && (
            <motion.div
              key="region"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {regions.map((region) => (
                <motion.button
                  key={region.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRegionSelect(region.id)}
                  className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-6 rounded-2xl hover:bg-white/20 hover:border-gold transition-all group"
                >
                  <Globe className="w-8 h-8 mb-3 text-gold group-hover:scale-110 transition-transform" />
                  <p className="font-semibold mb-1">
                    {t(region.labelKey) || region.id}
                  </p>
                  <p className="text-xs text-gray-300">
                    {region.countries.length} {t('findMyPath.countries')}
                  </p>
                </motion.button>
              ))}
            </motion.div>
          )}

          {currentStep === 'level' && (
            <motion.div
              key="level"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {levels.map((level) => (
                <motion.button
                  key={level.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLevelSelect(level.id)}
                  className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-6 rounded-2xl hover:bg-white/20 hover:border-gold transition-all group"
                >
                  <GraduationCap className="w-8 h-8 mb-3 text-gold group-hover:scale-110 transition-transform" />
                  <p className="font-semibold">{t(level.label)}</p>
                </motion.button>
              ))}
            </motion.div>
          )}

          {currentStep === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-6"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">
                  {t('findMyPath.yourPerfectPath')}
                </h3>
                <div className="space-y-2 text-left max-w-md mx-auto">
                  <div className="flex justify-between">
                    <span className="text-gray-300">
                      {t('findMyPath.category')}:
                    </span>
                    <span className="font-semibold">
                      {(() => {
                        const cat = categories.find(c => c.id === selectedPath.category);
                        if (!cat) return '';
                        const key = cat.id === 'SUMMER_SCHOOL' ? 'summerSchool' : cat.id.toLowerCase().replace('_', '');
                        return t(`filters.${key}`);
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">
                      {t('findMyPath.region')}:
                    </span>
                    <span className="font-semibold">
                      {(() => {
                        const region = regions.find(r => r.id === selectedPath.region);
                        return region ? (t(region.labelKey) || region.id) : selectedPath.region;
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">
                      {t('findMyPath.level')}:
                    </span>
                    <span className="font-semibold">
                      {t(`filters.${levels.find(l => l.id === selectedPath.level)?.id.toLowerCase() || ''}`)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleFindOpportunities}
                  className="bg-gradient-gold text-navy px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>
                    {t('findMyPath.findOpportunities')}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={resetPath}
                  className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  {t('findMyPath.startOver')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

