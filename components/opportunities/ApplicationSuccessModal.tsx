'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, MessageCircle, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import Image from '@/components/common/ImageWithFallback';

interface ApplicationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  telegramUrl: string;
  applicationId: string;
  programTitle: string;
  locale: string;
}

export default function ApplicationSuccessModal({
  isOpen,
  onClose,
  telegramUrl,
  applicationId,
  programTitle,
  locale,
}: ApplicationSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(telegramUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTelegramClick = () => {
    window.open(telegramUrl, '_blank');
  };

  const translations = {
    title: locale === 'tj' 
      ? 'Дархост бомуваффақият ирсол шуд!' 
      : locale === 'ru'
      ? 'Заявка успешно отправлена!'
      : 'Application Submitted Successfully!',
    message: locale === 'tj'
      ? 'Дархости шумо қабул карда шуд. Лутфан бо мо дар Telegram иртибот барқарор кунед, то раванди дархостро ба анҷом расонем.'
      : locale === 'ru'
      ? 'Ваша заявка принята. Пожалуйста, свяжитесь с нами в Telegram, чтобы завершить процесс подачи заявки.'
      : 'Your application has been received. Please contact us on Telegram to complete the application process.',
    nextSteps: locale === 'tj'
      ? 'Қадами навбатӣ'
      : locale === 'ru'
      ? 'Следующие шаги'
      : 'Next Steps',
    contactUs: locale === 'tj'
      ? 'Бо мо дар Telegram иртибот барқарор кунед'
      : locale === 'ru'
      ? 'Свяжитесь с нами в Telegram'
      : 'Contact us on Telegram',
    copyLink: locale === 'tj'
      ? 'Нусха бардоштан'
      : locale === 'ru'
      ? 'Копировать ссылку'
      : 'Copy Link',
    copied: locale === 'tj'
      ? 'Нусха бардошта шуд!'
      : locale === 'ru'
      ? 'Ссылка скопирована!'
      : 'Link Copied!',
    close: locale === 'tj'
      ? 'Пӯшидан'
      : locale === 'ru'
      ? 'Закрыть'
      : 'Close',
    applicationId: locale === 'tj'
      ? 'ID дархост'
      : locale === 'ru'
      ? 'ID заявки'
      : 'Application ID',
  };

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-brand-gold to-yellow-500 p-6 rounded-t-2xl">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-brand-navy hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-brand-navy">{translations.title}</h2>
                    <p className="text-sm text-brand-navy/80 mt-1">{translations.applicationId}: {applicationId.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Success Message */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{translations.message}</p>
                </div>

                {/* Program Info */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                    {locale === 'tj' ? 'Барнома' : locale === 'ru' ? 'Программа' : 'Program'}
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{programTitle}</p>
                </div>

                {/* Next Steps */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{translations.nextSteps}</h3>
                  
                  {/* Telegram Button */}
                  <button
                    onClick={handleTelegramClick}
                    className="w-full bg-gradient-to-r from-[#0088cc] to-[#006699] text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center space-x-3"
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span>{translations.contactUs}</span>
                    <ExternalLink className="w-5 h-5" />
                  </button>

                  {/* Copy Link */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={telegramUrl}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-400"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 whitespace-nowrap"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">{copied ? translations.copied : translations.copyLink}</span>
                    </button>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {translations.close}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

