'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Loader2,
  MessageCircle,
  ChevronRight,
  GraduationCap,
  FileText,
  Globe,
  Lightbulb,
} from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  { icon: GraduationCap, key: 's1' },
  { icon: FileText, key: 's2' },
  { icon: Globe, key: 's3' },
  { icon: Lightbulb, key: 's4' },
];

export default function AIAssistantClient() {
  const t = useTranslations('ai');
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
          messages: [...messages, { role: 'user', content }].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          locale,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get response');
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.data.content },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Header - gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-brand-navy via-brand-navy/95 to-indigo-900 px-6 py-8 md:px-10 md:py-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(234,179,8,0.15)_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gold/20 shadow-lg shadow-brand-gold/10">
            <Sparkles className="h-7 w-7 text-brand-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              {t('title')}
            </h1>
            <p className="mt-1 text-sm text-white/70 md:text-base">{t('subtitle')}</p>
          </div>
        </div>
      </motion.div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col rounded-b-2xl border border-t-0 border-gray-200/80 bg-gradient-to-b from-white to-gray-50/50 dark:border-gray-700/50 dark:from-gray-900/50 dark:to-gray-900/30">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8"
        >
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center justify-center py-12 md:py-20"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold/20 to-brand-gold/5">
                <MessageCircle className="h-10 w-10 text-brand-gold" />
              </div>
              <p className="mb-2 text-center text-lg font-medium text-gray-700 dark:text-gray-200">
                {t('greeting')}
              </p>
              <p className="mb-8 max-w-md text-center text-sm text-gray-500 dark:text-gray-400">
                {t('hint')}
              </p>
              <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                {SUGGESTIONS.map(({ icon: Icon, key }, i) => (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    onClick={() => sendMessage(t(`suggestions.${key}`))}
                    className="group flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-4 py-3 text-left shadow-sm transition-all hover:border-brand-gold/40 hover:shadow-md hover:shadow-brand-gold/5 dark:border-gray-700/50 dark:bg-gray-800/50 dark:hover:border-brand-gold/30"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-brand-gold" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-brand-navy dark:text-gray-200 dark:group-hover:text-white">
                      {t(`suggestions.${key}`)}
                    </span>
                    <ChevronRight className="ml-auto h-4 w-4 text-gray-400 opacity-0 transition group-hover:opacity-100" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 md:max-w-[75%] md:px-5 md:py-4 ${
                        msg.role === 'user'
                          ? 'bg-brand-navy text-white'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {msg.content}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-800">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-gold" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('thinking')}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200/80 bg-white/80 px-4 py-4 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/50 md:px-6 md:py-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('placeholder')}
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:placeholder:text-gray-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gold text-brand-navy transition hover:bg-brand-gold/90 disabled:opacity-50 disabled:hover:bg-brand-gold"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
