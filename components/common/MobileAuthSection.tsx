'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';

export default function MobileAuthSection({ locale, onClose }: { locale: string; onClose: () => void }) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);

  if (isLoading) {
    return <div className="w-full h-10 bg-gray-200 rounded-md animate-pulse"></div>;
  }

  if (!session?.user) {
    // Hidden on mobile for guests to funnel entirely to Telegram CTA
    return null;
  }


  // Authenticated mobile menu
  const isAdmin = session?.user?.role && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_DIRECTOR', 'GROWTH_MANAGER', 'CONSULTANT'].includes(session.user.role);
  const profileText = locale === 'tj' ? 'Профили ман' : locale === 'ru' ? 'Мой профиль' : 'My Profile';
  const adminText = locale === 'tj' ? 'Панели идоракунӣ' : locale === 'ru' ? 'Панель администратора' : 'Admin Dashboard';
  const logoutText = locale === 'tj' ? 'Баромадан' : locale === 'ru' ? 'Выйти' : 'Log Out';

  return (
    <div className="space-y-2">
      <Link
        href={`/${locale}/dashboard`}
        className="block px-4 py-2.5 text-brand-navy hover:bg-brand-gold/10 rounded-md font-sans font-medium transition-colors"
        onClick={onClose}
      >
        {profileText}
      </Link>
      {isAdmin && (
        <Link
          href={`/${locale}/admin`}
          className="block px-4 py-2.5 bg-brand-gold text-brand-navy rounded-md font-heading font-bold text-center"
          onClick={onClose}
        >
          {adminText}
        </Link>
      )}
      <button
        onClick={() => {
          onClose();
          signOut({ callbackUrl: `/${locale}` });
        }}
        className="w-full px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-md font-sans font-medium transition-colors text-left"
      >
        {logoutText}
      </button>
    </div>
  );
}

