'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const locales = [
  { code: 'en', name: 'EN', flag: '🇺🇸' },
  { code: 'ru', name: 'RU', flag: '🇷🇺' },
  { code: 'tj', name: 'TJ', flag: '🇹🇯' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLocale = locales.find((l) => l.code === locale) || locales[0];

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }

    // Replace locale in pathname
    const pathWithoutLocale = pathname?.replace(/^\/[a-z]{2}(\/|$)/, '/') || '/';
    const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact Pill Design */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-x-1.5 px-3 py-1.5 rounded-full bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md"
      >
        <Globe className="w-3.5 h-3.5 text-brand-navy dark:text-gray-300" />
        <span className="text-xs font-bold text-brand-navy dark:text-gray-300 tracking-wide">{currentLocale.name}</span>
        <ChevronDown className={`w-3 h-3 text-brand-navy/60 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-50"
          >
            {locales.map((loc) => (
              <button
                key={loc.code}
                onClick={() => switchLocale(loc.code)}
                className={`w-full flex items-center gap-x-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  locale === loc.code ? 'bg-brand-gold/10 text-brand-navy dark:text-brand-gold font-semibold' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-sm">{loc.flag}</span>
                <span className="text-sm">{loc.name}</span>
                {locale === loc.code && (
                  <span className="ml-auto text-brand-gold">✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
