import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ModernDashboard from '@/components/dashboard/ModernDashboard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata' });

  return {
    title: t('dashboard.title') || 'My Profile - Salam Scholarships',
    description: t('dashboard.description') || 'Your professional profile on Salam Scholarships platform.',
  };
}

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.id) {
    redirect(`/${params.locale}/login`);
  }

  // Redirect admins to admin panel
  const userRole = session.user.role || 'USER';
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_DIRECTOR', 'GROWTH_MANAGER', 'CONSULTANT'].includes(userRole);
  
  if (isAdmin) {
    redirect(`/${params.locale}/admin`);
  }

  return <ModernDashboard />;
}

