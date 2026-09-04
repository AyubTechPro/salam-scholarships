'use client';

import { useSavedPrograms } from '@/hooks/useSavedPrograms';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Bookmark, GraduationCap, MapPin, Calendar, ExternalLink, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, ru, type Locale } from 'date-fns/locale';
import Image from '@/components/common/ImageWithFallback';
import { getSafeImageUrl } from '@/lib/image-utils';

type SavedProgram = {
  id: string;
  programId: string;
  createdAt: string;
  program: {
    id: string;
    title: string;
    titleRu?: string | null;
    titleTj?: string | null;
    country: string;
    imageUrl?: string | null;
    deadline: string;
    level: string;
    category: string;
    fundingType: string;
  };
};

const dateLocales: Record<string, Locale> = {
  en: enUS,
  ru: ru,
  tj: enUS, // Fallback to English for Tajik
};

export default function SavedOpportunitiesSection() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { savedPrograms: rawSaved, loading, refetch } = useSavedPrograms();
  const savedPrograms = rawSaved as SavedProgram[];

  const handleRemove = async (programId: string) => {
    try {
      const response = await fetch(`/api/user/saved-programs?programId=${programId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        refetch();
      }
    } catch (error) {
      console.error('Error removing saved program:', error);
    }
  };

  const getTitle = (program: SavedProgram['program']) => {
    return (locale === 'ru' && program.titleRu) || (locale === 'tj' && program.titleTj) || program.title;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP', { locale: dateLocales[locale] });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  if (savedPrograms.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100"
      >
        <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-heading font-bold text-brand-navy mb-2">
          {locale === 'tj' ? 'Имкониятҳои захирашуда' : 
           locale === 'ru' ? 'Сохраненные возможности' : 
           'No Saved Opportunities'}
        </h3>
        <p className="text-gray-600 mb-6">
          {locale === 'tj' ? 'Шумо ҳанӯз имкониятеро захира накардед. Бозгашт ва имкониятҳоро ба қайд гиред!' :
           locale === 'ru' ? 'Вы еще не сохранили возможности. Вернитесь и сохраните возможности!' :
           'You haven\'t saved any opportunities yet. Go back and bookmark opportunities you\'re interested in!'}
        </p>
        <Link
          href={`/${locale}/opportunities`}
          className="inline-flex items-center gap-x-2 bg-brand-gold text-brand-navy px-6 py-3 rounded-md font-heading font-bold hover:shadow-lg transition-all"
        >
          <ExternalLink className="w-5 h-5" />
          <span>{locale === 'tj' ? 'Дидани имкониятҳо' : locale === 'ru' ? 'Просмотреть возможности' : 'Browse Opportunities'}</span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold text-brand-navy flex items-center gap-x-2">
          <Bookmark className="w-6 h-6 text-brand-gold" />
          <span>
            {locale === 'tj' ? 'Имкониятҳои захирашуда' :
             locale === 'ru' ? 'Сохраненные возможности' :
             'My Saved Opportunities'}
          </span>
        </h2>
        <span className="text-sm text-gray-500 font-sans">
          {savedPrograms.length} {locale === 'tj' ? 'имконият' : locale === 'ru' ? 'возможности' : 'opportunities'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedPrograms.map((saved, index) => (
          <motion.div
            key={saved.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all"
          >
            <Link
              href={`/${locale}/opportunities/${saved.program.id}`}
              className="block"
            >
              <div className="flex">
                {saved.program.imageUrl && (
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={getSafeImageUrl(saved.program.imageUrl)!}
                      alt={getTitle(saved.program)}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                )}
                <div className="flex-1 p-4">
                  <h3 className="font-heading font-bold text-brand-navy mb-2 line-clamp-2 text-sm">
                    {getTitle(saved.program)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-x-1">
                      <MapPin className="w-3 h-3 text-brand-gold" />
                      <span>{saved.program.country}</span>
                    </div>
                    <div className="flex items-center gap-x-1">
                      <GraduationCap className="w-3 h-3 text-brand-gold" />
                      <span className="uppercase">{saved.program.level}</span>
                    </div>
                    <div className="flex items-center gap-x-1">
                      <Calendar className="w-3 h-3 text-brand-gold" />
                      <span>{formatDate(saved.program.deadline)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRemove(saved.programId);
              }}
              className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              title={locale === 'tj' ? 'Хазв кардан' : locale === 'ru' ? 'Удалить' : 'Remove'}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

