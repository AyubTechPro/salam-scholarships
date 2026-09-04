import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NavbarModern from '@/components/layout/NavbarModern';
import Footer from '@/components/layout/Footer';

export default async function PartnerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect(`/${params.locale}/login?callbackUrl=/${params.locale}/partner`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, partnerId: true },
  });

  if (!user || user.role !== 'PARTNER' || !user.partnerId) {
    redirect(`/${params.locale}/access-denied`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <NavbarModern />
      <main className="flex-grow pt-24 pb-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
