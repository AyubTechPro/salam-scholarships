'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { TrendingUp, Award, Target, CheckCircle2, Sparkles } from 'lucide-react';

interface ProfileStrengthMeterProps {
  profile: {
    name: string | null;
    surname: string | null;
    profession: string | null;
    city: string | null;
    country: string | null;
    image: string | null;
    bio: string | null;
    telegramOrPhone: string | null;
  } | null;
}

export default function ProfileStrengthMeter({ profile }: ProfileStrengthMeterProps) {
  const locale = useLocale();
  const [strength, setStrength] = useState(0);
  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(true);

  const calculateStrength = useCallback(() => {
    if (!profile) {
      setStrength(0);
      return;
    }

    const fields = [
      profile.name,
      profile.surname,
      profile.profession,
      profile.city,
      profile.country,
      profile.image,
      profile.bio,
      profile.telegramOrPhone,
    ];

    const completedFields = fields.filter(Boolean).length;
    const percentage = Math.round((completedFields / fields.length) * 100);
    setStrength(percentage);
  }, [profile]);

  const fetchDailyTip = useCallback(async () => {
    setLoadingTip(true);
    try {
      const response = await fetch(`/api/user/daily-tip?locale=${locale}`);
      const result = await response.json();
      if (result.success && result.data?.tip) {
        setDailyTip(result.data.tip);
      }
    } catch (error) {
      console.error('Error fetching daily tip:', error);
    } finally {
      setLoadingTip(false);
    }
  }, [locale]);

  useEffect(() => {
    if (profile) {
      calculateStrength();
    }
  }, [profile, calculateStrength]);

  useEffect(() => {
    fetchDailyTip();
  }, [fetchDailyTip]);

  const getStrengthLabel = () => {
    if (strength >= 90) {
      return locale === 'tj' ? 'Аъло' : locale === 'ru' ? 'Отлично' : 'Excellent';
    } else if (strength >= 70) {
      return locale === 'tj' ? 'Хуб' : locale === 'ru' ? 'Хорошо' : 'Good';
    } else if (strength >= 50) {
      return locale === 'tj' ? 'Миёна' : locale === 'ru' ? 'Средне' : 'Fair';
    } else {
      return locale === 'tj' ? 'Оғоз' : locale === 'ru' ? 'Начало' : 'Getting Started';
    }
  };

  const getStrengthColor = () => {
    if (strength >= 90) return 'from-green-500 to-green-600';
    if (strength >= 70) return 'from-brand-gold to-yellow-500';
    if (strength >= 50) return 'from-orange-500 to-orange-600';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Profile Strength Meter */}
      <div className="bg-gradient-to-br from-brand-navy to-brand-navy/95 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold">
                {locale === 'tj' ? 'Қуввати профил' : locale === 'ru' ? 'Сила профиля' : 'Profile Strength'}
              </h3>
              <p className="text-sm text-white/70">{getStrengthLabel()}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-heading font-bold text-brand-gold">
              {strength}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${strength}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r ${getStrengthColor()} rounded-full relative overflow-hidden`}
          >
            {/* Shine effect */}
            <motion.div
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: 'linear',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>

        {/* Completion Checklist */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            { field: 'name', label: locale === 'tj' ? 'Ном' : locale === 'ru' ? 'Имя' : 'Name', value: profile?.name },
            { field: 'surname', label: locale === 'tj' ? 'Насаб' : locale === 'ru' ? 'Фамилия' : 'Surname', value: profile?.surname },
            { field: 'profession', label: locale === 'tj' ? 'Касб' : locale === 'ru' ? 'Профессия' : 'Profession', value: profile?.profession },
            { field: 'city', label: locale === 'tj' ? 'Шаҳр' : locale === 'ru' ? 'Город' : 'City', value: profile?.city },
            { field: 'image', label: locale === 'tj' ? 'Акс' : locale === 'ru' ? 'Фото' : 'Photo', value: profile?.image },
            { field: 'bio', label: locale === 'tj' ? 'Био' : locale === 'ru' ? 'Биография' : 'Bio', value: profile?.bio },
            { field: 'telegram', label: locale === 'tj' ? 'Telegram' : locale === 'ru' ? 'Telegram' : 'Telegram', value: profile?.telegramOrPhone },
          ].map((item) => (
            <div key={item.field} className="flex items-center space-x-2">
              {item.value ? (
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 flex-shrink-0" />
              )}
              <span className={item.value ? 'text-white' : 'text-white/50'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Global Tip */}
      <div className="bg-gradient-to-br from-brand-gold/10 to-yellow-400/5 rounded-2xl p-6 border border-brand-gold/20">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-brand-gold" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-heading font-bold text-brand-navy dark:text-white">
                {locale === 'tj' ? 'Маслиҳати рӯзона' : locale === 'ru' ? 'Совет дня' : 'Daily Global Tip'}
              </h3>
            </div>
            {loadingTip ? (
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">
                  {locale === 'tj' ? 'Бор кардани маслиҳат...' : locale === 'ru' ? 'Загрузка совета...' : 'Loading tip...'}
                </span>
              </div>
            ) : dailyTip ? (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {dailyTip}
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {locale === 'tj' ? 'Маслиҳат дастрас нест' : locale === 'ru' ? 'Совет недоступен' : 'Tip not available'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

