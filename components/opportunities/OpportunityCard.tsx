'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { getBlurDataURL, getSafeImageUrl } from '@/lib/image-utils';
import { Calendar, MapPin, Award, CheckCircle2, Clock, Heart, ShieldCheck, XCircle, AlertCircle, Zap, Eye } from 'lucide-react';
import { useSavedPrograms } from '@/hooks/useSavedPrograms';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ru, type Locale } from 'date-fns/locale';
import { formatDistanceToNowTajik, formatSmartCountdown } from '@/lib/date-fns-tajik';
import HotDeadlineBadge from './HotDeadlineBadge';

type ProgramLevel = 'SCHOOL' | 'BACHELOR' | 'MASTER' | 'PHD';
type FundingType = 'FULL' | 'PARTIAL' | 'NONE';
type ProgramCategory = 'SCHOLARSHIP' | 'FORUM' | 'SUMMER_SCHOOL' | 'CONFERENCE';

interface OpportunityCardProps {
  id: string;
  title: string;
  description: string;
  level: ProgramLevel;
  category: ProgramCategory;
  fundingType: FundingType;
  country: string;
  deadline: Date;
  isVerified?: boolean;
  imageUrl?: string;
  requiresEnglishCert?: boolean;
}

const dateLocales: Record<string, Locale> = {
  en: enUS,
  ru: ru,
  tj: enUS, // Fallback to English for Tajik
};

export default function OpportunityCard({
  id,
  title,
  description,
  level,
  category,
  fundingType,
  country,
  deadline,
  isVerified = false,
  imageUrl,
  requiresEnglishCert = true,
}: OpportunityCardProps) {
  const genericFallback = 'https://picsum.photos/seed/scholarship/800/600';
  const displayImage = (!imageUrl || imageUrl === genericFallback) 
    ? `https://picsum.photos/seed/${id}/800/600` 
    : imageUrl;
  const t = useTranslations();
  const locale = useLocale();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const { isSaved: checkSaved, refetch } = useSavedPrograms({ enabled: isAuthenticated });
  const isSaved = isAuthenticated ? checkSaved(id) : false;
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (saving) return;
    setSaving(true);

    try {
      if (isSaved) {
        // Remove from saved
        const response = await fetch(`/api/user/saved-programs?programId=${id}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (result.success) {
          refetch();
        }
      } else {
        // Add to saved
        const response = await fetch('/api/user/saved-programs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ programId: id }),
        });
        const result = await response.json();
        if (result.success) {
          refetch();
        }
      }
    } catch (error) {
      console.error('Error saving program:', error);
    } finally {
      setSaving(false);
    }
  };

  const getLevelLabel = (level: ProgramLevel) => {
    const levelKey = level.toLowerCase();
    try {
      return t(`filters.${levelKey}`);
    } catch {
      return level;
    }
  };

  const getCategoryLabel = (category: ProgramCategory) => {
    let categoryKey = category.toLowerCase().replace('_', '');
    if (category === 'SUMMER_SCHOOL') categoryKey = 'summerSchool';
    try {
      return t(`filters.${categoryKey}`);
    } catch {
      return category;
    }
  };

  const getFundingLabel = (funding: FundingType) => {
    if (funding === 'NONE') return '';
    const fundingKey = funding.toLowerCase();
    try {
      return t(`filters.${fundingKey}`);
    } catch {
      return funding;
    }
  };

  // Smart countdown with urgency logic
  const countdown = formatSmartCountdown(deadline, locale);
  const timeRemaining = countdown.text;
  const isExpired = countdown.isExpired;
  const isDeadlineSoon = countdown.isUrgent;

  // Generate random stable viewers based on ID
  const viewCount = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash) % 45 + 15; // 15 to 60 viewers
  }, [id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="glass dark:glass-dark rounded-xl transition-all overflow-hidden relative group hover:-translate-y-1 hover:shadow-2xl hover:border-white/30"
    >
      <HotDeadlineBadge deadline={deadline} />
      <Link href={`/${locale}/opportunities/${id}`}>
        {/* Image */}
        {imageUrl && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={getSafeImageUrl(displayImage)!}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              placeholder="blur"
              blurDataURL={getBlurDataURL()}
            />
            


            <div className="absolute top-3 right-3 flex flex-col items-end space-y-2 z-10">
              <div className="flex items-center space-x-2">
                {isVerified && (
                  <div className="bg-gold text-white px-2 py-1 rounded-full flex items-center space-x-1 text-xs font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{t('common.verified')}</span>
                  </div>
                )}
                {!requiresEnglishCert && (
                  <div className="bg-green-600 text-white px-2 py-1 rounded-full flex items-center space-x-1 text-xs font-semibold border border-green-700">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{t('opportunities.noLanguageCert') || 'No IELTS/TOEFL Required'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Category & Level */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-xs font-semibold text-gold bg-gold bg-opacity-10 px-2 py-1 rounded">
                {getCategoryLabel(category)}
              </span>
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {getLevelLabel(level)}
              </span>
              {!requiresEnglishCert && (
                <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{t('opportunities.noLanguageCert') || 'No IELTS/TOEFL'}</span>
                </span>
              )}
            </div>
            {fundingType !== 'NONE' && (
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                {getFundingLabel(fundingType)}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-navy dark:text-white mb-2 line-clamp-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
            {description}
          </p>

    
          {/* Meta Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gold" />
              <span>{country}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gold" />
              <span>{t('common.deadline')}: {new Date(deadline).toLocaleDateString(locale)}</span>
            </div>
          </div>



          {/* Deadline Countdown */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg ${
              isDeadlineSoon
                ? 'bg-red-50 border border-red-200'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Clock
                className={`w-4 h-4 ${
                  isExpired || countdown.daysLeft === 0
                    ? 'text-red-600'
                    : isDeadlineSoon
                    ? 'text-yellow-600'
                    : 'text-gray-600'
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isExpired || countdown.daysLeft === 0
                    ? 'text-red-600'
                    : isDeadlineSoon
                    ? 'text-yellow-600'
                    : 'text-gray-600'
                }`}
              >
                {timeRemaining}
              </span>
            </div>
            <span className="text-xs font-semibold text-gold">
              {t('common.learnMore')} →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

