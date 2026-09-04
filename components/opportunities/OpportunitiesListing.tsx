'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBusinessRules } from '@/hooks/useBusinessRules';
import SmartFilter from '@/components/opportunities/SmartFilter';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import FeaturedOpportunityCard from '@/components/opportunities/FeaturedOpportunityCard';
import MagicSearchBar from '@/components/common/MagicSearchBar';
import { Search, MapPin, Target, CheckCircle2, SlidersHorizontal, Loader2, Award, Calendar, GraduationCap, X, ChevronRight, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

type Opportunity = {
  id: string;
  title: string;
  titleRu?: string | null;
  titleTj?: string | null;
  description: string;
  descriptionRu?: string | null;
  descriptionTj?: string | null;
  level: 'SCHOOL' | 'BACHELOR' | 'MASTER' | 'PHD';
  category: 'SCHOLARSHIP' | 'FORUM' | 'SUMMER_SCHOOL' | 'CONFERENCE';
  fundingType: 'FULL' | 'PARTIAL' | 'NONE';
  country: string;
  deadline: string;
  isVerified: boolean;
  imageUrl?: string | null;
};

interface OpportunitiesListingProps {
  initialCategory?: string;
  initialCountry?: string;
  initialLevel?: string;
  categoryName?: string;
}

export default function OpportunitiesListing({
  initialCategory,
  initialCountry,
  initialLevel,
  categoryName
}: OpportunitiesListingProps = {}) {
  const t = useTranslations('hero');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { data: businessRules } = useBusinessRules();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    level: initialLevel || searchParams.get('level') || '',
    country: initialCountry || searchParams.get('country') || '',
    fundingType: '',
    category: initialCategory || searchParams.get('category') || '',
    search: '',
    noEnglishCert: false,
    isVerified: false,
  });
  const [searchInput, setSearchInput] = useState(filters.search);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchOpportunities = useCallback(async (filterParams: typeof filters, page: number = 1, append: boolean = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const limit = businessRules?.paginationLimits?.opportunities ?? 12;

      const params = new URLSearchParams();
      if (filterParams.level) params.append('level', filterParams.level);
      // STRICT category filtering - exact enum match only
      if (filterParams.category) params.append('category', filterParams.category);
      if (filterParams.fundingType) params.append('fundingType', filterParams.fundingType);
      if (filterParams.country) params.append('country', filterParams.country);
      if (filterParams.search) params.append('search', filterParams.search);
      if (filterParams.noEnglishCert) params.append('noEnglishCert', 'true');
      if (filterParams.isVerified) params.append('isVerified', 'true');
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await fetch(`/api/opportunities?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        if (append) {
          setOpportunities((prev) => [...prev, ...result.data]);
        } else {
          setOpportunities(result.data);
        }
        setPagination(result.pagination);
      } else {
        setError(result.error || (locale === 'tj' ? 'Бор кардани имкониятҳо муяссар нашуд' : locale === 'ru' ? 'Не удалось загрузить возможности' : 'Failed to load opportunities'));
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError(locale === 'tj' ? 'Бор кардани имкониятҳо муяссар нашуд. Лутфан, баъдтар кӯшиш кунед.' : locale === 'ru' ? 'Не удалось загрузить возможности. Пожалуйста, попробуйте позже.' : 'Failed to load opportunities. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [businessRules?.paginationLimits?.opportunities, locale]);

  useEffect(() => {
    fetchOpportunities(filters, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(prev => {
      const finalFilters = {
        ...prev,
        ...newFilters,
        search: prev.search
      };
      // Reset pagination on filter change
      setPagination((p) => ({ ...p, page: 1 }));
      // Fetch specifically with the new guaranteed state
      fetchOpportunities(finalFilters, 1);
      return finalFilters;
    });
  }, [fetchOpportunities]);

  const handleSearch = (query: string) => {
    setSearchInput(query);
    const newFilters = { ...filters, search: query };
    setFilters(newFilters);
    setPagination((p) => ({ ...p, page: 1 }));
    fetchOpportunities(newFilters, 1);
  };

  // AI Magic Search removed for performance/accuracy
  // Used standard instant query search instead

  // Infinite scroll handler
  const loadMore = useCallback(() => {
    if (!loadingMore && pagination.hasNextPage) {
      fetchOpportunities(filters, pagination.page + 1, true);
    }
  }, [fetchOpportunities, filters, pagination.page, pagination.hasNextPage, loadingMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasNextPage && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, pagination.hasNextPage, loadingMore]);

  const getLocalizedContent = (opp: Opportunity) => {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-dark">
      {/* Cinematic Hero Hub - Full width out at the top */}
      {!categoryName && (
        <div className="relative bg-navy overflow-hidden pt-36 pb-40 px-4 sm:px-6 lg:px-8 border-b border-navy-light">
          {/* Stunning Background Image */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop")' }}
          />
          {/* Dark Premium Gradient Overlay */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-navy/90 via-navy/80 to-navy" />

          {/* Animated Background Elements */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-brand-gold/20 blur-[120px]" />
            <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/30 blur-[100px]" />
          </div>

          <div className="relative max-w-5xl mx-auto text-center z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-heading font-extrabold text-white mb-6 leading-tight tracking-tight"
            >
              {t('title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-blue-100/90 max-w-3xl mx-auto mb-12 font-medium"
            >
              {t('subtitle')}
            </motion.p>
          </div>
        </div>
      )}

      {/* Floating Interactive Hub (Search & Filters) */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 ${!categoryName ? '-mt-24' : 'pt-32'}`}>

        {/* Unified Command Center */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 max-w-5xl mx-auto bg-white shadow-2xl rounded-3xl ring-1 ring-black/5 overflow-hidden flex flex-col"
        >
          {/* Top Row: Big Search Input */}
          <div className="px-4 sm:px-6 pt-2">
            <MagicSearchBar
              value={searchInput}
              onChange={(v) => setSearchInput(v)}
              onSearch={(query) => handleSearch(query)}
              placeholder={t('searchPlaceholder')}
              showSparkleHint={false}
              locale={locale}
              className="w-full bg-transparent"
            />
          </div>

          {/* Bottom Row: Smart Filters Component */}
          <div className="px-6 pb-6 pt-4 bg-slate-50/50">
            <SmartFilter
              onFilterChange={handleFilterChange}
              syncFilters={{
                level: filters.level,
                country: filters.country,
                fundingType: filters.fundingType,
                category: filters.category,
              }}
            />
          </div>
        </motion.div>

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-6 text-gray-600">
            <p className="font-semibold">
              {(() => {
                const translated = tCommon('found_count', { count: pagination.total });
                // Split by the number to insert styled version
                const parts = translated.split(String(pagination.total));
                return parts.map((part, index) =>
                  index === parts.length - 1 ? (
                    <span key={index}>{part}</span>
                  ) : (
                    <span key={index}>
                      {part}
                      <span className="text-gold font-bold">{pagination.total}</span>
                    </span>
                  )
                );
              })()}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-gold animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={() => fetchOpportunities(filters, pagination.page)}
              className="btn-premium-gold px-6 py-3"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Opportunities Grid */}
        {!loading && !error && (
          <>
            {opportunities.length > 0 ? (
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {opportunities.map((opportunity) => {
                    const localized = getLocalizedContent(opportunity);
                    return (
                      <OpportunityCard
                        key={opportunity.id}
                        id={opportunity.id}
                        title={localized.title}
                        description={localized.description}
                        level={opportunity.level}
                        category={opportunity.category}
                        fundingType={opportunity.fundingType}
                        country={opportunity.country}
                        deadline={new Date(opportunity.deadline)}
                        isVerified={opportunity.isVerified}
                        imageUrl={opportunity.imageUrl || undefined}
                      />
                    );
                  })}
                </div>

                {/* Infinite Scroll Loader */}
                {pagination.hasNextPage && (
                  <div ref={observerTarget} className="py-8">
                    {loadingMore ? (
                      <div className="flex justify-center items-center">
                        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                        <span className="ml-3 text-gray-600 dark:text-gray-400">
                          {locale === 'tj' ? 'Бор кардани имкониятҳои бештар...' : locale === 'ru' ? 'Загрузка дополнительных возможностей...' : 'Loading more opportunities...'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 text-sm">
                        {locale === 'tj' ? 'Имкониятҳои бештарро дидан' : locale === 'ru' ? 'Прокрутите вниз, чтобы увидеть больше' : 'Scroll down for more'}
                      </div>
                    )}
                  </div>
                )}

                {/* End of Results */}
                {!pagination.hasNextPage && opportunities.length > 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {locale === 'tj' ? 'Ҳамаи имкониятҳо нишон дода шуданд' : locale === 'ru' ? 'Все возможности показаны' : 'All opportunities loaded'}
                  </div>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gold/10 rounded-full flex items-center justify-center">
                    <Search className="w-12 h-12 text-gold" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy mb-3">
                    {tCommon('noResults') !== 'common.noResults' ? tCommon('noResults') : (locale === 'tj'
                      ? 'Имкониятҳо ёфт нашуд'
                      : locale === 'ru'
                        ? 'Возможности не найдены'
                        : 'No Opportunities Found')}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {tCommon('tryAdjustingFilters') !== 'common.tryAdjustingFilters' ? tCommon('tryAdjustingFilters') : (locale === 'tj'
                      ? 'Бо тағйири филтрҳо ё калимаҳои ҷустуҷӯ кӯшиш кунед'
                      : locale === 'ru'
                        ? 'Попробуйте изменить фильтры или поисковые запросы'
                        : 'Try adjusting your filters or search terms')}
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setSearchInput('');
                        setFilters({
                          level: '',
                          country: '',
                          fundingType: '',
                          category: '',
                          search: '',
                          noEnglishCert: false,
                          isVerified: false,
                        });
                        fetchOpportunities({
                          level: '',
                          country: '',
                          fundingType: '',
                          category: '',
                          search: '',
                          noEnglishCert: false,
                          isVerified: false,
                        }, 1);
                      }}
                      className="w-full btn-premium-gold px-6 py-3"
                    >
                      {tCommon('clearFilters') !== 'common.clearFilters' ? tCommon('clearFilters') : (locale === 'tj' ? 'Тоза кардани филтрҳо' : locale === 'ru' ? 'Очистить фильтры' : 'Clear All Filters')}
                    </button>
                    <a
                      href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_SUPPORT || 'ayub_it_tj'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-2 w-full btn-premium px-6 py-3"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>
                        {tCommon('contactTelegram') !== 'common.contactTelegram' ? tCommon('contactTelegram') : (locale === 'tj'
                          ? 'Бо мо дар Telegram тамос гиред'
                          : locale === 'ru'
                            ? 'Свяжитесь с нами в Telegram'
                            : 'Contact Us on Telegram')}
                      </span>
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

