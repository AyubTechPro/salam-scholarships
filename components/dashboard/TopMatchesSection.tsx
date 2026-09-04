'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Award, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from '@/components/common/ImageWithFallback';
import { getBlurDataURL, getSafeImageUrl } from '@/lib/image-utils';

interface Opportunity {
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
  matchScore?: number;
}

export default function TopMatchesSection() {
  const locale = useLocale();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    fetchTopMatches();
  }, []);

  const fetchTopMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/recommendations');
      const result = await response.json();
      if (result.success && result.data) {
        setOpportunities(result.data);
        setIsPersonalized(true);
      }
    } catch (error) {
      console.error('Error fetching top matches:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-brand-navy to-brand-navy/90 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
        </div>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-brand-navy to-brand-navy/90 rounded-2xl p-6 md:p-8 text-white shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-brand-gold" />
          </div>
          <div>
            <h3 className="text-xl font-heading font-bold">
              {locale === 'tj' ? 'Беҳтарин мувофиқатҳо барои шумо' : locale === 'ru' ? 'Лучшие совпадения для вас' : 'Top Matches for You'}
            </h3>
            {isPersonalized && (
              <p className="text-sm text-white/70">
                {locale === 'tj' 
                  ? 'Бар асоси тарҷиҳҳои шумо' 
                  : locale === 'ru'
                  ? 'На основе ваших предпочтений'
                  : 'Based on your preferences'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {opportunities.map((opp, index) => {
          const localized = getLocalizedContent(opp);
          return (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/${locale}/opportunities/${opp.slug || opp.id}`}
                className="block bg-white/10 backdrop-blur-md rounded-xl overflow-hidden hover:bg-white/20 transition-all border border-white/20 hover:border-brand-gold/50 group"
              >
                {opp.imageUrl && (
                  <div className="relative h-32 w-full overflow-hidden">
                    <Image
                      src={getSafeImageUrl(opp.imageUrl)!}
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
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-brand-gold/20 text-brand-gold px-2 py-1 rounded font-semibold">
                        {opp.category}
                      </span>
                      {opp.matchScore && (
                        <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded font-bold shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                          {opp.matchScore}% Match
                        </span>
                      )}
                    </div>
                    {opp.isVerified && (
                      <Award className="w-4 h-4 text-brand-gold" />
                    )}
                  </div>
                  <h4 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-brand-gold transition-colors">
                    {localized.title}
                  </h4>
                  <p className="text-xs text-white/70 mb-3 line-clamp-2">
                    {localized.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-white/70">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{opp.country}</span>
                    </div>
                    <div className="flex items-center text-white/70">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{new Date(opp.deadline).toLocaleDateString(locale)}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-brand-gold text-sm font-semibold group-hover:underline">
                    <span>
                      {locale === 'tj' ? 'Маълумоти бештар' : locale === 'ru' ? 'Подробнее' : 'Learn More'}
                    </span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <Link
          href={`/${locale}/opportunities`}
          className="inline-flex items-center space-x-2 text-white hover:text-brand-gold transition-colors text-sm font-semibold"
        >
          <span>
            {locale === 'tj' ? 'Ҳамаи имкониятҳоро дидан' : locale === 'ru' ? 'Посмотреть все возможности' : 'View All Opportunities'}
          </span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

