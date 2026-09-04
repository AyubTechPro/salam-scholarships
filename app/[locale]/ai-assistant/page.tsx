import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AIAssistantClient from '@/components/ai/AIAssistantClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'ai' });

  return {
    title: t('metaTitle') || 'AI Assistant - Salam Scholarships',
    description: t('metaDescription') || 'Get instant help with scholarships and study abroad from Salam Scholarships AI.',
  };
}

export default function AIAssistantPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-12 pt-24 md:px-6 md:pt-28">
      <AIAssistantClient />
    </div>
  );
}
