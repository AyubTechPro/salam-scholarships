'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from '@/components/common/ImageWithFallback';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { getBlurDataURL, getSafeImageUrl } from '@/lib/image-utils';
import { Calendar, MapPin, Award, CheckCircle2, Clock, Heart, ShieldCheck, XCircle, AlertCircle, Zap, Eye, ArrowRight } from 'lucide-react';
import { useSavedPrograms } from '@/hooks/useSavedPrograms';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ru, type Locale } from 'date-fns/locale';
import { formatDistanceToNowTajik, formatSmartCountdown } from '@/lib/date-fns-tajik';
import HotDeadlineBadge from './HotDeadlineBadge';
import { LiveViewers } from '@/components/ui/LiveViewers';
import { Sparkles } from 'lucide-react';

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

  // Generate deterministic Match Score based on ID
  const matchScore = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash) % 25 + 75; // 75% to 99%
  }, [id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
      className="glass dark:glass-dark rounded-2xl transition-all overflow-hidden relative group hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_20px_40px_rgba(255,255,255,0.05)] border border-white/40 dark:border-white/10"
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
            
            <div className="absolute top-4 left-4 z-10">
              <LiveViewers programId={id} />
            </div>

            <div className="absolute bottom-4 right-4 z-10">
              <div className="relative flex items-center justify-center w-12 h-12 bg-navy/80 backdrop-blur-md rounded-full shadow-lg border border-white/10 group-hover:scale-110 transition-transform">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/20" />
                  <motion.circle 
                    cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                    strokeDasharray={125.6} 
                    initial={{ strokeDashoffset: 125.6 }}
                    whileInView={{ strokeDashoffset: 125.6 - (125.6 * matchScore) / 100 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                    className={matchScore > 85 ? "text-green-500" : "text-yellow-500"} 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-white">
                  <span className="text-[10px] font-black">{matchScore}%</span>
                </div>
              </div>
            </div>              <div className="absolute top-4 right-4 flex flex-col items-end space-y-2 z-10">
              <div className="flex items-center space-x-2">
                {isVerified && (
                  <div className="bg-brand-gold/90 backdrop-blur-md text-brand-navy px-3 py-1.5 rounded-full flex items-center space-x-1 text-xs font-bold shadow-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('common.verified')}</span>
                  </div>
                )}
                {!requiresEnglishCert && (
                  <div className="bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center space-x-1 text-xs font-bold shadow-lg">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t('opportunities.noLanguageCert') || 'No IELTS/TOEFL'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Category & Level */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <span className="text-xs font-bold text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded-md">
                {getCategoryLabel(category)}
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-md border border-gray-200 dark:border-white/10">
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
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md">
                {getFundingLabel(fundingType)}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-black text-navy dark:text-white mb-3 line-clamp-2 group-hover:text-brand-gold transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
            {description}
          </p>

    
          {/* Meta Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4 mr-2.5 text-brand-gold" />
              <span>{country}</span>
            </div>
            <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-2.5 text-brand-gold" />
              <span>{t('common.deadline')}: {new Date(deadline).toLocaleDateString(locale)}</span>
            </div>
          </div>



          {/* Deadline Countdown */}
          <div
            className={`flex items-center justify-between p-3.5 rounded-xl transition-colors ${
              isDeadlineSoon
                ? 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20'
                : 'bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Clock
                className={`w-4 h-4 ${
                  isExpired || countdown.daysLeft === 0
                    ? 'text-red-600 dark:text-red-400'
                    : isDeadlineSoon
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              />
              <span
                className={`text-xs font-bold tracking-wide ${
                  isExpired || countdown.daysLeft === 0
                    ? 'text-red-600 dark:text-red-400'
                    : isDeadlineSoon
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {timeRemaining}
              </span>
            </div>
            {isDeadlineSoon && (
              <motion.div 
                animate={{ opacity: [1, 0.5, 1] }} 
                transition={{ duration: 1.5, repeat: Infinity }}
                className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-md"
              >
                URGENT
              </motion.div>
            )}
            <span className="text-xs font-black uppercase tracking-wider text-brand-gold group-hover:translate-x-1 transition-transform flex items-center">
              {t('common.learnMore')} <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

