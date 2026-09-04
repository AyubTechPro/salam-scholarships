'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import Image from '@/components/common/ImageWithFallback';
import { X, Quote, Award, MapPin, GraduationCap, Sparkles, Loader2, Filter } from 'lucide-react';
import UIDictionaryText from '@/components/common/UIDictionaryText';

type Achievement = {
  id: string;
  studentName: string;
  universityName: string;
  countryTJ: string;
  countryRU: string;
  countryEN: string;
  programNameTJ: string;
  programNameRU: string;
  programNameEN: string;
  studentImage: string;
  testimonialTJ: string;
  testimonialRU: string;
  testimonialEN: string;
  academicYear: string;
  category: 'BACHELOR' | 'MASTER' | 'PHD';
  createdAt?: string | Date;
};

export default function AchievementsWall() {
  const t = useTranslations('home.success');
  const locale = useLocale();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [allYears, setAllYears] = useState<string[]>([]);

  const fetchAllYears = useCallback(async () => {
    try {
      // Fetch all achievements just to get unique years
      const response = await fetch('/api/achievements?active=true&limit=1000');
      const result = await response.json();
      if (result.success && result.data) {
        const years = Array.from(new Set(result.data.map((a: Achievement) => a.academicYear))).sort((a, b) => {
          const yearA = parseInt(String(a).split('-')[0]);
          const yearB = parseInt(String(b).split('-')[0]);
          return yearB - yearA;
        }) as string[];
        setAllYears(years);
      }
    } catch (error) {
      console.error('Error fetching years:', error);
    }
  }, []);

  const fetchAchievements = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');
      params.append('active', 'true');
      if (selectedYear !== 'all') params.append('year', selectedYear);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const response = await fetch(`/api/achievements?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        // Filter out achievements without required locale-specific fields
        const filtered = result.data.filter((achievement: Achievement) => {
          if (locale === 'tj') {
            return achievement.countryTJ && achievement.programNameTJ && achievement.testimonialTJ;
          } else if (locale === 'ru') {
            return achievement.countryRU && achievement.programNameRU && achievement.testimonialRU;
          } else {
            return achievement.countryEN && achievement.programNameEN && achievement.testimonialEN;
          }
        });
        setAchievements(filtered);
        setPagination(result.pagination || {
          page,
          total: result.pagination?.total || filtered.length,
          totalPages: result.pagination?.totalPages || 1,
          hasNextPage: result.pagination?.hasNextPage || false,
          hasPrevPage: result.pagination?.hasPrevPage || false,
        });
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedCategory, locale]);

  useEffect(() => {
    fetchAchievements(1);
    // Fetch all years separately for filter dropdown
    fetchAllYears();
  }, [fetchAchievements, fetchAllYears]);

  useEffect(() => {
    // Refetch when filters change
    fetchAchievements(1);
  }, [selectedYear, selectedCategory, fetchAchievements]);

  const handlePageChange = (newPage: number) => {
    fetchAchievements(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (year: string, category: string) => {
    setSelectedYear(year);
    setSelectedCategory(category);
    setPagination({ ...pagination, page: 1 });
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    if (category === 'BACHELOR') {
      return locale === 'tj' ? 'Бакалавр' : locale === 'ru' ? 'Бакалавриат' : 'Bachelor';
    } else if (category === 'MASTER') {
      return locale === 'tj' ? 'Магистр' : locale === 'ru' ? 'Магистратура' : 'Master';
    } else if (category === 'PHD') {
      return locale === 'tj' ? 'Доктор' : locale === 'ru' ? 'Докторантура' : 'PhD';
    }
    return category;
  };

  // Get locale-specific fields (STRICT - no fallbacks)
  const getLocalizedField = (achievement: Achievement, field: 'country' | 'programName' | 'testimonial'): string => {
    if (locale === 'tj') {
      if (field === 'country') return achievement.countryTJ;
      if (field === 'programName') return achievement.programNameTJ;
      return achievement.testimonialTJ;
    } else if (locale === 'ru') {
      if (field === 'country') return achievement.countryRU;
      if (field === 'programName') return achievement.programNameRU;
      return achievement.testimonialRU;
    } else {
      if (field === 'country') return achievement.countryEN;
      if (field === 'programName') return achievement.programNameEN;
      return achievement.testimonialEN;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <section className="py-24 bg-gradient-to-br from-navy to-navy-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Sparkles className="w-20 h-20 text-gold mx-auto mb-6" />
            <h2 className="text-4xl font-heading font-bold mb-4">
              {locale === 'tj' ? 'Ҳикояи муваффақияти навбатии мо метавонад аз шумо бошад!' :
               locale === 'ru' ? 'Наша следующая история успеха может быть вашей!' :
               'Our next success story could be yours!'}
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {locale === 'tj' ? 'Мо донишҷӯёни зиёдеро кӯмак кардем, то орзуҳои таълимӣ ба амал оранд. Ба зудӣ баргардед, то дастовардҳои онҳоро бубинед.' :
               locale === 'ru' ? 'Мы помогли многим студентам осуществить свои образовательные мечты. Скоро вернитесь, чтобы увидеть их достижения.' :
               'We\'ve helped many students achieve their educational dreams. Check back soon to see their achievements.'}
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-br from-navy to-navy-dark text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 mb-4">
            <Award className="w-6 h-6 text-gold" />
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">
              {t('badge')}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-white">
            <UIDictionaryText 
              dictKey="achievements.title" 
              fallback={locale === 'tj' ? 'Таърихҳои муваффақият' : locale === 'ru' ? 'Истории успеха' : 'Success Stories'} 
            />
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 flex flex-wrap items-center justify-center gap-4"
        >
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/20">
            <Filter className="w-5 h-5 text-gold" />
            <span className="text-sm font-semibold text-white mr-2">
              {locale === 'tj' ? 'Сол:' : locale === 'ru' ? 'Год:' : 'Year:'}
            </span>
            <select
              value={selectedYear}
              onChange={(e) => handleFilterChange(e.target.value, selectedCategory)}
              className="bg-transparent text-white border-none outline-none cursor-pointer text-sm"
            >
              <option value="all" className="bg-navy">
                {locale === 'tj' ? 'Ҳамаи солҳо' : locale === 'ru' ? 'Все годы' : 'All Years'}
              </option>
              {allYears.map((year) => (
                <option key={year} value={year} className="bg-navy">
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/20">
            <GraduationCap className="w-5 h-5 text-gold" />
            <span className="text-sm font-semibold text-white mr-2">
              {locale === 'tj' ? 'Категория:' : locale === 'ru' ? 'Категория:' : 'Category:'}
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => handleFilterChange(selectedYear, e.target.value)}
              className="bg-transparent text-white border-none outline-none cursor-pointer text-sm"
            >
              <option value="all" className="bg-navy">
                {locale === 'tj' ? 'Ҳамаи категорияҳо' : locale === 'ru' ? 'Все категории' : 'All Categories'}
              </option>
              <option value="BACHELOR" className="bg-navy">
                {locale === 'tj' ? 'Бакалавр' : locale === 'ru' ? 'Бакалавриат' : 'Bachelor'}
              </option>
              <option value="MASTER" className="bg-navy">
                {locale === 'tj' ? 'Магистр' : locale === 'ru' ? 'Магистратура' : 'Master'}
              </option>
              <option value="PHD" className="bg-navy">
                {locale === 'tj' ? 'Доктор' : locale === 'ru' ? 'Докторантура' : 'PhD'}
              </option>
            </select>
          </div>
        </motion.div>

        {/* Achievements Grid */}
        {achievements.length === 0 && !loading ? (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 text-gold/50 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {locale === 'tj' ? 'Дар ин категория дастовардҳо ёфт нашуд' :
               locale === 'ru' ? 'Достижения в этой категории не найдены' :
               'No achievements found in this category'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-gold/20 hover:border-gold/40 transition-all cursor-pointer group"
                  onClick={() => setSelectedAchievement(index)}
                >
                  <div className="relative h-64">
                    <Image
                      src={achievement.studentImage}
                      alt={achievement.studentName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/50 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <span className="bg-gold text-navy px-3 py-1 rounded-full text-xs font-semibold">
                        {getCategoryLabel(achievement.category)}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {achievement.studentName}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <GraduationCap className="w-4 h-4" />
                        <span>{achievement.universityName}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-300 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{getLocalizedField(achievement, 'country')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Quote className="w-5 h-5 text-gold" />
                      <span className="text-gold text-sm font-semibold">
                        {getLocalizedField(achievement, 'programName')}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                      {getLocalizedField(achievement, 'testimonial')}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="text-xs text-gray-400">
                        {locale === 'tj' ? 'Соли таълимӣ:' : locale === 'ru' ? 'Учебный год:' : 'Academic Year:'} {achievement.academicYear}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-gold/20 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >
                  {locale === 'tj' ? 'Қабли' : locale === 'ru' ? 'Предыдущая' : 'Previous'}
                </button>
                <span className="text-white text-sm">
                  {locale === 'tj' ? `Саҳифа ${pagination.page} аз ${pagination.totalPages}` :
                   locale === 'ru' ? `Страница ${pagination.page} из ${pagination.totalPages}` :
                   `Page ${pagination.page} of ${pagination.totalPages}`}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-gold/20 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >
                  {locale === 'tj' ? 'Оянда' : locale === 'ru' ? 'Следующая' : 'Next'}
                </button>
              </div>
            )}
          </>
        )}

        {/* Achievement Detail Modal */}
        <AnimatePresence>
          {selectedAchievement !== null && achievements[selectedAchievement] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedAchievement(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-navy rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="absolute top-4 right-4 z-10 text-white hover:text-gold transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                {selectedAchievement !== null && achievements[selectedAchievement] && (
                  <>
                    <div className="relative h-96">
                      <Image
                        src={achievements[selectedAchievement].studentImage}
                        alt={achievements[selectedAchievement].studentName}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/70 to-transparent" />
                      <div className="absolute bottom-8 left-8 right-8">
                        <h2 className="text-3xl font-bold text-white mb-2">
                          {achievements[selectedAchievement].studentName}
                        </h2>
                        <div className="flex items-center space-x-4 text-gray-300">
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="w-5 h-5" />
                            <span>{achievements[selectedAchievement].universityName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5" />
                            <span>{getLocalizedField(achievements[selectedAchievement], 'country')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex items-center space-x-2 mb-6">
                        <Award className="w-6 h-6 text-gold" />
                        <span className="text-gold font-semibold text-lg">
                          {getLocalizedField(achievements[selectedAchievement], 'programName')}
                        </span>
                        <span className="bg-gold/20 text-gold px-3 py-1 rounded-full text-xs font-semibold ml-auto">
                          {getCategoryLabel(achievements[selectedAchievement].category)}
                        </span>
                      </div>
                      <div className="bg-white/5 rounded-xl p-6 mb-6">
                        <Quote className="w-8 h-8 text-gold mb-4" />
                        <p className="text-gray-300 text-lg leading-relaxed">
                          {getLocalizedField(achievements[selectedAchievement], 'testimonial')}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-white/10">
                        <span className="text-sm text-gray-400">
                          {locale === 'tj' ? 'Соли таълимӣ:' : locale === 'ru' ? 'Учебный год:' : 'Academic Year:'} {achievements[selectedAchievement].academicYear}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
