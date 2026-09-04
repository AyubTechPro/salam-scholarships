'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, X, Sparkles } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string };

export default function AIFloatingWidget() {
  const locale = useLocale() as 'en' | 'ru' | 'tj';
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = {
    title: 'Salam AI',
    placeholder: locale === 'tj' ? 'Савол пурсед...' : locale === 'ru' ? 'Напишите...' : 'Ask a question...',
    thinking: locale === 'tj' ? 'Фикр мекунам...' : locale === 'ru' ? 'Думаю...' : 'Thinking...',
    telegramBtn: locale === 'tj' ? 'Пайваст шудан ба Telegram ➔' : locale === 'ru' ? 'Перейти в Telegram ➔' : 'Connect on Telegram ➔',
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    setInput('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content }],
          locale,
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed');
      setMessages((prev) => [...prev, { role: 'assistant', content: result.data.content }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button - bottom-right corner */}
      <div className="fixed bottom-6 right-6 z-[90]">
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-[360px] max-w-[calc(100vw-3rem)] h-[480px] max-h-[calc(100vh-8rem)] bg-white dark:bg-navy rounded-2xl shadow-2xl border border-gray-200 dark:border-navy-lighter flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-brand-navy text-white rounded-t-2xl shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-gold" />
                  <span className="font-semibold">{t.title}</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[120px] dark:bg-navy/50"
              >
                {messages.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                    {locale === 'tj'
                      ? 'Савол дар бораи стипендия, дастовардҳо ё лоиҳа пурсед'
                      : locale === 'ru'
                        ? 'Спросите о стипендиях, программах и возможностях'
                        : 'Ask about scholarships, opportunities or the project'}
                  </p>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-brand-navy text-white'
                          : 'bg-gray-100 dark:bg-navy-lighter text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.thinking}
                  </div>
                )}
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
              </div>

              {/* Input */}
              {/* Input & Call to Action */}
              <div className="flex flex-col p-3 border-t dark:border-navy-lighter shrink-0 bg-white dark:bg-navy gap-3">
                <a 
                  href="https://t.me/salamconsulting" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex justify-center items-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  {t.telegramBtn}
                </a>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.placeholder}
                    disabled={loading}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-navy-lighter px-3 py-2 text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold bg-white dark:bg-navy text-gray-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-3 py-2 bg-brand-gold text-brand-navy rounded-lg font-medium hover:bg-brand-gold/90 disabled:opacity-50 shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setOpen(true)}
              className="w-14 h-14 rounded-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105"
              aria-label={t.title}
              title={t.title}
            >
              <Sparkles className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
