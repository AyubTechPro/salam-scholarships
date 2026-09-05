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
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-white/90 dark:bg-navy/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/20 dark:border-white/10 flex flex-col overflow-hidden"
            >
              {/* Premium Glows */}
              <div className="absolute top-0 left-0 w-full h-32 bg-brand-gold/10 blur-[50px] rounded-t-3xl pointer-events-none" />
              
              {/* Header */}
              <div className="relative flex items-center justify-between px-5 py-4 bg-transparent shrink-0 border-b border-gray-200/50 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-gold/20 rounded-xl">
                    <Sparkles className="w-5 h-5 text-brand-gold" />
                  </div>
                  <span className="font-black text-navy dark:text-white tracking-tight text-lg">{t.title}</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors text-gray-500 dark:text-gray-400 hover:text-navy dark:hover:text-white"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="relative flex-1 overflow-y-auto p-5 space-y-4 min-h-[120px] scrollbar-hide"
              >
                {messages.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-brand-gold" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-[80%]">
                      {locale === 'tj'
                        ? 'Ёвари зираки шумо барои пайдо кардани стипендияи орзуҳоятон'
                        : locale === 'ru'
                          ? 'Ваш умный помощник для поиска стипендии мечты'
                          : 'Your smart assistant for finding the dream scholarship'}
                    </p>
                  </motion.div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-brand-navy text-white rounded-tr-sm'
                          : 'bg-white/60 dark:bg-black/20 backdrop-blur-md text-gray-800 dark:text-gray-200 border border-gray-200/50 dark:border-white/5 rounded-tl-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-brand-gold text-sm font-medium bg-brand-gold/10 px-4 py-3 rounded-2xl w-fit rounded-tl-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.thinking}
                  </motion.div>
                )}
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
              </div>

              {/* Input & Call to Action */}
              <div className="relative flex flex-col p-4 shrink-0 bg-transparent gap-3 border-t border-gray-200/50 dark:border-white/5">
                <a 
                  href="https://t.me/salamconsulting" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex justify-center items-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4" />
                  {t.telegramBtn}
                </a>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex gap-2 relative"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.placeholder}
                    disabled={loading}
                    className="flex-1 rounded-xl border border-gray-200/50 dark:border-white/10 px-4 py-3 text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold bg-white/50 dark:bg-black/20 backdrop-blur-sm text-gray-900 dark:text-white transition-all shadow-inner placeholder-gray-400 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="w-11 h-11 flex items-center justify-center bg-brand-gold text-brand-navy rounded-xl font-medium hover:bg-brand-gold/90 disabled:opacity-50 shrink-0 transition-transform active:scale-95 shadow-md"
                  >
                    <Send className="w-5 h-5 ml-1" />
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
              className="w-16 h-16 rounded-2xl bg-brand-gold hover:bg-brand-gold/90 text-brand-navy shadow-[0_0_30px_rgba(255,215,0,0.3)] flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 relative group"
              aria-label={t.title}
              title={t.title}
            >
              <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping opacity-20 group-hover:opacity-40" />
              <Sparkles className="w-7 h-7 relative z-10" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
