'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Play, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from '@/components/common/ImageWithFallback';

type Video = {
  id: string;
  title: string;
  titleRu?: string | null;
  titleTj?: string | null;
  thumbnailUrl?: string | null;
  category: string;
};

export default function LearningHubCard() {
  const locale = useLocale();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos?limit=3');
      const result = await response.json();
      if (result.success) {
        setVideos(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = (video: Video) => {
    return (locale === 'ru' && video.titleRu) ||
           (locale === 'tj' && video.titleTj) ||
           video.title;
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-brand-navy mb-2 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-gold" />
            <span>
              {locale === 'tj' ? 'Маркази таълимӣ' :
               locale === 'ru' ? 'Образовательный центр' :
               'Learning Hub'}
            </span>
          </h2>
          <p className="text-gray-600">
            {locale === 'tj' ? 'Видеоҳои таълимӣ барои рушди касбӣ' :
             locale === 'ru' ? 'Образовательные видео для профессионального развития' :
             'Educational videos for professional development'}
          </p>
        </div>
        <Link
          href={`/${locale}/dashboard?tab=learning`}
          className="text-brand-gold hover:text-brand-gold/80 font-semibold flex items-center gap-2"
        >
          <span>
            {locale === 'tj' ? 'Ҳамаро дидан' :
             locale === 'ru' ? 'Смотреть все' :
             'View All'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-brand-gold/20 to-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-brand-gold" />
          </div>
          <h3 className="text-xl font-heading font-bold text-brand-navy mb-3">
            {locale === 'tj' ? 'Видеоҳо ҳанӯз нестанд' :
             locale === 'ru' ? 'Видео пока нет' :
             'No Videos Yet'}
          </h3>
          <p className="text-gray-600">
            {locale === 'tj' ? 'Видеоҳои таълимӣ ба зудӣ илова карда мешаванд.' :
             locale === 'ru' ? 'Образовательные видео скоро появятся.' :
             'Educational videos coming soon!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative rounded-xl overflow-hidden bg-gradient-to-br from-brand-navy to-brand-navy-dark cursor-pointer hover:scale-105 transition-transform"
            >
              <div className="relative h-48">
                {video.thumbnailUrl ? (
                  <Image
                    src={video.thumbnailUrl}
                    alt={getTitle(video)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-16 h-16 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-white line-clamp-2 text-sm">
                  {getTitle(video)}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

