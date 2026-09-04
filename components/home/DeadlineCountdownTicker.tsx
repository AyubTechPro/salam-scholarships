'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { getDaysUntilDeadline } from '@/lib/hot-deadlines';

interface DeadlineProgram {
  id: string;
  title: string;
  titleRu?: string | null;
  titleTj?: string | null;
  deadline: string;
  country: string;
  daysUntil: number;
}

export default function DeadlineCountdownTicker() {
  const t = useTranslations('home');
  const locale = useLocale();
  const [deadlines, setDeadlines] = useState<DeadlineProgram[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const response = await fetch('/api/programs/hot-deadlines');
        const result = await response.json();
        if (result.success) {
          setDeadlines(result.data);
        }
      } catch (error) {
        console.error('Error fetching deadlines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeadlines();
  }, []);

  useEffect(() => {
    if (deadlines.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % deadlines.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [deadlines.length]);

  if (loading || deadlines.length === 0) {
    return null;
  }

  const currentDeadline = deadlines[currentIndex];
  const title = (locale === 'ru' && currentDeadline.titleRu) || 
                (locale === 'tj' && currentDeadline.titleTj) || 
                currentDeadline.title;

  return (
    <section className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-y-2 border-red-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center space-x-2 text-red-600">
              <Clock className="w-5 h-5 animate-pulse" />
              <span className="font-bold text-sm uppercase">{t('deadlineTicker.label')}</span>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <Link
                  href={`/${locale}/opportunities/${currentDeadline.id}`}
                  className="flex items-center space-x-3 hover:text-red-700 transition-colors"
                >
                  <span className="font-semibold text-gray-900 truncate">{title}</span>
                  <span className="text-red-600 font-bold">
                    {currentDeadline.daysUntil} {t('deadlineTicker.daysLeft')}
                  </span>
                  <ArrowRight className="w-4 h-4 text-red-600" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {deadlines.length > 1 && (
            <div className="flex space-x-1 ml-4">
              {deadlines.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-red-600 w-6' : 'bg-red-300'
                  }`}
                  aria-label={`Go to deadline ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

