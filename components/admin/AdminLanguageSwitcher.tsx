'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Only English and Tajik for the Admin Panel
const locales = [
  { code: 'en', name: 'EN', flag: '🇺🇸' },
  { code: 'tj', name: 'TJ', flag: '🇹🇯' },
];

export default function AdminLanguageSwitcher() {
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
        className="flex items-center gap-x-1.5 px-3 py-1.5 rounded-full bg-[#111] hover:bg-[#222] transition-colors border border-[#333]"
      >
        <Globe className="w-3.5 h-3.5 text-[#888]" />
        <span className="text-xs font-bold text-[#EDEDED] tracking-wide">{currentLocale.name}</span>
        <ChevronDown className={`w-3 h-3 text-[#888] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-32 bg-[#111] rounded-lg shadow-xl border border-[#333] py-1.5 z-50"
          >
            {locales.map((loc) => (
              <button
                key={loc.code}
                onClick={() => switchLocale(loc.code)}
                className={`w-full flex items-center gap-x-2 px-3 py-2 text-left hover:bg-[#222] transition-colors ${
                  locale === loc.code ? 'text-[#EDEDED] font-semibold bg-[#222]' : 'text-[#888]'
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
