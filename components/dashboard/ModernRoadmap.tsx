'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import {
  User,
  FileText,
  Bookmark,
  MessageCircle,
  CheckCircle2,
  Circle,
  ArrowRight,
  FileCheck,
  PenTool,
  Award,
  Trophy,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import RoadmapTipsSidebar from './RoadmapTipsSidebar';

interface RoadmapStep {
  id: string;
  icon: React.ElementType;
  title: string;
  titleRu: string;
  titleTj: string;
  completed: boolean;
  link: string;
  progress?: number;
}

interface Achievement {
  id: string;
  title: string;
  titleRu: string;
  titleTj: string;
  description: string;
  descriptionRu: string;
  descriptionTj: string;
  icon: React.ElementType;
  unlocked: boolean;
  color: string;
}

export default function ModernRoadmap() {
  const locale = useLocale();
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState<{ id: string; title: string } | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  const fetchProgress = useCallback(async () => {
    try {
      // Use dedicated roadmap progress API that scans DB in real-time
      const progressRes = await fetch('/api/user/roadmap-progress', {
        cache: 'no-store', // Always fetch fresh data
      });

      const progressData = await progressRes.json();

      if (!progressData.success) {
        console.error('Failed to fetch roadmap progress:', progressData.error);
        return;
      }

      const { steps: progressSteps, progressPercentage, details } = progressData.data;
      setOverallProgress(progressPercentage);

      // Map progress steps to our step format
      const profileStep = progressSteps.find((s: any) => s.id === 'profile');
      const telegramStep = progressSteps.find((s: any) => s.id === 'telegram');
      const cvStep = progressSteps.find((s: any) => s.id === 'cv');
      const motivationStep = progressSteps.find((s: any) => s.id === 'motivationLetter');
      const firstSaveStep = progressSteps.find((s: any) => s.id === 'firstSave');
      const applicationStep = progressSteps.find((s: any) => s.id === 'application');

      setSteps([
        {
          id: 'profile',
          icon: User,
          title: 'Complete Profile',
          titleRu: 'Заполнить профиль',
          titleTj: 'Профилро пур кардан',
          completed: profileStep?.completed || false,
          progress: profileStep?.progress || 0,
          link: `/${locale}/dashboard`,
        },
        {
          id: 'telegram',
          icon: MessageCircle,
          title: 'Connect Telegram',
          titleRu: 'Подключить Telegram',
          titleTj: 'Telegram-ро пайванд кардан',
          completed: telegramStep?.completed || false,
          link: `/${locale}/dashboard`,
        },
        {
          id: 'cv',
          icon: FileCheck,
          title: 'Upload CV',
          titleRu: 'Загрузить резюме',
          titleTj: 'CV-ро бор кардан',
          completed: cvStep?.completed || false,
          link: `/${locale}/opportunities`,
        },
        {
          id: 'motivationLetter',
          icon: PenTool,
          title: 'Write Motivation Letter',
          titleRu: 'Написать мотивационное письмо',
          titleTj: 'Номаи мотиватсиониро нависед',
          completed: motivationStep?.completed || false,
          link: `/${locale}/opportunities`,
        },
        {
          id: 'firstSave',
          icon: Bookmark,
          title: 'First Save',
          titleRu: 'Первое сохранение',
          titleTj: 'Аввалин захира',
          completed: firstSaveStep?.completed || false,
          link: `/${locale}/opportunities`,
        },
        {
          id: 'application',
          icon: FileText,
          title: 'First Application',
          titleRu: 'Первая заявка',
          titleTj: 'Аввалин дархост',
          completed: applicationStep?.completed || false,
          link: `/${locale}/opportunities`,
        },
      ]);

      // Calculate achievements
      const newAchievements: Achievement[] = [
        {
          id: 'profile_complete',
          title: 'Profile Master',
          titleRu: 'Мастер профиля',
          titleTj: 'Устоди профил',
          description: 'Complete your profile 100%',
          descriptionRu: 'Заполните профиль на 100%',
          descriptionTj: 'Профили худро 100% пур кунед',
          icon: User,
          unlocked: profileStep?.progress === 100,
          color: 'from-blue-500 to-blue-600',
        },
        {
          id: 'first_application',
          title: 'First Steps',
          titleRu: 'Первые шаги',
          titleTj: 'Аввалин қадамҳо',
          description: 'Submit your first application',
          descriptionRu: 'Подайте первую заявку',
          descriptionTj: 'Аввалин дархости худро пешниҳод кунед',
          icon: FileText,
          unlocked: applicationStep?.completed || false,
          color: 'from-green-500 to-green-600',
        },
        {
          id: 'cv_uploaded',
          title: 'Resume Ready',
          titleRu: 'Резюме готово',
          titleTj: 'Резюме тайёр аст',
          description: 'Upload your CV',
          descriptionRu: 'Загрузите резюме',
          descriptionTj: 'CV-и худро бор кунед',
          icon: FileCheck,
          unlocked: cvStep?.completed || false,
          color: 'from-purple-500 to-purple-600',
        },
        {
          id: 'motivation_letter',
          title: 'Wordsmith',
          titleRu: 'Мастер слова',
          titleTj: 'Устоди калима',
          description: 'Write your motivation letter',
          descriptionRu: 'Напишите мотивационное письмо',
          descriptionTj: 'Номаи мотиватсиониро нависед',
          icon: PenTool,
          unlocked: motivationStep?.completed || false,
          color: 'from-pink-500 to-pink-600',
        },
        {
          id: 'all_steps',
          title: 'Roadmap Champion',
          titleRu: 'Чемпион дорожной карты',
          titleTj: 'Қаҳрамони роҳнамо',
          description: 'Complete all roadmap steps',
          descriptionRu: 'Завершите все шаги дорожной карты',
          descriptionTj: 'Ҳама қадамҳои роҳнамоиро анҷом диҳед',
          icon: Trophy,
          unlocked: progressPercentage === 100,
          color: 'from-yellow-500 to-yellow-600',
        },
      ];

      setAchievements(newAchievements);
    } catch (error) {
      console.error('Error fetching roadmap progress:', error);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchProgress();
    
    const handleFocus = () => {
      fetchProgress();
    };
    
    const handleProfileUpdate = () => {
      fetchProgress();
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [fetchProgress]);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercentage = (completedCount / steps.length) * 100;

  const getTitle = (step: RoadmapStep) => {
    return locale === 'ru' ? step.titleRu : locale === 'tj' ? step.titleTj : step.title;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-brand-navy via-brand-navy/95 to-brand-navy-dark rounded-2xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-heading font-bold mb-2">
              {locale === 'tj' ? 'Роҳнамои муваффақият' :
               locale === 'ru' ? 'Дорожная карта успеха' :
               'Success Roadmap'}
            </h3>
            <p className="text-white/80">
              {locale === 'tj' ? 'Қадамҳои барои расидан ба мақсади худ' :
               locale === 'ru' ? 'Шаги к достижению вашей цели' :
               'Steps to reach your goal'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-heading font-bold text-brand-gold">
              {completedCount}/{steps.length}
            </div>
            <div className="text-sm text-white/60">
              {locale === 'tj' ? 'Анҷом дода шуд' :
               locale === 'ru' ? 'Завершено' :
               'Completed'}
            </div>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white/80">
              {locale === 'tj' ? 'Умумии пешрафт' :
               locale === 'ru' ? 'Общий прогресс' :
               'Overall Progress'}
            </span>
            <span className="text-sm font-bold text-brand-gold">
              {overallProgress}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-gradient-to-r from-brand-gold via-yellow-400 to-brand-gold h-full rounded-full shadow-lg relative overflow-hidden"
            >
              {/* Animated shine effect */}
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
        </div>

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-heading font-bold mb-4 flex items-center space-x-2">
              <Award className="w-5 h-5 text-brand-gold" />
              <span>
                {locale === 'tj' ? 'Ҷойизаҳо' :
                 locale === 'ru' ? 'Достижения' :
                 'Achievements'}
              </span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                const getTitle = () => locale === 'ru' ? achievement.titleRu : locale === 'tj' ? achievement.titleTj : achievement.title;
                const getDescription = () => locale === 'ru' ? achievement.descriptionRu : locale === 'tj' ? achievement.descriptionTj : achievement.description;
                
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`relative rounded-xl p-3 border-2 transition-all ${
                      achievement.unlocked
                        ? `bg-gradient-to-br ${achievement.color} border-transparent text-white shadow-lg`
                        : 'bg-white/10 border-white/20 text-white/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-5 h-5 ${achievement.unlocked ? 'text-white' : 'text-white/40'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${achievement.unlocked ? 'text-white' : 'text-white/60'}`}>
                          {getTitle()}
                        </p>
                      </div>
                      {achievement.unlocked && (
                        <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Steps - Visual Stepper */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            const isCompleted = step.completed;

            return (
              <div key={step.id} className="relative">
                {/* Connector Line */}
                {!isLast && (
                  <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-white/20" />
                )}

                <div className="flex items-start gap-6">
                  {/* Icon Circle */}
                  <div className="relative z-10 flex-shrink-0">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-brand-gold text-brand-navy shadow-xl'
                          : 'bg-white/20 text-white/60 border-2 border-white/30'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-8 h-8" />
                      ) : (
                        <Icon className="w-8 h-8" />
                      )}
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        href={step.link}
                        className="flex-1 block group"
                      >
                        <h4 className={`text-xl font-heading font-bold mb-1 transition-colors ${
                          isCompleted ? 'text-brand-gold' : 'text-white'
                        } group-hover:text-brand-gold`}>
                          {getTitle(step)}
                        </h4>
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                              <span>
                                {locale === 'tj' ? 'Анҷом дода шуд' :
                                 locale === 'ru' ? 'Завершено' :
                                 'Completed'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-4 h-4" />
                              <span>
                                {locale === 'tj' ? 'Онҷом наёфтааст' :
                                 locale === 'ru' ? 'Не завершено' :
                                 'Not completed'}
                              </span>
                            </>
                          )}
                          <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {/* Progress indicator for profile step */}
                        {step.id === 'profile' && step.progress !== undefined && step.progress < 100 && (
                          <div className="mt-2">
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${step.progress}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="bg-brand-gold h-full rounded-full"
                              />
                            </div>
                            <p className="text-xs text-white/60 mt-1">{step.progress}% {locale === 'tj' ? 'пур карда шуд' : locale === 'ru' ? 'заполнено' : 'complete'}</p>
                          </div>
                        )}
                      </Link>
                      {/* Tips Button */}
                      <button
                        onClick={() => setSelectedStep({ id: step.id, title: getTitle(step) })}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                        title={locale === 'tj' ? 'Маслиҳатҳо' : locale === 'ru' ? 'Советы' : 'Get Tips'}
                      >
                        <ArrowRight className="w-5 h-5 text-white/60 hover:text-brand-gold transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {completedCount === steps.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 bg-brand-gold/20 backdrop-blur-sm rounded-xl p-6 text-center border border-brand-gold/30"
          >
            <p className="text-xl font-heading font-bold text-brand-gold">
              {locale === 'tj' ? '🎉 Ҳама қадамҳо анҷом дода шуданд!' :
               locale === 'ru' ? '🎉 Все шаги завершены!' :
               '🎉 All steps completed!'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Tips Sidebar */}
      {selectedStep && (
        <RoadmapTipsSidebar
          isOpen={!!selectedStep}
          onClose={() => setSelectedStep(null)}
          stepId={selectedStep.id}
          stepTitle={selectedStep.title}
        />
      )}
    </motion.div>
  );
}

