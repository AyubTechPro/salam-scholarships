'use client';

import { useSession, signOut } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogIn, UserPlus, LayoutDashboard, Settings, FileText, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

export default function HeaderAuth() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('common');
  const locale = useLocale();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLoading = status === 'loading';
  const isGuest = !session?.user;
  const isAdmin = session?.user?.role && ['SUPER_ADMIN', 'ADMIN'].includes(session.user.role);

  // Translation fallbacks
  const loginText = locale === 'tj' ? 'Ворид шудан' : locale === 'ru' ? 'Войти' : 'Log In';
  const signupText = locale === 'tj' ? 'Сабти ном' : locale === 'ru' ? 'Регистрация' : 'Sign Up';
  const profileText = locale === 'tj' ? 'Профили ман' : locale === 'ru' ? 'Мой профиль' : 'My Profile';
  const applicationsText = locale === 'tj' ? 'Дархостҳои ман' : locale === 'ru' ? 'Мои заявки' : 'My Applications';
  const settingsText = locale === 'tj' ? 'Танзимот' : locale === 'ru' ? 'Настройки' : 'Settings';
  const logoutText = locale === 'tj' ? 'Баромадан' : locale === 'ru' ? 'Выйти' : 'Log Out';
  const adminDashboardText = locale === 'tj' ? 'Панели идоракунӣ' : locale === 'ru' ? 'Панель администратора' : 'Admin Dashboard';
  const themeText = locale === 'tj' ? 'Реҷаи рангин' : locale === 'ru' ? 'Темная тема' : 'Dark Mode';

  if (isLoading) {
    return (
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  // Guest View
  if (isGuest) {
    return (
      <div className="flex items-center gap-x-3">
        {/* Hidden Admin Login (URL only) or Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-brand-navy dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={themeText}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}
      </div>
    );
  }

  // Authenticated View
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'User';
  const userImage = session?.user?.image || null;
  
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-x-2 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-brand-gold/20 border-2 border-brand-gold/40 flex items-center justify-center overflow-hidden">
          {userImage ? (
            <Image
              src={userImage}
              alt={userName}
              width={36}
              height={36}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-gold to-brand-gold/80 flex items-center justify-center text-brand-navy font-bold text-sm">
              {getInitials(userName)}
            </div>
          )}
        </div>
        <span className="hidden md:block font-medium text-brand-navy dark:text-white max-w-[120px] truncate text-sm">
          {userName}
        </span>
        <ChevronDown className={`w-4 h-4 text-brand-navy dark:text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* User Menu Dropdown */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-[100]"
          >
            {/* Profile */}
            <Link
              href={`/${locale}/dashboard`}
              className="flex items-center space-x-3 px-4 py-2 text-brand-navy dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <User className="w-4 h-4" />
              <span className="text-sm">{profileText}</span>
            </Link>
            
            {/* Applications */}
            <Link
              href={`/${locale}/dashboard?tab=applications`}
              className="flex items-center space-x-3 px-4 py-2 text-brand-navy dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm">{applicationsText}</span>
            </Link>
            
            {/* Settings */}
            <Link
              href={`/${locale}/dashboard?tab=settings`}
              className="flex items-center space-x-3 px-4 py-2 text-brand-navy dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">{settingsText}</span>
            </Link>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            {/* Admin Dashboard (Only for ADMIN/SUPER_ADMIN) */}
            {isAdmin && (
              <Link
                href={`/${locale}/admin`}
                className="flex items-center space-x-3 px-4 py-2 text-brand-navy dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4 text-brand-gold" />
                <span className="text-sm font-semibold">{adminDashboardText}</span>
              </Link>
            )}

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-brand-navy dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                <span className="text-sm">{themeText}</span>
              </button>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            {/* Logout */}
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                signOut({ callbackUrl: `/${locale}` });
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">{logoutText}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
