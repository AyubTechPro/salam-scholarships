'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, GraduationCap, RefreshCw, Globe, Sun, Sparkles } from 'lucide-react';
import Logo from '@/components/common/Logo';
import HeaderAuth from '@/components/common/HeaderAuth';
import MobileAuthSection from '@/components/common/MobileAuthSection';
import { useScopedTranslation } from '@/lib/scoped-translation-client';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { useGlobalContent } from '@/components/providers/GlobalContentProvider';
import UIDictionaryText from '@/components/common/UIDictionaryText';

export default function NavbarModern() {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const { getDictionaryText, getNavigation, loading: globalContentLoading } = useGlobalContent();
  const consultingText = getDictionaryText('navbar.consultation', locale === 'tj' ? 'Машварат' : locale === 'ru' ? 'Консультация' : 'Consultation');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Function to get the path without locale prefix
  const getPathWithoutLocale = () => {
    if (!pathname) return '/';
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
    return pathWithoutLocale === '' ? '/' : pathWithoutLocale;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Use GlobalContentProvider for navigation
  const navigationItems = getNavigation('navbar');

  // Transform navigation items from GlobalContentProvider to local format
  const navLinks = navigationItems.map((item) => {
    // Get localized label
    const label = locale === 'ru' && item.labelRu ? item.labelRu : 
                  locale === 'tj' && item.labelTj ? item.labelTj : 
                  item.label;
    
    // Build href with locale prefix (if not external)
    let href = item.href;
    if (!item.isExternal && !item.href.startsWith('http')) {
      href = `/${locale}${item.href.startsWith('/') ? item.href : '/' + item.href}`;
    }

    // Transform children/submenu
    let submenu = item.children?.map((child) => {
      let childHref = child.href;
      if (!child.isExternal && !child.href.startsWith('http')) {
        childHref = `/${locale}${child.href.startsWith('/') ? child.href : '/' + child.href}`;
      }
      // Handle legacy category routes
      if (childHref.match(/\/opportunities\/(scholarships|exchange|forums|summer|international)(\/|$)/)) {
        childHref = childHref.replace(/\/opportunities\/(scholarships|exchange|forums|summer|international)/, '/opportunities/category/$1');
      }
      return {
        href: childHref,
        label: locale === 'ru' && child.labelRu ? child.labelRu : 
               locale === 'tj' && child.labelTj ? child.labelTj : 
               child.label,
      };
    });

    // Force inject standard opportunities submenu if the DB has none yet
    if (item.href === 'opportunities' || item.href === '/opportunities') {
      if (!submenu || submenu.length === 0) {
        submenu = [
          { href: `/${locale}/opportunities/category/scholarships`, label: t('scholarships') },
          { href: `/${locale}/opportunities/category/exchange`, label: t('exchangePrograms') },
          { href: `/${locale}/opportunities/category/forums`, label: t('forumsConferences') },
          { href: `/${locale}/opportunities/category/summer`, label: t('summerPrograms') },
        ];
      }
    }

    return {
      href,
      label,
      submenu: submenu && submenu.length > 0 ? submenu : undefined,
      isExternal: item.isExternal,
    };
  });

  // Fallback to default navigation if GlobalContentProvider is loading or empty
  const [fallbackNavLinks] = useState<Array<{
    href: string;
    label: string;
    submenu?: Array<{ href: string; label: string }>;
    isExternal?: boolean;
  }>>([
    { href: `/${locale}`, label: t('home') },
    { 
      href: `/${locale}/opportunities`, 
      label: t('opportunities'),
      submenu: [
        { href: `/${locale}/opportunities/category/scholarships`, label: t('scholarships') },
        { href: `/${locale}/opportunities/category/exchange`, label: t('exchangePrograms') },
        { href: `/${locale}/opportunities/category/forums`, label: t('forumsConferences') },
        { href: `/${locale}/opportunities/category/summer`, label: t('summerPrograms') },
      ]
    },
    { href: `/${locale}/partners`, label: t('partners') },
    { href: `/${locale}/about`, label: locale === 'tj' ? 'Лоиҳа' : t('about') },
  ]);

  // Use dynamic navigation if available, otherwise use fallback
  const displayNavLinks = (navLinks.length > 0 && !globalContentLoading) ? navLinks : fallbackNavLinks;

  const isActive = (href: string) => {
    const pathWithoutLocale = getPathWithoutLocale();
    if (href === `/${locale}` || href === `/${locale}/`) {
      return pathWithoutLocale === '/';
    }
    return pathWithoutLocale === href.replace(`/${locale}`, '') || pathname === href;
  };

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 glass dark:glass-dark transition-all duration-300">
      <div className="max-w-screen-2xl mx-auto px-8">
        {/* Main Header Container */}
        <div className="flex items-center justify-between h-20 relative">
          {/* LEFT: Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href={`/${locale}`} className="flex items-center hover:opacity-80 transition-opacity duration-200">
              <Logo size="md" showTagline={false} variant="light" />
            </Link>
          </div>

          {/* CENTER: Navigation Links */}
          <div className="hidden lg:flex absolute left-[45%] top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-x-8">
            {displayNavLinks.map((link) => (
              <div 
                key={link.href} 
                className="relative group py-2" 
                ref={link.submenu ? dropdownRef : null}
                onMouseEnter={() => link.submenu && setOpenDropdown(link.href)}
                onMouseLeave={() => link.submenu && setOpenDropdown(null)}
              >
                {link.submenu ? (
                  <>
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all text-sm font-medium whitespace-nowrap ${
                        isActive(link.href)
                          ? 'text-brand-gold'
                          : 'text-brand-navy/80 dark:text-gray-300 group-hover:text-brand-gold'
                      }`}
                    >
                      <Link href={link.href} className="hover:text-brand-gold">
                        {link.label}
                      </Link>
                      <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === link.href ? 'rotate-180 text-brand-gold' : ''}`} />
                    </div>
                    <AnimatePresence>
                      {openDropdown === link.href && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-2 z-[100]"
                        >
                          <div className="bg-white/95 backdrop-blur-md dark:bg-navy/95 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-navy-lighter p-3 grid grid-cols-2 gap-2 w-[480px]">
                            {link.submenu.map((subLink) => {
                              let Icon = Sparkles;
                              let desc = '';
                              if (subLink.href.includes('scholarships')) { Icon = GraduationCap; desc = locale === 'tj' ? 'Маблағгузорӣ ва таҳсил' : locale === 'ru' ? 'Стипендии и гранты' : 'Financial support'; }
                              else if (subLink.href.includes('exchange')) { Icon = RefreshCw; desc = locale === 'tj' ? 'Як семестр дар хориҷа' : locale === 'ru' ? 'Семестр за рубежом' : 'A semester abroad'; }
                              else if (subLink.href.includes('forums')) { Icon = Globe; desc = locale === 'tj' ? 'Шабакасозӣ ва саёҳат' : locale === 'ru' ? 'Нетворкинг и поездки' : 'Networking & travel'; }
                              else if (subLink.href.includes('summer')) { Icon = Sun; desc = locale === 'tj' ? 'Омӯзиши кӯтоҳмуддат' : locale === 'ru' ? 'Краткосрочное обучение' : 'Short-term learning'; }
                              
                              return (
                                <Link
                                  key={subLink.href}
                                  href={subLink.href}
                                  className="group flex items-start p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-light/50 transition-all duration-200 border border-transparent hover:border-gray-100 dark:hover:border-navy-lighter"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  <div className="flex-shrink-0 mt-0.5 p-2 rounded-lg bg-brand-gold/10 text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all">
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div className="ml-3 text-left">
                                    <p className="text-[14px] font-bold text-gray-900 dark:text-white group-hover:text-brand-gold transition-colors">
                                      {subLink.label}
                                    </p>
                                    <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                                      {desc}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : link.isExternal ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-3 py-1.5 rounded-md transition-all text-sm font-medium whitespace-nowrap ${
                      isActive(link.href)
                        ? 'text-brand-gold'
                        : 'text-brand-navy/80 dark:text-gray-300 hover:text-brand-gold'
                    }`}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className={`px-3 py-1.5 rounded-md transition-all text-sm font-medium whitespace-nowrap ${
                      isActive(link.href)
                        ? 'text-brand-gold'
                        : 'text-brand-navy/80 dark:text-gray-300 hover:text-brand-gold'
                    }`}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* RIGHT: Language Switcher + Auth + CTA */}
          <div className="flex items-center gap-x-6 flex-shrink-0 ml-8">
            {/* Language Switcher (Compact Pill) */}
            <div className="hidden md:flex items-center">
              <LanguageSwitcher />
            </div>

            {/* Auth Section (includes User Menu with Theme Toggle inside) */}
            <div className="hidden md:flex items-center">
              <HeaderAuth />
            </div>
            
            {/* CTA: Consultation Button (ONLY primary CTA) */}
            <Link
              href={`/${locale}/consulting`}
              className="btn-premium-gold px-6 py-2 text-sm font-bold tracking-wide whitespace-nowrap shadow-md shadow-brand-gold/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              {consultingText}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-brand-navy dark:text-white hover:text-brand-gold hover:bg-gray-100 dark:hover:bg-navy-lighter rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t glass dark:glass-dark"
            >
              <div className="flex flex-col space-y-4">
                {displayNavLinks.map((link) => (
                  <div key={link.href}>
                    {link.submenu ? (
                      <div>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === link.href ? null : link.href)}
                          className="flex items-center justify-between w-full px-3 py-2 text-brand-navy dark:text-white hover:text-brand-gold hover:bg-gray-100 dark:hover:bg-navy-lighter rounded-md transition-colors font-medium"
                        >
                          <span>{link.label}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === link.href ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {openDropdown === link.href && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pl-4 mt-2 space-y-2"
                            >
                              {link.submenu.map((subLink) => (
                                <Link
                                  key={subLink.href}
                                  href={subLink.href}
                                  className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-brand-gold hover:bg-gray-100 dark:hover:bg-navy-lighter rounded-md transition-colors text-sm"
                                  onClick={() => {
                                    setIsMenuOpen(false);
                                    setOpenDropdown(null);
                                  }}
                                >
                                  {subLink.label}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : link.isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-3 py-2 text-brand-navy dark:text-white hover:text-brand-gold hover:bg-gray-100 dark:hover:bg-navy-lighter rounded-md transition-colors font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className={`block px-3 py-2 rounded-md transition-colors font-medium ${
                          isActive(link.href)
                            ? 'text-brand-gold bg-brand-gold/10'
                            : 'text-brand-navy dark:text-white hover:text-brand-gold hover:bg-gray-100 dark:hover:bg-navy-lighter'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
                
                {/* Mobile Utilities & Auth Section */}
                <div className="pt-4 border-t border-gray-200 dark:border-navy-lighter space-y-4">
                  {/* Language Switcher */}
                  <div className="flex items-center justify-between px-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Language</span>
                    <LanguageSwitcher />
                  </div>

                  {/* Consultation CTA */}
                  <Link
                    href={`/${locale}/consulting`}
                    className="block btn-premium-gold px-4 py-3 w-full text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {consultingText}
                  </Link>
                  
                  {/* Auth Buttons */}
                  <MobileAuthSection locale={locale} onClose={() => setIsMenuOpen(false)} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
