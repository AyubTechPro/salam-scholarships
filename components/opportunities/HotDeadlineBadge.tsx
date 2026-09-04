'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useBusinessRules } from '@/hooks/useBusinessRules';

interface HotDeadlineBadgeProps {
  deadline: Date;
  className?: string;
}

export default function HotDeadlineBadge({ deadline, className = '' }: HotDeadlineBadgeProps) {
  const locale = useLocale();
  const { data } = useBusinessRules();
  const threshold = data.urgentBadgeThresholdDays;
  
  const now = new Date();
  const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntil < 0 || daysUntil > threshold) {
    return null;
  }

  const translations: Record<string, { urgent: string; days: string }> = {
    en: { urgent: 'URGENT', days: 'days left' },
    ru: { urgent: 'СРОЧНО', days: 'дней осталось' },
    tj: { urgent: 'ШАРТӢ', days: 'рӯз боқӣ монд' },
  };

  const t = translations[locale] || translations.en;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`absolute top-2 right-2 z-10 ${className}`}
    >
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full flex items-center space-x-1 text-xs font-bold shadow-lg animate-pulse">
        <Flame className="w-3 h-3" />
        <span>{t.urgent}</span>
        <span className="ml-1">({daysUntil} {t.days})</span>
      </div>
    </motion.div>
  );
}

