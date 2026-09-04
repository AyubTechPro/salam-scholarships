'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { CheckCircle2, Mail, FileText, Send, Trophy } from 'lucide-react';

interface DynamicProgressCircleProps {
  emailVerified: boolean;
  hasCV: boolean;
  hasApplication: boolean;
}

export default function DynamicProgressCircle({
  emailVerified,
  hasCV,
  hasApplication,
}: DynamicProgressCircleProps) {
  const locale = useLocale();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let calculatedProgress = 0;
    if (emailVerified) calculatedProgress += 25;
    if (hasCV) calculatedProgress += 25;
    if (hasApplication) calculatedProgress += 50;
    setProgress(calculatedProgress);
  }, [emailVerified, hasCV, hasApplication]);

  const getStatusLabel = () => {
    if (progress === 100) {
      return locale === 'tj' ? 'Омода барои муваффақияти глобалӣ' : locale === 'ru' ? 'Готов к глобальному успеху' : 'Ready for Global Success';
    } else if (progress >= 75) {
      return locale === 'tj' ? 'Қариб омода' : locale === 'ru' ? 'Почти готов' : 'Almost Ready';
    } else if (progress >= 50) {
      return locale === 'tj' ? 'Дар роҳ' : locale === 'ru' ? 'В пути' : 'On Track';
    } else if (progress >= 25) {
      return locale === 'tj' ? 'Оғоз карда шуд' : locale === 'ru' ? 'Начато' : 'Getting Started';
    } else {
      return locale === 'tj' ? 'Оғоз кунед' : locale === 'ru' ? 'Начните' : 'Get Started';
    }
  };

  const getStatusColor = () => {
    if (progress === 100) return 'text-green-500';
    if (progress >= 75) return 'text-brand-gold';
    if (progress >= 50) return 'text-blue-500';
    if (progress >= 25) return 'text-orange-500';
    return 'text-gray-400';
  };

  const circumference = 2 * Math.PI * 70; // radius = 70
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-gradient-to-br from-brand-navy to-brand-navy/90 rounded-2xl p-8 text-white shadow-xl">
      <div className="flex flex-col items-center">
        {/* Progress Circle */}
        <div className="relative w-48 h-48 mb-6">
          <svg className="transform -rotate-90 w-full h-full">
            {/* Background Circle */}
            <circle
              cx="96"
              cy="96"
              r="70"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="96"
              cy="96"
              r="70"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#FCD34D" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-4xl font-heading font-bold ${getStatusColor()}`}>
              {progress}%
            </div>
            <div className="text-sm text-white/70 mt-1">
              {getStatusLabel()}
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="w-full space-y-4">
          {[
            {
              label: locale === 'tj' ? 'Почта тасдиқ шуд' : locale === 'ru' ? 'Email подтвержден' : 'Email Verified',
              completed: emailVerified,
              icon: Mail,
              value: 25,
            },
            {
              label: locale === 'tj' ? 'CV бор карда шуд' : locale === 'ru' ? 'Резюме загружено' : 'CV Uploaded',
              completed: hasCV,
              icon: FileText,
              value: 25,
            },
            {
              label: locale === 'tj' ? '1 дархост фиристода шуд' : locale === 'ru' ? '1 заявка отправлена' : '1 Application Sent',
              completed: hasApplication,
              icon: Send,
              value: 50,
            },
            {
              label: locale === 'tj' ? 'Омода барои муваффақият' : locale === 'ru' ? 'Готов к успеху' : 'Ready for Success',
              completed: progress === 100,
              icon: Trophy,
              value: 0, // Special milestone
            },
          ].map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                milestone.completed
                  ? 'bg-brand-gold/20 border border-brand-gold/30'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {milestone.completed ? (
                <CheckCircle2 className="w-5 h-5 text-brand-gold flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 flex-shrink-0" />
              )}
              <milestone.icon className={`w-5 h-5 flex-shrink-0 ${milestone.completed ? 'text-brand-gold' : 'text-white/50'}`} />
              <span className={`flex-1 text-sm ${milestone.completed ? 'text-white' : 'text-white/60'}`}>
                {milestone.label}
              </span>
              {milestone.value > 0 && (
                <span className="text-xs text-white/50">
                  +{milestone.value}%
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

