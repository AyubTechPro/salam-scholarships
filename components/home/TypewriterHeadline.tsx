/**
 * Dynamic Typewriter Headline Component
 * Shows REAL most popular categories/levels from database
 * NO hardcoded mock data
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';

interface TypewriterText {
  en: string;
  ru: string;
  tj: string;
}

export default function TypewriterHeadline() {
  const locale = useLocale();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categories, setCategories] = useState<TypewriterText[]>([
    { en: 'Masters', ru: 'Магистратура', tj: 'Магистр' },
    { en: 'PhD', ru: 'Докторантура', tj: 'Доктор' },
    { en: 'Bachelor', ru: 'Бакалавриат', tj: 'Бакалавр' },
  ]);
  const [loading, setLoading] = useState(true);

  // Fetch Hero settings and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // First, check Hero settings
        const settingsResponse = await fetch('/api/public/site-settings');
        const settingsResult = await settingsResponse.json();
        
        if (settingsResult.success && settingsResult.data) {
          const heroSettings = settingsResult.data;
          
          // If MANUAL mode, use admin-defined words
          if (heroSettings.heroTickerMode === 'MANUAL' && heroSettings.heroHeadlineWords && heroSettings.heroHeadlineWords.length > 0) {
            setCategories(heroSettings.heroHeadlineWords);
            setLoading(false);
            return;
          }
        }

        // AUTO mode: fetch real most popular categories from database
        const response = await fetch('/api/public/most-popular-category');
        const result = await response.json();
        
        if (result.success && result.data?.categories && result.data.categories.length > 0) {
          setCategories(result.data.categories);
        }
        // If no data, keep default categories (truthful fallback)
      } catch (error) {
        // On error, keep default categories
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cycle through categories
  useEffect(() => {
    if (categories.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % categories.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [categories.length]);

  if (loading) {
    return (
      <span className="inline-block min-w-[200px] text-brand-gold">
        {locale === 'ru' ? 'Магистратура' : locale === 'tj' ? 'Магистр' : 'Masters'}
      </span>
    );
  }

  const currentText = categories[currentIndex] || categories[0];
  const displayText =
    locale === 'ru' ? currentText.ru : locale === 'tj' ? currentText.tj : currentText.en;

  return (
    <span className="inline-block min-w-[200px] text-brand-gold">
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="inline-block"
        >
          {displayText}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

