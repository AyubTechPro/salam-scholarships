import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const revalidate = 86400;

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const page = await prisma.staticPage.findUnique({
    where: { slug: 'terms' },
    select: {
      title: true,
      titleRu: true,
      titleTj: true,
    },
  });

  const title = locale === 'ru' ? page?.titleRu || page?.title || 'Terms of Service' :
                locale === 'tj' ? page?.titleTj || page?.title || 'Terms of Service' :
                page?.title || 'Terms of Service';

  return {
    title,
    description: 'Terms of Service - Salam Scholarships',
  };
}

export default async function TermsPage({ params: { locale } }: { params: { locale: string } }) {
  const page = await prisma.staticPage.findUnique({
    where: { slug: 'terms' },
  });

  if (!page || !page.isActive) {
    notFound();
  }

  const title = locale === 'ru' ? page.titleRu || page.title :
                locale === 'tj' ? page.titleTj || page.title :
                page.title;

  const content = locale === 'ru' ? page.contentRu || page.content :
                  locale === 'tj' ? page.contentTj || page.content :
                  page.content;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 md:p-12">
          <h1 className="text-4xl font-heading font-bold text-brand-navy mb-8">{title}</h1>
          <div
            className="prose prose-lg max-w-none text-gray-700 font-sans"
            dangerouslySetInnerHTML={{ __html: content }}
          />
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: {new Date(page.updatedAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'tj' ? 'tg-TJ' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
