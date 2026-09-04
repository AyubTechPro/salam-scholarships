'use client';

import { useLocale } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { GraduationCap, Globe2, Users } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import UIDictionaryText from '@/components/common/UIDictionaryText';
import { useGlobalContent } from '@/components/providers/GlobalContentProvider';

type Stat = {
  icon: typeof GraduationCap;
  value: number;
  labelKey: string;
  labelFallback: { en: string; ru: string; tj: string };
  color: string;
};

// Odometer animation component
function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const startValue = 0;
    const endValue = value;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref}>{displayValue.toLocaleString()}+</span>;
}

// Helper to get Lucide icon by name
const getIcon = (iconName: string) => {
  const IconComponent = (LucideIcons as any)[iconName] as typeof GraduationCap;
  return IconComponent || GraduationCap;
};

// Default fallback items
const defaultTrustBarItems = [
  { 
    icon: GraduationCap, 
    value: 0, 
    labelKey: 'trustBar.opportunities',
    labelFallback: { en: 'Active Opportunities', ru: 'Активные возможности', tj: 'Имкониятҳои фаъол' },
    color: 'text-gold'
  },
  { 
    icon: Globe2, 
    value: 0, 
    labelKey: 'trustBar.countries',
    labelFallback: { en: 'Countries', ru: 'Страны', tj: 'Кишварҳо' },
    color: 'text-navy dark:text-gold'
  },
  { 
    icon: Users, 
    value: 0, 
    labelKey: 'trustBar.consultations',
    labelFallback: { en: 'Consultations', ru: 'Консультации', tj: 'Машваратҳо' },
    color: 'text-gold'
  },
];

export default function TrustBar() {
  const locale = useLocale();
  const { getSiteSetting, loading: globalLoading } = useGlobalContent();
  const [stats, setStats] = useState<Stat[]>(defaultTrustBarItems);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TrustBar config from GlobalContent (already loaded); only fetch stats
        const trustBarItems = getSiteSetting('trustBarItems') as Array<{
          icon: string;
          statKey: string;
          labelEn: string;
          labelRu?: string;
          labelTj?: string;
          color: string;
          order: number;
        }> | undefined;

        const statsResponse = await fetch('/api/site-stats/public');
        const statsResult = await statsResponse.json();

        // If trustBarItems is configured, use it; otherwise use defaults
        if (trustBarItems && Array.isArray(trustBarItems) && trustBarItems.length > 0) {
          // Sort by order
          const sortedItems = [...trustBarItems].sort((a, b) => (a.order || 0) - (b.order || 0));
          
          const dynamicStats: Stat[] = sortedItems.map((item) => {
            // Get stat value based on statKey
            // Map to unified API fields
            let value = 0;
            if (statsResult.success && statsResult.data) {
              switch (item.statKey) {
                case 'programs':
                  value = statsResult.data.opportunities || statsResult.data.programs || 0;
                  break;
                case 'countries':
                  value = statsResult.data.countries || 0;
                  break;
                case 'consultations':
                  value = statsResult.data.consultations || 0;
                  break;
                case 'users':
                  value = statsResult.data.students || statsResult.data.users || 0;
                  break;
                default:
                  value = 0;
              }
            }

            return {
              icon: getIcon(item.icon),
              value,
              labelKey: '', // Not using UIDictionary for custom labels
              labelFallback: {
                en: item.labelEn,
                ru: item.labelRu || item.labelEn,
                tj: item.labelTj || item.labelEn,
              },
              color: item.color || 'text-gold',
            };
          });

          setStats(dynamicStats);
        } else {
          // Use default items with unified stats
          if (statsResult.success && statsResult.data) {
            setStats([
              { 
                icon: GraduationCap, 
                value: statsResult.data.opportunities || statsResult.data.programs || 0, 
                labelKey: 'trustBar.opportunities',
                labelFallback: { en: 'Active Opportunities', ru: 'Активные возможности', tj: 'Имкониятҳои фаъол' },
                color: 'text-gold'
              },
              { 
                icon: Globe2, 
                value: statsResult.data.countries || 0, 
                labelKey: 'trustBar.countries',
                labelFallback: { en: 'Countries', ru: 'Страны', tj: 'Кишварҳо' },
                color: 'text-navy dark:text-gold'
              },
              { 
                icon: Users, 
                value: statsResult.data.consultations || 0, 
                labelKey: 'trustBar.consultations',
                labelFallback: { en: 'Consultations', ru: 'Консультации', tj: 'Машваратҳо' },
                color: 'text-gold'
              },
            ]);
          }
        }
      } catch (error) {
        // Silently handle errors - don't show toast for non-critical failures
        // Stats will use default values (0) which is acceptable
      }
    };

    fetchStats();
  }, [globalLoading, getSiteSetting]); // Re-fetch when GlobalContent loads (trustBarItems available)

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative -mt-[60px] md:-mt-[80px] z-40 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 dark:bg-navy-light/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border border-gold/20 dark:border-gold/30">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const fallbackLabel = stat.labelFallback[locale as keyof typeof stat.labelFallback] || stat.labelFallback.en;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center space-x-4 text-center md:text-left"
              >
                <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 dark:from-gold/30 dark:to-gold/20 flex items-center justify-center ${stat.color} border border-gold/30 dark:border-gold/40`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="text-3xl md:text-4xl font-bold font-heading text-navy dark:text-white mb-1">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">
                    {stat.labelKey ? (
                      <UIDictionaryText dictKey={stat.labelKey} fallback={fallbackLabel} />
                    ) : (
                      fallbackLabel
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
