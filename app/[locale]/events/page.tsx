import { getTranslations, getLocale } from 'next-intl/server';
import EventsPageComponent from '@/components/events/EventsPage';
import { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'events' });
  
  return {
    title: t('title') || 'Events & Seminars - Salam Scholarships',
    description: t('description') || 'Join our educational seminars and events',
  };
}

export default async function EventsPage() {
  return <EventsPageComponent />;
}

