import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PartnerDashboardClient from '@/components/partner/PartnerDashboardClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata' });
  return {
    title: `B2B Partner Portal - Salam Scholarships`,
    description: `Manage university applications and applicant pipelines.`,
  };
}

export default async function PartnerDashboardPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  
  // We already verify role in layout, but need partner details here
  const partner = await prisma.partner.findFirst({
    where: {
      users: {
        some: {
          id: session?.user?.id
        }
      }
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-5">
        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
          {partner?.name || 'Partner'} Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Review and manage submitted applications for your academic programs.
        </p>
      </div>

      <PartnerDashboardClient />
    </div>
  );
}
