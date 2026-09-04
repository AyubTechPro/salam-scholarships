/**
 * FAQ Section Component
 * Displays frequently asked questions with accordion UI
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

type FAQ = {
  id: string;
  question: string;
  questionRu?: string | null;
  questionTj?: string | null;
  answer: string;
  answerRu?: string | null;
  answerTj?: string | null;
  category?: string | null;
  order: number;
};

export default function FAQSection() {
  const locale = useLocale();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchFAQs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append('isActive', 'true');
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/faq?${params.toString()}`);
      const result = await response.json();
      if (result.success && result.data) {
        setFaqs(result.data);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  const getLocalizedFAQ = (faq: FAQ) => {
    if (locale === 'ru') {
      return {
        question: faq.questionRu || faq.question,
        answer: faq.answerRu || faq.answer,
      };
    }
    if (locale === 'tj') {
      return {
        question: faq.questionTj || faq.question,
        answer: faq.answerTj || faq.answer,
      };
    }
    return {
      question: faq.question,
      answer: faq.answer,
    };
  };

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(faqs.map(faq => faq.category).filter(Boolean)))];
  const categoryLabels: Record<string, Record<string, string>> = {
    all: { en: 'All Questions', ru: 'Все вопросы', tj: 'Ҳамаи саволҳо' },
    GENERAL: { en: 'General', ru: 'Общие', tj: 'Умумӣ' },
    APPLICATION: { en: 'Application', ru: 'Заявка', tj: 'Дархост' },
    SCHOLARSHIP: { en: 'Scholarship', ru: 'Стипендия', tj: 'Стипендия' },
    VISA: { en: 'Visa', ru: 'Виза', tj: 'Виза' },
  };

  if (loading) {
    return (
      <section className="py-20 bg-white dark:bg-navy-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse text-gray-400">Loading FAQs...</div>
          </div>
        </div>
      </section>
    );
  }

  if (faqs.length === 0) {
    return null; // Don't show section if no FAQs
  }

  return (
    <section id="faq" className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-navy-dark dark:to-navy">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-gold/10 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-4">
            {locale === 'tj' ? 'Кӯмак' : locale === 'ru' ? 'Помощь' : 'Help Center'}
          </div>
          <h2 className="text-4xl font-heading font-bold text-navy dark:text-white mb-4">
            {locale === 'tj' ? 'Саволҳои зуд-зуд пурсидашаванда' : locale === 'ru' ? 'Часто задаваемые вопросы' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {locale === 'tj' 
              ? 'Саволҳои зуд-зуд пурсидашавандаро бинед' 
              : locale === 'ru'
              ? 'Найдите ответы на часто задаваемые вопросы'
              : 'Find answers to commonly asked questions'}
          </p>
        </motion.div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat ?? 'all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-gold text-navy'
                    : 'bg-white dark:bg-navy-light text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-lighter'
                }`}
              >
                {categoryLabels[cat ?? 'all']?.[locale] || (cat ?? 'all')}
              </button>
            ))}
          </div>
        )}

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const localized = getLocalizedFAQ(faq);
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white dark:bg-navy-light rounded-xl shadow-md border border-gray-200 dark:border-navy-lighter overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-navy-lighter transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <HelpCircle className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-navy dark:text-white pr-4">
                      {localized.question}
                    </h3>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pl-14">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                          {localized.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        {faqs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {locale === 'tj'
                ? 'Саволҳои дигаре доред?'
                : locale === 'ru'
                ? 'Есть другие вопросы?'
                : 'Have more questions?'}
            </p>
            <a
              href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_SUPPORT || 'ayub_it_tj'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-navy rounded-lg font-semibold hover:bg-gold/90 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {locale === 'tj' ? 'Машварат гиред' : locale === 'ru' ? 'Получить консультацию' : 'Get Consultation'}
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}

