'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Video, Users, Clock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from '@/components/common/ImageWithFallback';
import { format } from 'date-fns';
import { enUS, ru, type Locale } from 'date-fns/locale';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

type Event = {
  id: string;
  title: string;
  titleRu?: string | null;
  titleTj?: string | null;
  description: string;
  descriptionRu?: string | null;
  descriptionTj?: string | null;
  type: string;
  startDate: Date | string;
  endDate?: Date | string | null;
  location?: string | null;
  meetingUrl?: string | null;
  imageUrl?: string | null;
  maxCapacity?: number | null;
  registeredCount: number;
  status: string;
  bookings: Array<{ id: string; userId: string }>;
};

const dateLocales: Record<string, Locale> = {
  en: enUS,
  ru: ru,
  tj: enUS,
};

export default function EventDetail({ event, locale: propLocale }: { event: Event; locale: string }) {
  const t = useTranslations('common');
  const currentLocale = useLocale();
  const locale = propLocale || currentLocale;
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const title = (locale === 'ru' && event.titleRu) || (locale === 'tj' && event.titleTj) || event.title;
  const description = (locale === 'ru' && event.descriptionRu) || (locale === 'tj' && event.descriptionTj) || event.description;

  const startDate = typeof event.startDate === 'string' ? new Date(event.startDate) : event.startDate;
  const endDate = event.endDate ? (typeof event.endDate === 'string' ? new Date(event.endDate) : event.endDate) : null;
  const dateLocale = dateLocales[locale] || enUS;

  const isRegistered = session?.user?.id && event.bookings.some(b => b.userId === session.user.id);
  const isFull = event.maxCapacity ? event.registeredCount >= event.maxCapacity : false;
  const canRegister = event.status === 'UPCOMING' && !isFull && !isRegistered;

  const handleRegister = async () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(data.error || 'Failed to register');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href={`/${currentLocale}/dashboard?tab=events`}
          className="inline-flex items-center space-x-2 text-navy hover:text-gold transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back to Events</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            {event.imageUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
              >
                <Image
                  src={event.imageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              </motion.div>
            )}

            {/* Title & Meta */}
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-navy mb-6">
                {title}
              </h1>

              <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gold" />
                  <span>{format(startDate, 'PPP', { locale: dateLocale })}</span>
                  {endDate && <span> - {format(endDate, 'PPP', { locale: dateLocale })}</span>}
                </div>
                {event.type === 'OFFLINE' && event.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-gold" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.type === 'ONLINE' && event.meetingUrl && (
                  <div className="flex items-center space-x-2">
                    <Video className="w-5 h-5 text-gold" />
                    <span>Online Event</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gold" />
                  <span>{event.registeredCount} {event.maxCapacity ? `/${event.maxCapacity}` : ''} registered</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
              <h3 className="text-2xl font-heading font-bold text-navy mb-6">Event Details</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Date</div>
                  <div className="font-semibold text-navy">
                    {format(startDate, 'PPP', { locale: dateLocale })}
                  </div>
                </div>
                {event.type === 'OFFLINE' && event.location && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Location</div>
                    <div className="font-semibold text-navy">{event.location}</div>
                  </div>
                )}
                {event.type === 'ONLINE' && event.meetingUrl && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Meeting Link</div>
                    <a
                      href={event.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gold hover:underline"
                    >
                      Join Online
                    </a>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500 mb-1">Capacity</div>
                  <div className="font-semibold text-navy">
                    {event.registeredCount} {event.maxCapacity ? `of ${event.maxCapacity}` : ''} registered
                  </div>
                </div>
              </div>

              {/* Registration Button */}
              {success ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-semibold">Success! You are registered</p>
                </div>
              ) : isRegistered ? (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-blue-800 font-semibold">You are registered for this event</p>
                </div>
              ) : isFull ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-red-800 font-semibold">Event is full</p>
                </div>
              ) : canRegister ? (
                <>
                  <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full bg-gradient-gold text-navy px-6 py-4 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Registering...' : 'Register for Seminar'}
                  </button>
                  {error && (
                    <div className="mt-4 text-red-600 text-sm text-center">{error}</div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-gray-600 font-semibold">Registration closed</p>
                </div>
              )}

              {/* Login Modal */}
              {showLoginModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                    <h3 className="text-2xl font-bold text-navy mb-4">Login Required</h3>
                    <p className="text-gray-600 mb-6">
                      Please log in or sign up to register for this event.
                    </p>
                    <div className="flex gap-4">
                      <Link
                        href={`/${currentLocale}/login`}
                        className="flex-1 bg-gold text-navy px-6 py-3 rounded-lg font-semibold text-center hover:bg-yellow-400 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href={`/${currentLocale}/signup`}
                        className="flex-1 bg-navy text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-navy-dark transition-colors"
                      >
                        Sign Up
                      </Link>
                      <button
                        onClick={() => setShowLoginModal(false)}
                        className="px-6 py-3 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

