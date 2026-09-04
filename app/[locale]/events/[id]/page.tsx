import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import EventDetail from '@/components/events/EventDetail';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      title: true,
      titleRu: true,
      titleTj: true,
      description: true,
      descriptionRu: true,
      descriptionTj: true,
    },
  });

  if (!event) {
    return {
      title: 'Event Not Found - Salam Scholarships',
    };
  }

  const title = (locale === 'ru' && event.titleRu) || (locale === 'tj' && event.titleTj) || event.title;
  const description = (locale === 'ru' && event.descriptionRu) || (locale === 'tj' && event.descriptionTj) || event.description;

  return {
    title: `${title} - Salam Scholarships`,
    description: description?.substring(0, 160) || 'Join our educational event',
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      bookings: {
        select: {
          id: true,
          userId: true,
        },
      },
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  if (!event || !event.isActive) {
    notFound();
  }

  // Transform event to match EventDetail component type
  const eventWithCount = {
    ...event,
    registeredCount: event._count.bookings,
    imageUrl: event.image,
  };

  return <EventDetail event={eventWithCount} locale={locale} />;
}

