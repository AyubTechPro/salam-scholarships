'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { MessageCircle, Send, Sparkles, CheckCircle2 } from 'lucide-react';

type UserProfile = {
  telegramOrPhone: string | null;
  name: string | null;
};

export default function PremiumTelegramConnect({
  profile,
  onUpdate,
}: {
  profile: UserProfile | null;
  onUpdate: () => void;
}) {
  const locale = useLocale();

  const handleTelegramClick = async () => {
    if (!profile?.telegramOrPhone) {
      alert(
        locale === 'tj'
          ? 'Лутфан, номи корбари Telegram ё рақами телефони худро дар профил илова кунед.'
          : locale === 'ru'
          ? 'Пожалуйста, добавьте ваше имя пользователя Telegram или номер телефона в профиль.'
          : 'Please add your Telegram username or phone number in your profile first.'
      );
      return;
    }

    const telegramUsername = profile.telegramOrPhone.startsWith('@')
      ? profile.telegramOrPhone.substring(1)
      : profile.telegramOrPhone;

    try {
      const response = await fetch('/api/site-settings');
      const result = await response.json();
      const supportUsername =
        result.success && result.data?.telegramSupportUsername
          ? result.data.telegramSupportUsername
          : 'ayub_it_tj';

      const message = encodeURIComponent(
        `Hello! I'm ${profile.name || 'a student'} interested in discussing opportunities.`
      );
      window.open(`https://t.me/${supportUsername}?start=${message}`, '_blank');
    } catch (error) {
      console.error('Error fetching Telegram support username:', error);
      const message = encodeURIComponent(
        `Hello! I'm ${profile?.name || 'a student'} interested in discussing opportunities.`
      );
      window.open(`https://t.me/ayub_it_tj?start=${message}`, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy via-brand-navy/95 to-brand-navy-dark p-8 md:p-12 text-white shadow-2xl"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-gold/5 rounded-full blur-2xl" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-brand-gold/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-brand-gold/30">
                <MessageCircle className="w-7 h-7 text-brand-gold" />
              </div>
              <div>
                <h2 className="text-3xl font-heading font-bold mb-1">
                  {locale === 'tj' ? 'Пайванд бо Telegram' :
                   locale === 'ru' ? 'Подключиться к Telegram' :
                   'Connect on Telegram'}
                </h2>
                <div className="flex items-center gap-2 text-white/80">
                  <Sparkles className="w-4 h-4 text-brand-gold" />
                  <span className="text-sm">
                    {locale === 'tj' ? 'Хусусияти премиум' :
                     locale === 'ru' ? 'Премиум функция' :
                     'Premium Feature'}
                  </span>
                </div>
              </div>
            </div>

            {profile?.telegramOrPhone ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <CheckCircle2 className="w-5 h-5 text-brand-gold flex-shrink-0" />
                  <div>
                    <p className="text-white/90 font-semibold">
                      {locale === 'tj' ? 'Telegram пайванд карда шуд:' :
                       locale === 'ru' ? 'Telegram подключен:' :
                       'Telegram Connected:'}
                    </p>
                    <p className="text-brand-gold font-mono">{profile.telegramOrPhone}</p>
                  </div>
                </div>
                <p className="text-white/80">
                  {locale === 'tj' ? 'Барои пайванд шудан бо дастгирии мо, тугмаи зерро пахш кунед.' :
                   locale === 'ru' ? 'Нажмите кнопку ниже, чтобы связаться с нашей поддержкой.' :
                   'Click the button below to connect with our support team.'}
                </p>
              </div>
            ) : (
              <p className="text-white/90 text-lg mb-4">
                {locale === 'tj' ? 'Номи корбари Telegram ё рақами телефони худро дар профил илова кунед, то бо дастгирии мо пайванд шавед.' :
                 locale === 'ru' ? 'Добавьте ваше имя пользователя Telegram или номер телефона в профиль, чтобы связаться с нашей командой.' :
                 'Add your Telegram username or phone number in your profile to connect with our team.'}
              </p>
            )}

            <button
              onClick={handleTelegramClick}
              disabled={!profile?.telegramOrPhone}
              className="mt-6 inline-flex items-center gap-3 px-8 py-4 bg-brand-gold text-brand-navy rounded-xl font-heading font-bold hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
              <span>
                {locale === 'tj' ? 'Кушодани чат дар Telegram' :
                 locale === 'ru' ? 'Открыть чат в Telegram' :
                 'Open Chat in Telegram'}
              </span>
            </button>
          </div>

          {/* Visual Element */}
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-brand-gold/20 rounded-full flex items-center justify-center border-4 border-brand-gold/30">
              <MessageCircle className="w-16 h-16 text-brand-gold/50" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

