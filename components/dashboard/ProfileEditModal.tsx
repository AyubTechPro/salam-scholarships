'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { X, Save, Loader2, MapPin, GraduationCap, Globe, User, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

type UserProfile = {
  id: string;
  name: string | null;
  surname: string | null;
  email: string;
  profession: string | null;
  city: string | null;
  country: string | null;
  educationPlace: string | null;
  languageLevel: string | null;
  telegramOrPhone: string | null;
  bio: string | null;
};

export default function ProfileEditModal({
  profile,
  onClose,
  onUpdate,
}: {
  profile: UserProfile;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const locale = useLocale();
  const { update } = useSession();
  const [formData, setFormData] = useState({
    name: profile.name || '',
    surname: profile.surname || '',
    profession: profile.profession || '',
    city: profile.city || '',
    country: profile.country || '',
    educationPlace: profile.educationPlace || '',
    languageLevel: profile.languageLevel || '',
    telegramOrPhone: profile.telegramOrPhone || '',
    bio: profile.bio || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        // Update NextAuth session to reflect changes in Navbar immediately
        await update({
          name: result.data.name && result.data.surname 
            ? `${result.data.name} ${result.data.surname}`.trim()
            : result.data.name || result.data.email?.split('@')[0] || 'User',
          image: result.data.image || null,
        });
        
        toast.success(
          locale === 'tj' ? 'Профил бомуваффақият навсозӣ шуд!' :
          locale === 'ru' ? 'Профиль успешно обновлен!' :
          'Profile updated successfully!'
        );
        onUpdate();
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-3xl">
            <h2 className="text-2xl font-heading font-bold text-brand-navy">
              {locale === 'tj' ? 'Навсозии профил' :
               locale === 'ru' ? 'Редактирование профиля' :
               'Edit Profile'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-gold" />
                  {locale === 'tj' ? 'Ном' : locale === 'ru' ? 'Имя' : 'First Name'}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                  placeholder={locale === 'tj' ? 'Номи худро ворид кунед' : locale === 'ru' ? 'Введите ваше имя' : 'Enter your first name'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-gold" />
                  {locale === 'tj' ? 'Насаб' : locale === 'ru' ? 'Фамилия' : 'Last Name'}
                </label>
                <input
                  type="text"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                  placeholder={locale === 'tj' ? 'Насаби худро ворид кунед' : locale === 'ru' ? 'Введите вашу фамилию' : 'Enter your last name'}
                />
              </div>
            </div>

            {/* Profession */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-gold" />
                {locale === 'tj' ? 'Касб' : locale === 'ru' ? 'Профессия' : 'Profession'}
              </label>
              <input
                type="text"
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                placeholder={locale === 'tj' ? 'Масалан: Донишҷӯ, Барномасоз, Доктор' : locale === 'ru' ? 'Например: Студент, Разработчик, Врач' : 'e.g., Student, Developer, Doctor'}
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-gold" />
                  {locale === 'tj' ? 'Шаҳр' : locale === 'ru' ? 'Город' : 'City'}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-gold" />
                  {locale === 'tj' ? 'Кишвар' : locale === 'ru' ? 'Страна' : 'Country'}
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                />
              </div>
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand-gold" />
                {locale === 'tj' ? 'Маълумот' : locale === 'ru' ? 'Образование' : 'Education'}
              </label>
              <input
                type="text"
                value={formData.educationPlace}
                onChange={(e) => setFormData({ ...formData, educationPlace: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                placeholder={locale === 'tj' ? 'Донишгоҳ/Мактаб' : locale === 'ru' ? 'Университет/Школа' : 'University/School'}
              />
            </div>

            {/* Language Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-gold" />
                {locale === 'tj' ? 'Сатҳи забон' : locale === 'ru' ? 'Уровень языка' : 'Language Level'}
              </label>
              <select
                value={formData.languageLevel}
                onChange={(e) => setFormData({ ...formData, languageLevel: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              >
                <option value="">{locale === 'tj' ? 'Сатҳро интихоб кунед' : locale === 'ru' ? 'Выберите уровень' : 'Select level'}</option>
                <option value="Beginner">{locale === 'tj' ? 'Оғоз' : locale === 'ru' ? 'Начальный' : 'Beginner'}</option>
                <option value="Intermediate">{locale === 'tj' ? 'Миёна' : locale === 'ru' ? 'Средний' : 'Intermediate'}</option>
                <option value="Advanced">{locale === 'tj' ? 'Пешрафта' : locale === 'ru' ? 'Продвинутый' : 'Advanced'}</option>
                <option value="Native">{locale === 'tj' ? 'Модарӣ / Омӯхта' : locale === 'ru' ? 'Родной / Свободно' : 'Native / Fluent'}</option>
              </select>
            </div>

            {/* Telegram */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-brand-gold" />
                Telegram
              </label>
              <input
                type="text"
                value={formData.telegramOrPhone}
                onChange={(e) => setFormData({ ...formData, telegramOrPhone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                placeholder="@username or phone number"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'tj' ? 'Биография' : locale === 'ru' ? 'Биография' : 'Bio'}
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none"
                placeholder={locale === 'tj' ? 'Дар бораи худ нависед...' : locale === 'ru' ? 'Напишите о себе...' : 'Write a short bio about yourself...'}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center justify-end gap-4 rounded-b-3xl">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              {locale === 'tj' ? 'Бекор кардан' : locale === 'ru' ? 'Отмена' : 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-brand-gold text-brand-navy rounded-xl font-heading font-bold hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{locale === 'tj' ? 'Захира кардани...' : locale === 'ru' ? 'Сохранение...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{locale === 'tj' ? 'Захира кардан' : locale === 'ru' ? 'Сохранить' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

