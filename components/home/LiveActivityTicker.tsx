/**
 * Live Activity Ticker Component
 * Displays REAL database signals - NO mock data
 * Fetches from /api/public/real-time-activity
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';

interface Activity {
  type: 'new' | 'application' | 'popular' | 'tip';
  icon: string;
  text: string;
  textRu: string;
  textTj: string;
}

export default function LiveActivityTicker() {
  const locale = useLocale();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Hero settings and activity data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // First, check Hero settings
        const settingsResponse = await fetch('/api/public/site-settings');
        const settingsResult = await settingsResponse.json();
        
        if (settingsResult.success && settingsResult.data) {
          const heroSettings = settingsResult.data;
          
          // If MANUAL mode, use admin-defined text
          if (heroSettings.heroTickerMode === 'MANUAL' && heroSettings.heroTickerText) {
            setActivities([
              {
                type: 'tip',
                icon: '🔥',
                text: heroSettings.heroTickerText,
                textRu: heroSettings.heroTickerTextRu || heroSettings.heroTickerText,
                textTj: heroSettings.heroTickerTextTj || heroSettings.heroTickerText,
              },
            ]);
            setLoading(false);
            return;
          }
        }

        // AUTO mode: fetch real activity data
        const response = await fetch('/api/public/real-time-activity');
        const result = await response.json();
        
        if (result.success && result.data?.activities) {
          setActivities(result.data.activities);
        } else {
          // Fallback: static welcome message (truthful, not fake)
          setActivities([
            {
              type: 'tip',
              icon: '💡',
              text: 'Search for opportunities that match your goals',
              textRu: 'Ищите возможности, которые соответствуют вашим целям',
              textTj: 'Имкониятҳои худро ҷустуҷӯ кунед',
            },
          ]);
        }
      } catch (error) {
        // On error, show static welcome message
        setActivities([
          {
            type: 'tip',
            icon: '💡',
            text: 'Search for opportunities that match your goals',
            textRu: 'Ищите возможности, которые соответствуют вашим целям',
            textTj: 'Имкониятҳои худро ҷустуҷӯ кунед',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every 30 seconds to get latest activity
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cycle through activities
  useEffect(() => {
    if (activities.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [activities.length]);

  if (loading || activities.length === 0) {
    return null; // Don't show loading state - just hide it
  }

  const currentActivity = activities[currentIndex];
  const displayText =
    locale === 'ru'
      ? currentActivity.textRu
      : locale === 'tj'
      ? currentActivity.textTj
      : currentActivity.text;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-sm">
          <span className="text-sm">{currentActivity.icon}</span>
          <span className="text-xs font-medium text-white/70">{displayText}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

