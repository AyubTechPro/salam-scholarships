'use client';

import { motion } from 'framer-motion';
import { FileText, Bookmark, TrendingUp, Calendar } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useScopedTranslation } from '@/lib/scoped-translation-client';

type DashboardStats = {
  applicationsCount: number;
  savedOpportunitiesCount: number;
  aiReadinessScore: number;
  upcomingEventsCount: number;
};

export default function StatsGrid({ stats }: { stats: DashboardStats }) {
  const locale = useLocale();

  const statsCards = [
    {
      icon: FileText,
      label: locale === 'tj' ? 'Дархостҳо' : locale === 'ru' ? 'Заявки' : 'My Applications',
      value: stats.applicationsCount,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: Bookmark,
      label: locale === 'tj' ? 'Захирашуда' : locale === 'ru' ? 'Сохранено' : 'Saved Opportunities',
      value: stats.savedOpportunitiesCount,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      icon: TrendingUp,
      label: locale === 'tj' ? 'Ҳадди AI' : locale === 'ru' ? 'AI Готовность' : 'AI Readiness Score',
      value: stats.aiReadinessScore,
      suffix: '/100',
      color: 'from-brand-gold to-yellow-500',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-brand-gold',
    },
    {
      icon: Calendar,
      label: locale === 'tj' ? 'Чорабинӣҳо' : locale === 'ru' ? 'Мероприятия' : 'Upcoming Events',
      value: stats.upcomingEventsCount,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-7 h-7 ${stat.iconColor}`} />
              </div>
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-3xl font-heading font-bold text-brand-navy">
                {stat.value}
                {stat.suffix && <span className="text-xl text-gray-500">{stat.suffix}</span>}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

