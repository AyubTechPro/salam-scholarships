'use client';

import { usePathname } from 'next/navigation';
import NavbarModern from './NavbarModern';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import AIFloatingWidget from '@/components/ai/AIFloatingWidget';

export default function ConditionalLayout({ children, locale }: { children: React.ReactNode; locale: string }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith(`/${locale}/admin`);

  // Admin routes use their own layout (handled by app/[locale]/admin/layout.tsx)
  // Just return children without Navbar/Footer
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Public routes: Navbar, Footer, Mobile Bottom Nav + AI floating widget (corner)
  return (
    <>
      <NavbarModern />
      <main className="flex-grow pb-16 md:pb-0">
        {children}
      </main>
      <MobileBottomNav />
      <Footer />
      <AIFloatingWidget />
    </>
  );
}

