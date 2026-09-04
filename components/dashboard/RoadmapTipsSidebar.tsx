'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Lightbulb, Sparkles } from 'lucide-react';
import { useLocale } from 'next-intl';

interface RoadmapTipsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  stepId: string;
  stepTitle: string;
}

export default function RoadmapTipsSidebar({
  isOpen,
  onClose,
  stepId,
  stepTitle,
}: RoadmapTipsSidebarProps) {
  const locale = useLocale();
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTips = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/roadmap-tips?stepId=${stepId}&locale=${locale}`);
      const result = await response.json();
      
      if (result.success && result.data?.tips) {
        setTips(result.data.tips);
      }
    } catch (error) {
      console.error('Error fetching tips:', error);
    } finally {
      setLoading(false);
    }
  }, [stepId, locale]);

  useEffect(() => {
    if (isOpen && stepId) {
      fetchTips();
    }
  }, [isOpen, stepId, fetchTips]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-brand-navy shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-gold to-yellow-400 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-brand-navy" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-bold text-brand-navy dark:text-white">
                    {locale === 'tj' ? 'Маслиҳатҳо' :
                     locale === 'ru' ? 'Советы' :
                     'Tips & Guidance'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stepTitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {locale === 'tj' ? 'Маслиҳатҳоро тайёр мекунам...' :
                     locale === 'ru' ? 'Генерирую советы...' :
                     'Generating tips...'}
                  </p>
                </div>
              ) : tips.length > 0 ? (
                <div className="space-y-4">
                  {tips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-brand-gold/10 to-yellow-400/5 rounded-xl p-4 border border-brand-gold/20"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <Sparkles className="w-5 h-5 text-brand-gold" />
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {tip}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    {locale === 'tj' ? 'Маслиҳатҳо дастрас нестанд' :
                     locale === 'ru' ? 'Советы недоступны' :
                     'Tips not available'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-brand-navy-dark">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {locale === 'tj' ? 'Маслиҳатҳо бо AI тайёр карда мешаванд' :
                 locale === 'ru' ? 'Советы генерируются с помощью ИИ' :
                 'Tips are AI-generated for personalized guidance'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

