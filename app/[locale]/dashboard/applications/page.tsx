import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ApplicationsBoard from '@/components/dashboard/ApplicationsBoard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'dashboard' });
  return {
    title: `${t('applications.title') || 'My Applications'} - Salam Scholarships`,
  };
}

export default async function ApplicationsTrackingPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.id) {
    redirect(`/${params.locale}/login`);
  }

  // Ensure admins don't accidentally navigate to student tracking spaces
  const userRole = session.user.role || 'USER';
  if (['SUPER_ADMIN', 'ADMIN', 'CONTENT_DIRECTOR', 'GROWTH_MANAGER', 'CONSULTANT'].includes(userRole)) {
    redirect(`/${params.locale}/admin/applications`);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ApplicationsBoard />
      </div>
    </div>
  );
}
