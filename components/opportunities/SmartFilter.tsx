'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, ShieldCheck } from 'lucide-react';

type FilterState = {
  level: string;
  country: string;
  fundingType: string;
  category: string;
  noEnglishCert?: boolean;
  isVerified?: boolean;
};

const levels = ['SCHOOL', 'BACHELOR', 'MASTER', 'PHD'];
const fundingTypes = ['FULL', 'PARTIAL'];

type Category = {
  slug: string;
  name: string;
  nameRu?: string | null;
  nameTj?: string | null;
};

interface SmartFilterProps {
  onFilterChange: (filters: FilterState) => void;
  /** Sync filters from parent (e.g. after AI Magic Search) */
  syncFilters?: FilterState;
}

type Country = {
  name: string;
  nameRu?: string | null;
  nameTj?: string | null;
};

export default function SmartFilter({ onFilterChange, syncFilters }: SmartFilterProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const getLocalizedCountryName = (country: Country) => {
    if (locale === 'ru' && country.nameRu) return country.nameRu;
    if (locale === 'tj' && country.nameTj) return country.nameTj;
    return country.name;
  };

  const getLocalizedCategoryName = (category: Category) => {
    if (locale === 'ru' && category.nameRu) return category.nameRu;
    if (locale === 'tj' && category.nameTj) return category.nameTj;
    return category.name;
  };
  const [filters, setFilters] = useState<FilterState>({
    level: '',
    country: '',
    fundingType: '',
    category: '',
    noEnglishCert: false,
    isVerified: false,
  });

  useEffect(() => {
    if (syncFilters && Object.values(syncFilters).some(Boolean)) {
      setFilters((prev) => ({ ...prev, ...syncFilters }));
    }
  }, [syncFilters]);

  // Fetch countries and categories from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, categoriesRes] = await Promise.all([
          fetch('/api/opportunities/countries'),
          fetch('/api/opportunities/categories'),
        ]);

        const countriesResult = await countriesRes.json();
        const categoriesResult = await categoriesRes.json();

        if (countriesResult.success) {
          setCountries(countriesResult.data);
        }
        if (categoriesResult.success) {
          setCategories(categoriesResult.data);
        }
      } catch (error) {
        console.error('Error fetching filter data:', error);
      } finally {
        setLoadingCountries(false);
        setLoadingCategories(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      level: '',
      country: '',
      fundingType: '',
      category: '',
      noEnglishCert: false,
      isVerified: false,
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => {
    if (k === 'noEnglishCert' || k === 'isVerified') return v === true;
    return v !== '';
  }).length;

  return (
    <div className="glass dark:glass-dark rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 mb-12 border border-white/20 dark:border-white/10 backdrop-blur-xl transition-all">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-gold/10 rounded-lg">
            <Filter className="w-5 h-5 text-brand-gold" />
          </div>
          <h2 className="text-xl font-bold text-navy dark:text-white tracking-tight">{t('common.filter')}</h2>
          {activeFiltersCount > 0 && (
            <span className="bg-brand-gold text-brand-navy text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-gray-500 hover:text-brand-gold flex items-center space-x-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>{locale === 'tj' ? 'Тоза кардан' : locale === 'ru' ? 'Очистить' : 'Clear'}</span>
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-navy"
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <AnimatePresence>
        {(!isMobile || isOpen) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Level Filter */}
            <div className="relative group">
              <label className="block text-xs font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-2">
                {t('common.level')}
              </label>
              <div className="relative">
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold appearance-none bg-white/50 dark:bg-black/20 backdrop-blur-sm cursor-pointer transition-all dark:text-white"
                >
                  <option value="">{t('filters.allLevels')}</option>
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {t(`filters.${level.toLowerCase()}`)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Country Filter */}
            <div className="relative group">
              <label className="block text-xs font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-2">
                {t('common.country')}
              </label>
              <div className="relative">
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  disabled={loadingCountries}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold appearance-none bg-white/50 dark:bg-black/20 backdrop-blur-sm cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed dark:text-white"
                >
                  <option value="">{loadingCountries ? (locale === 'tj' ? 'Бор шуда истодааст...' : locale === 'ru' ? 'Загрузка...' : 'Loading...') : t('filters.allCountries')}</option>
                  {countries.map((country) => (
                    <option key={country.name} value={country.name}>
                      {getLocalizedCountryName(country)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Funding Type Filter */}
            <div className="relative group">
              <label className="block text-xs font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-2">
                {t('common.funding')}
              </label>
              <div className="relative">
                <select
                  value={filters.fundingType}
                  onChange={(e) => handleFilterChange('fundingType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold appearance-none bg-white/50 dark:bg-black/20 backdrop-blur-sm cursor-pointer transition-all dark:text-white"
                >
                  <option value="">{t('filters.allFunding')}</option>
                  {fundingTypes.map((type) => (
                    <option key={type} value={type}>
                      {t(`filters.${type.toLowerCase()}`)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative group">
              <label className="block text-xs font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-2">
                {t('common.category')}
              </label>
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  disabled={loadingCategories}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold appearance-none bg-white/50 dark:bg-black/20 backdrop-blur-sm cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed dark:text-white"
                >
                  <option value="">{loadingCategories ? (locale === 'tj' ? 'Бор шуда истодааст...' : locale === 'ru' ? 'Загрузка...' : 'Loading...') : t('filters.allCategories')}</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {getLocalizedCategoryName(category)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No English Cert Checkbox */}
      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/10">
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.noEnglishCert || false}
            onChange={(e) => handleFilterChange('noEnglishCert', e.target.checked)}
            className="w-5 h-5 text-brand-gold focus:ring-brand-gold border-gray-300 rounded cursor-pointer"
          />
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-semibold text-navy dark:text-gray-300 group-hover:text-brand-gold transition-colors">
              {t('filters.noEnglishCert') || 'Show programs without IELTS/TOEFL requirement'}
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}

