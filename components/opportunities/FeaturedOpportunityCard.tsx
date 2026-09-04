'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from '@/components/common/ImageWithFallback';
import { motion } from 'framer-motion';
import { getBlurDataURL, getSafeImageUrl } from '@/lib/image-utils';
import { Calendar, MapPin, Award, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Eye } from 'lucide-react';
import React from 'react';
import { formatSmartCountdown } from '@/lib/date-fns-tajik';

interface FeaturedCardProps {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  fundingType: string;
  country: string;
  deadline: Date;
  isVerified?: boolean;
  imageUrl?: string;
  requiresEnglishCert?: boolean;
}

export default function FeaturedOpportunityCard({
  id, title, description, level, category, fundingType, country, deadline, isVerified, imageUrl, requiresEnglishCert
}: FeaturedCardProps) {
  const locale = useLocale();
  const countdown = formatSmartCountdown(deadline, locale);
  
  const viewCount = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash) % 80 + 120; // 120+ viewers for featured
  }, [id]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl overflow-hidden glass dark:glass-dark border border-brand-gold/30 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_60px_-15px_rgba(212,175,55,0.25)] transition-shadow duration-500 flex flex-col lg:flex-row group cursor-pointer w-full mb-12"
    >
      <Link href={`/${locale}/opportunities/${id}`} className="absolute inset-0 z-20" aria-label="View Opportunity" />
      
      {/* Image Side */}
      <div className="relative w-full lg:w-1/2 h-72 lg:h-auto overflow-hidden">
        {imageUrl ? (
          <Image
            src={getSafeImageUrl(imageUrl)!}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-1000"
            sizes="(max-width: 1024px) 100vw, 50vw"
            placeholder="blur"
            blurDataURL={getBlurDataURL()}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-navy to-navy-dark" />
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
        
        <div className="absolute top-5 left-5 z-30 overflow-hidden rounded-lg p-[1px] bg-gradient-to-r from-red-500 to-amber-500 shadow-xl">
          <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-[7px] flex items-center space-x-2 text-xs font-black uppercase text-white tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{locale === 'tj' ? 'Беҳтарин Интихоб' : locale === 'ru' ? 'Топ Выбор' : 'Top Pick'}</span>
          </div>
        </div>
        
        <div className="absolute bottom-5 left-5 z-30">
           <div className="bg-black/50 backdrop-blur-md text-white px-4 py-2 flex items-center space-x-2 border-l-4 border-red-500 shadow-xl">
             <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
             </span>
             <Eye className="w-4 h-4 text-gray-300" />
             <span className="font-semibold text-[13px] tracking-wide text-gray-100">{viewCount} {locale === 'tj' ? 'нафар инро дидаанд' : locale === 'ru' ? 'человек посмотрели' : 'people viewed'}</span>
           </div>
        </div>
      </div>

      {/* Content Side */}
      <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-white/95 dark:bg-navy/95 backdrop-blur-sm relative z-10 border-l border-white/20 dark:border-white/5">
        <div className="flex items-center space-x-3 flex-wrap gap-y-3 mb-6">
           {isVerified && (
             <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700/30 px-3 py-1.5 rounded-lg flex items-center shadow-sm">
               <CheckCircle2 className="w-4 h-4 mr-1.5" /> {locale === 'tj' ? 'Salam Scholarships Кафолат медиҳад' : 'Salam Scholarships Guaranteed'}
             </span>
           )}
           {!requiresEnglishCert && (
             <span className="text-xs font-bold text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/30 border border-rose-300 dark:border-rose-700/30 px-3 py-1.5 rounded-lg flex items-center shadow-sm">
               <ShieldCheck className="w-4 h-4 mr-1.5" /> {locale === 'tj' ? 'Бе Сертификати Забон' : 'No IELTS'}
             </span>
           )}
           {fundingType !== 'NONE' && (
             <span className="text-xs font-bold text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700/30 px-3 py-1.5 rounded-lg flex items-center shadow-sm">
               <Award className="w-4 h-4 mr-1.5" /> {locale === 'tj' ? 'Пурра Маблағгузорӣ мешавад' : 'Fully Funded'}
             </span>
           )}
        </div>

        <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-gray-900 dark:text-white mb-5 leading-tight group-hover:text-brand-gold transition-colors duration-300">
          {title}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8 line-clamp-3 text-lg leading-relaxed">
          {description}
        </p>

        <div className="mt-auto pt-6 border-t border-gray-200 dark:border-navy-lighter flex flex-col sm:flex-row sm:items-center justify-between gap-6">
           <div className="flex flex-col space-y-2">
             <div className="flex items-center font-bold text-gray-700 dark:text-gray-300">
               <MapPin className="w-5 h-5 mr-2.5 text-brand-gold" /> {country}
             </div>
             <div className="flex items-center font-bold text-red-600 dark:text-red-400">
               <Calendar className="w-5 h-5 mr-2.5" /> {countdown.text}
             </div>
           </div>
           
           <button className="btn-premium-gold px-8 py-3.5 text-lg shrink-0 flex items-center justify-center space-x-3 z-30 relative pointer-events-none shadow-lg shadow-brand-gold/20">
             <span>{locale === 'tj' ? 'Давом додан' : 'Apply Now'}</span>
             <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>
    </motion.div>
  );
}
