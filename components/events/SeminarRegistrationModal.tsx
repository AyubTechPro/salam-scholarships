'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
// Using browser alert for now - can be replaced with toast library
const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg),
  info: (msg: string) => alert(msg),
};

interface Seminar {
  id: string;
  title: string;
  titleRu?: string | null;
  titleTj?: string | null;
  description: string;
  date: string;
  registrationDeadline: string;
  location?: string | null;
  maxParticipants: number;
}

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
}

interface SeminarRegistrationModalProps {
  seminar: Seminar;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
  locale: string;
}

export default function SeminarRegistrationModal({
  seminar,
  user,
  onClose,
  onSuccess,
  locale,
}: SeminarRegistrationModalProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Pre-fill form if user is logged in
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/seminars/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seminarId: seminar.id,
          ...formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          locale === 'tj'
            ? 'Шумо ба муваффақият қайдгирӣ кардед!'
            : locale === 'ru'
            ? 'Вы успешно зарегистрировались!'
            : 'Successfully registered!'
        );
        onSuccess();
      } else {
        toast.error(result.error || (locale === 'tj' ? 'Хатогӣ ба амал омад' : locale === 'ru' ? 'Произошла ошибка' : 'An error occurred'));
      }
    } catch (error) {
      console.error('Error registering for seminar:', error);
      toast.error(locale === 'tj' ? 'Хатогӣ ба амал омад' : locale === 'ru' ? 'Произошла ошибка' : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const getLocalizedTitle = () => {
    return locale === 'tj' ? seminar.titleTj : locale === 'ru' ? seminar.titleRu : seminar.title;
  };

  const isOneClickRegistration = user && user.email && user.name;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-heading font-bold text-brand-navy">
            {locale === 'tj' ? 'Қайдгирӣ ба чорабинӣ' : locale === 'ru' ? 'Регистрация на семинар' : 'Seminar Registration'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Seminar Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-brand-navy">{getLocalizedTitle() || seminar.title}</h3>
            <p className="text-sm text-gray-600">
              {new Date(seminar.date).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {seminar.location && (
              <p className="text-sm text-gray-600">{seminar.location}</p>
            )}
          </div>

          {/* One-Click Notice */}
          {isOneClickRegistration && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
              <div className="text-sm text-green-900">
                <strong className="text-base block mb-2">
                  {locale === 'tj'
                    ? `Хуш омадед ${user.name || ''}!`
                    : locale === 'ru'
                    ? `Добро пожаловать ${user.name || ''}!`
                    : `Welcome ${user.name || ''}!`}
                </strong>
                <p>
                  {locale === 'tj'
                    ? 'Барои қайдгирӣ ба ин чорабинӣ бо як клик, тугмаи "Таъйид кардани иштирок"-ро пахш кунед?'
                    : locale === 'ru'
                    ? 'Для регистрации на это мероприятие одним кликом, нажмите кнопку "Подтвердить мое участие"?'
                    : 'To register for this event with one click, click the "Confirm My Attendance" button?'}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'tj' ? 'Ном' : locale === 'ru' ? 'Имя' : 'Name'} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                disabled={!!user?.name} // Disable if pre-filled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                disabled={!!user?.email} // Disable if pre-filled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'tj' ? 'Телефон' : locale === 'ru' ? 'Телефон' : 'Phone'}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                disabled={!!user?.phoneNumber} // Disable if pre-filled
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                {locale === 'tj' ? 'Бекор кардан' : locale === 'ru' ? 'Отмена' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-brand-gold text-brand-navy rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {locale === 'tj' ? 'Сабт карда истодааст...' : locale === 'ru' ? 'Регистрация...' : 'Registering...'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    {isOneClickRegistration
                      ? (locale === 'tj' ? 'Таъйид кардани иштирок' : locale === 'ru' ? 'Подтвердить мое участие' : 'Confirm My Attendance')
                      : (locale === 'tj' ? 'Қайдгирӣ кардан' : locale === 'ru' ? 'Зарегистрироваться' : 'Register')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

