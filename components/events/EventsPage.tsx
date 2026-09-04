'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Video, Users, Clock, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { enUS, ru, type Locale } from 'date-fns/locale';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  titleRu?: string | null;
  titleTj?: string | null;
  description: string;
  descriptionRu?: string | null;
  descriptionTj?: string | null;
  type: string;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  meetingUrl?: string | null;
  imageUrl?: string | null;
  maxParticipants?: number | null;
  registeredCount: number;
  status: string;
}

const dateLocales: Record<string, Locale> = {
  en: enUS,
  ru: ru,
  tj: enUS,
};

export default function EventsPage() {
  const locale = useLocale();
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/events?status=OPEN&limit=20');
      const result = await response.json();
      if (result.success) {
        setEvents(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error(locale === 'tj' ? 'Хатогӣ ба амал омад' : locale === 'ru' ? 'Произошла ошибка' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleQuickRegister = async (eventId: string) => {
    if (!session?.user) {
      toast.error(locale === 'tj' ? 'Лутфан ба система ворид шавед' : locale === 'ru' ? 'Пожалуйста, войдите в систему' : 'Please log in first');
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          locale === 'tj' 
            ? `Хуш омадед ${session.user.name || ''}! Шумо ба чорабинӣ қайд карда шудед.`
            : locale === 'ru'
            ? `Добро пожаловать ${session.user.name || ''}! Вы зарегистрированы на мероприятие.`
            : `Welcome ${session.user.name || ''}! You've successfully registered for this event.`
        );
        fetchEvents(); // Refresh list
      } else {
        toast.error(result.error || (locale === 'tj' ? 'Хатогӣ ба амал омад' : locale === 'ru' ? 'Произошла ошибка' : 'An error occurred'));
      }
    } catch (error) {
      console.error('Error registering:', error);
      toast.error(locale === 'tj' ? 'Хатогӣ ба амал омад' : locale === 'ru' ? 'Произошла ошибка' : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  const dateLocale = dateLocales[locale] || enUS;

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-navy mb-4">
            {locale === 'tj' ? 'Чорабинӣҳо ва Семинарҳо' : locale === 'ru' ? 'Мероприятия и Семинары' : 'Events & Seminars'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {locale === 'tj' 
              ? 'Дар чорабиниҳои мо иштирок кунед ва дониши худро зиёд кунед'
              : locale === 'ru'
              ? 'Присоединяйтесь к нашим мероприятиям и расширяйте свои знания'
              : 'Join our events and expand your knowledge'}
          </p>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {locale === 'tj' ? 'Ҳоло ягон чорабинӣ нест' : locale === 'ru' ? 'Пока нет мероприятий' : 'No events scheduled'}
            </h3>
            <p className="text-gray-500">
              {locale === 'tj' ? 'Чорабинӣҳои нав ба зудӣ пахш карда мешаванд' : locale === 'ru' ? 'Новые мероприятия скоро будут объявлены' : 'New events will be announced soon'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const title = (locale === 'ru' && event.titleRu) || (locale === 'tj' && event.titleTj) || event.title;
              const description = (locale === 'ru' && event.descriptionRu) || (locale === 'tj' && event.descriptionTj) || event.description;
              const startDate = new Date(event.startDate);
              const isFull = event.maxParticipants ? event.registeredCount >= event.maxParticipants : false;
              const capacityPercentage = event.maxParticipants 
                ? Math.round((event.registeredCount / event.maxParticipants) * 100)
                : 0;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100"
                >
                  {/* Event Image */}
                  {event.imageUrl && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={event.imageUrl}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}

                  {/* Event Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-heading font-bold text-brand-navy line-clamp-2 flex-1">
                        {title}
                      </h3>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {description}
                    </p>

                    {/* Event Meta */}
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-gold" />
                        <span>{format(startDate, 'PPP', { locale: dateLocale })}</span>
                      </div>
                      {event.type === 'ONLINE' ? (
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-brand-gold" />
                          <span>{locale === 'tj' ? 'Онлайн' : locale === 'ru' ? 'Онлайн' : 'Online'}</span>
                        </div>
                      ) : (
                        event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-brand-gold" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-brand-gold" />
                        <span>
                          {event.registeredCount} / {event.maxParticipants || '∞'}{' '}
                          {locale === 'tj' ? 'иштирокчиён' : locale === 'ru' ? 'участников' : 'participants'}
                        </span>
                        {event.maxParticipants && (
                          <span className={`text-xs font-medium ${
                            capacityPercentage >= 90 ? 'text-red-600' :
                            capacityPercentage >= 70 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            ({capacityPercentage}%)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Link
                        href={`/${locale}/events/${event.id}`}
                        className="flex-1 text-center px-4 py-2 text-brand-navy hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
                      >
                        {locale === 'tj' ? 'Муфассалтар' : locale === 'ru' ? 'Подробнее' : 'Details'}
                      </Link>
                      {session?.user ? (
                        <button
                          onClick={() => handleQuickRegister(event.id)}
                          disabled={isFull || event.status !== 'OPEN'}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-gold text-brand-navy rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                          title={locale === 'tj' ? 'Барои қайдгирӣ бо як клик пахш кунед' : locale === 'ru' ? 'Нажмите для регистрации одним кликом' : 'Click for one-click registration'}
                        >
                          {isFull ? (
                            <>
                              <XCircle className="w-4 h-4" />
                              <span>{locale === 'tj' ? 'Пур' : locale === 'ru' ? 'Полно' : 'Full'}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{locale === 'tj' ? 'Таъйид кардани иштирок' : locale === 'ru' ? 'Подтвердить участие' : 'Confirm Attendance'}</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <Link
                          href={`/${locale}/auth/signin?redirect=/${locale}/events/${event.id}`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-gold text-brand-navy rounded-lg hover:bg-yellow-500 transition-colors text-sm font-semibold"
                        >
                          <ArrowRight className="w-4 h-4" />
                          <span>{locale === 'tj' ? 'Барои қайд кардан ворид шавед' : locale === 'ru' ? 'Войти для регистрации' : 'Sign in to Register'}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

