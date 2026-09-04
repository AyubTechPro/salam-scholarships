"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const locales = [
  { code: 'en', name: 'EN', flag: '🇺🇸' },
  { code: 'tj', name: 'TJ', flag: '🇹🇯' },
];

export default function AdminLanguageSwitcher({ currentLocale }: { currentLocale: string }) {
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

  const activeLocale = locales.find((l) => l.code === currentLocale) || locales[0];

  const switchLocale = (newLocale: string) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    const pathWithoutLocale = pathname?.replace(/^\/[a-z]{2}(\/|$)/, '/') || '/';
    const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
    
    // Fast client-side routing
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-x-2 px-3 py-1.5 rounded-md bg-[#111] hover:bg-[#222] transition-colors border border-[#333] text-[#EDEDED]"
      >
        <Globe className="w-3.5 h-3.5 text-[#888]" />
        <span className="text-xs font-semibold tracking-wide">{activeLocale.name}</span>
        <ChevronDown className={`w-3 h-3 text-[#666] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-32 bg-[#111] rounded-lg shadow-2xl border border-[#333] py-1 z-50 overflow-hidden"
          >
            {locales.map((loc) => (
              <button
                key={loc.code}
                onClick={() => switchLocale(loc.code)}
                className={`w-full flex items-center gap-x-2 px-3 py-2 text-left hover:bg-[#222] transition-colors ${
                  currentLocale === loc.code ? 'text-[#EDEDED] bg-[#222]' : 'text-[#888]'
                }`}
              >
                <span className="text-sm">{loc.flag}</span>
                <span className="text-sm font-medium">{loc.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
