'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, BookOpen, User } from 'lucide-react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const { data: session } = useSession();

  // Don't show on admin routes
  if (pathname?.startsWith(`/${locale}/admin`)) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '') {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname === `/${locale}${path}` || pathname?.startsWith(`/${locale}${path}/`);
  };

  const navItems = [
    {
      href: '',
      icon: Home,
      label: { en: 'Home', ru: 'Главная', tj: 'Асосӣ' },
    },
    {
      href: '/opportunities',
      icon: Search,
      label: { en: 'Search', ru: 'Поиск', tj: 'Ҷустуҷӯ' },
    },
    {
      href: '/consulting',
      icon: User,
      label: { en: 'Consulting', ru: 'Консультации', tj: 'Машварат' },
    },
  ];

  const getLabel = (item: typeof navItems[0]) => {
    return item.label[locale as keyof typeof item.label] || item.label.en;
  };

  return (
    <>
      {/* Bottom Navigation Bar - Mobile Only */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-navy border-t border-gray-200 dark:border-navy-lighter md:hidden shadow-lg"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {navItems
            .map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const href = item.href ? `/${locale}${item.href}` : `/${locale}`;

              return (
                <Link
                  key={item.href}
                  href={href}
                  className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                    active
                      ? 'text-brand-gold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-brand-gold'
                  }`}
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center"
                  >
                    <Icon className={`w-6 h-6 mb-1 ${active ? 'text-brand-gold' : ''}`} />
                    <span className="text-xs font-medium">{getLabel(item)}</span>
                  </motion.div>
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-gold rounded-t-full"
                    />
                  )}
                </Link>
              );
            })}
        </div>
      </motion.nav>

      {/* Spacer for mobile bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}

