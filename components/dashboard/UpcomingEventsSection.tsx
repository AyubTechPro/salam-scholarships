'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Video, UserCheck, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type Event = {
  id: string;
  title: string;
  titleRu?: string | null;
  titleTj?: string | null;
  description: string;
  descriptionRu?: string | null;
  descriptionTj?: string | null;
  type: 'ONLINE' | 'OFFLINE';
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  meetingUrl?: string | null;
  imageUrl?: string | null;
  maxCapacity?: number | null;
  registeredCount: number;
  status: string;
  isRegistered?: boolean;
};

export default function UpcomingEventsSection() {
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?status=UPCOMING&limit=10');
      const result = await response.json();
      if (result.success && result.data) {
        // Check registration status for each event
        const eventsWithRegistration = await Promise.all(
          result.data.map(async (event: Event) => {
            try {
              const regResponse = await fetch(`/api/events/${event.id}/registration-status`);
              const regResult = await regResponse.json();
              return {
                ...event,
                isRegistered: regResult.isRegistered || false,
              };
            } catch {
              return { ...event, isRegistered: false };
            }
          })
        );
        setEvents(eventsWithRegistration);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    setRegistering(eventId);
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
      });

      const result = await response.json();
      if (result.success) {
        // Refresh events to update registration status
        await fetchEvents();
        alert(
          locale === 'tj'
            ? 'Шумо бомуваффақият ба ин чорабинӣ сабти ном кардед!'
            : locale === 'ru'
            ? 'Вы успешно зарегистрировались на это мероприятие!'
            : 'Successfully registered for this event!'
        );
      } else {
        alert(result.error || (locale === 'tj' ? 'Хатогӣ ба амал омад' : locale === 'ru' ? 'Произошла ошибка' : 'An error occurred'));
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      alert(locale === 'tj' ? 'Хатогӣ ба амал омад' : locale === 'ru' ? 'Произошла ошибка' : 'An error occurred');
    } finally {
      setRegistering(null);
    }
  };

  const getLocalizedContent = (event: Event) => {
    if (locale === 'ru' && event.titleRu) {
      return {
        title: event.titleRu,
        description: event.descriptionRu || event.description,
      };
    }
    if (locale === 'tj' && event.titleTj) {
      return {
        title: event.titleTj,
        description: event.descriptionTj || event.description,
      };
    }
    return {
      title: event.title,
      description: event.description,
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      locale === 'tj' ? 'tg-TJ' : locale === 'ru' ? 'ru-RU' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">
          {locale === 'tj'
            ? 'Ҳеҷ чорабинӣ дар назар нест'
            : locale === 'ru'
            ? 'Нет предстоящих мероприятий'
            : 'No upcoming events'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => {
        const content = getLocalizedContent(event);
        const isFull = event.maxCapacity && event.registeredCount >= event.maxCapacity;
        const canRegister = !event.isRegistered && !isFull && event.status === 'UPCOMING';

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              {/* Event Image */}
              {event.imageUrl && (
                <div className="relative h-48 md:h-full rounded-lg overflow-hidden">
                  <Image
                    src={event.imageUrl}
                    alt={content.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              )}

              {/* Event Details */}
              <div className={event.imageUrl ? 'md:col-span-2' : 'md:col-span-3'}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-heading font-bold text-brand-navy mb-2">
                      {content.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {content.description}
                    </p>
                  </div>
                  {event.isRegistered && (
                    <div className="flex items-center space-x-2 text-green-600 ml-4">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-semibold">
                        {locale === 'tj' ? 'Сабтшуда' : locale === 'ru' ? 'Зарегистрирован' : 'Registered'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-5 h-5 text-brand-gold" />
                    <span className="text-sm">{formatDate(event.startDate)}</span>
                  </div>
                  {event.type === 'ONLINE' ? (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Video className="w-5 h-5 text-brand-gold" />
                      <span className="text-sm">Online Event</span>
                    </div>
                  ) : (
                    event.location && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="w-5 h-5 text-brand-gold" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    )
                  )}
                  {event.maxCapacity && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <UserCheck className="w-5 h-5 text-brand-gold" />
                      <span className="text-sm">
                        {event.registeredCount} / {event.maxCapacity}{' '}
                        {locale === 'tj' ? 'даромад' : locale === 'ru' ? 'участников' : 'attendees'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 mt-4">
                  {canRegister ? (
                    <button
                      onClick={() => handleRegister(event.id)}
                      disabled={registering === event.id}
                      className="px-6 py-2 bg-brand-gold text-brand-navy rounded-lg font-heading font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {registering === event.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>
                            {locale === 'tj' ? 'Сабтшавӣ...' : locale === 'ru' ? 'Регистрация...' : 'Registering...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {locale === 'tj' ? 'Сабти ном' : locale === 'ru' ? 'Зарегистрироваться' : 'Register'}
                          </span>
                        </>
                      )}
                    </button>
                  ) : isFull ? (
                    <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm">
                      {locale === 'tj' ? 'Пурра' : locale === 'ru' ? 'Заполнено' : 'Full'}
                    </span>
                  ) : null}
                  <Link
                    href={`/${locale}/events/${event.id}`}
                    className="px-4 py-2 border-2 border-brand-navy text-brand-navy rounded-lg font-semibold hover:bg-brand-navy hover:text-white transition-all flex items-center space-x-2"
                  >
                    <span>
                      {locale === 'tj' ? 'Маълумоти бештар' : locale === 'ru' ? 'Подробнее' : 'View Details'}
                    </span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

