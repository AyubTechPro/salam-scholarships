'use client';

/**
 * Magic Search Bar - AI-powered natural language search (2026-ready)
 * Combines AI understanding with structured filters for world-class discovery
 */

import { Search, Sparkles } from 'lucide-react';

export interface MagicSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  showSparkleHint?: boolean;
  locale?: string;
}

const MAGIC_HINTS: Record<string, string[]> = {
  en: [
    'IT Scholarships',
    'Master in USA',
    'Summer school Europe',
    'PhD without IELTS',
  ],
  ru: [
    'IT Стипендии',
    'Магистратура в США',
    'Летняя школа в Европе',
    'PhD без IELTS',
  ],
  tj: [
    'Стипендияи IT',
    'Магистратура дар ИМА',
    'Мактаби тобистона дар Аврупо',
    'PhD бе IELTS',
  ],
};

export default function MagicSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search opportunities...',
  className = '',
  showSparkleHint = true,
  locale = 'en',
}: MagicSearchBarProps) {
  const hints = MAGIC_HINTS[locale] || MAGIC_HINTS.en;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit(e as unknown as React.FormEvent);
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-200 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-all text-lg"
        />
        {showSparkleHint && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span className="hidden sm:inline">Fast</span>
          </div>
        )}
      </div>
      {showSparkleHint && (
        <div className="mt-4 flex flex-wrap gap-2">
          {hints.map((hint) => (
            <button
              key={hint}
              type="button"
              onClick={() => {
                onChange(hint);
                onSearch(hint);
              }}
              className="group relative flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 text-navy dark:text-gray-300 hover:bg-brand-gold/20 hover:border-brand-gold/40 hover:text-navy dark:hover:text-white shadow-sm backdrop-blur-md transition-all overflow-hidden"
            >
              <div className="absolute inset-0 w-[200%] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              <Search className="w-3 h-3 text-brand-gold opacity-80" />
              <span className="relative z-10">{hint}</span>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
