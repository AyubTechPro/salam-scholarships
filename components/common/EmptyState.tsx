'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import {
  Inbox,
  Users,
  GraduationCap,
  Award,
  MessageSquare,
  FileText,
  Search,
  FolderOpen,
  AlertCircle,
  Calendar,
  Handshake,
} from 'lucide-react';

type EmptyStateType =
  | 'consultations'
  | 'students'
  | 'programs'
  | 'achievements'
  | 'messages'
  | 'events'
  | 'seminars'
  | 'documents'
  | 'partners'
  | 'general';

type EmptyStateProps = {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

const emptyStateConfig: Record<
  EmptyStateType,
  { icon: any; defaultTitle: Record<string, string>; defaultDescription: Record<string, string> }
> = {
  consultations: {
    icon: MessageSquare,
    defaultTitle: {
      en: 'No Consultation Requests',
      ru: 'Нет запросов на консультацию',
      tj: 'Ҳоло ягон дархости машварат нест',
    },
    defaultDescription: {
      en: 'New consultation requests will appear here',
      ru: 'Новые запросы на консультацию будут отображаться здесь',
      tj: 'Дархостҳои нави машварат дар ин ҷо намоиш дода мешаванд',
    },
  },
  students: {
    icon: Users,
    defaultTitle: {
      en: 'No Students Yet',
      ru: 'Пока нет студентов',
      tj: 'Ҳоло ягон донишҷӯ нест',
    },
    defaultDescription: {
      en: 'Student profiles will appear here once they register',
      ru: 'Профили студентов будут отображаться здесь после регистрации',
      tj: 'Профилҳои донишҷӯён пас аз бақайдгирӣ дар ин ҷо намоиш дода мешаванд',
    },
  },
  programs: {
    icon: GraduationCap,
    defaultTitle: {
      en: 'No Opportunities',
      ru: 'Нет возможностей',
      tj: 'Ҳоло ягон имконият нест',
    },
    defaultDescription: {
      en: 'Create your first opportunity to get started',
      ru: 'Создайте первую возможность, чтобы начать',
      tj: 'Барои оғоз кардани кор, аввалин имкониятро эҷод кунед',
    },
  },
  achievements: {
    icon: Award,
    defaultTitle: {
      en: 'No Success Stories',
      ru: 'Нет историй успеха',
      tj: 'Ҳоло ягон ҳикояи муваффақият нест',
    },
    defaultDescription: {
      en: 'Share your success stories to inspire students',
      ru: 'Поделитесь историями успеха, чтобы вдохновить студентов',
      tj: 'Барои илоҳ кардани донишҷӯён, ҳикояҳои муваффақияти худро ба мубодила гузоред',
    },
  },
  messages: {
    icon: Inbox,
    defaultTitle: {
      en: 'No Messages',
      ru: 'Нет сообщений',
      tj: 'Ҳоло ягон паём нест',
    },
    defaultDescription: {
      en: 'New messages will appear here',
      ru: 'Новые сообщения будут отображаться здесь',
      tj: 'Паёмҳои нав дар ин ҷо намоиш дода мешаванд',
    },
  },
  events: {
    icon: Calendar,
    defaultTitle: {
      en: 'No Events',
      ru: 'Нет мероприятий',
      tj: 'Ҳоло ягон чорабинӣ нест',
    },
    defaultDescription: {
      en: 'Create events to engage with your community',
      ru: 'Создавайте мероприятия для взаимодействия с сообществом',
      tj: 'Барои муошират бо ҷомеаи худ, чорабиниҳоро эҷод кунед',
    },
  },
  seminars: {
    icon: GraduationCap,
    defaultTitle: {
      en: 'No Seminars',
      ru: 'Нет семинаров',
      tj: 'Ҳоло ягон семинар нест',
    },
    defaultDescription: {
      en: 'Organize seminars to share knowledge',
      ru: 'Организуйте семинары для обмена знаниями',
      tj: 'Барои мубодилаи илм, семинарҳоро ташкил кунед',
    },
  },
  documents: {
    icon: FileText,
    defaultTitle: {
      en: 'No Documents',
      ru: 'Нет документов',
      tj: 'Ҳоло ягон ҳуҷҷат нест',
    },
    defaultDescription: {
      en: 'Upload documents to share with students',
      ru: 'Загрузите документы для обмена со студентами',
      tj: 'Барои мубодила бо донишҷӯён, ҳуҷҷатҳоро бор кунед',
    },
  },
  partners: {
    icon: Handshake,
    defaultTitle: {
      en: 'No Partners',
      ru: 'Нет партнеров',
      tj: 'Ҳоло ягон шарик нест',
    },
    defaultDescription: {
      en: 'Add partners to expand your network',
      ru: 'Добавьте партнеров для расширения сети',
      tj: 'Барои васеъ кардани шабакаи худ, шариконро илова кунед',
    },
  },
  general: {
    icon: FolderOpen,
    defaultTitle: {
      en: 'No Data Found',
      ru: 'Данные не найдены',
      tj: 'Маълумот ёфт нашуд',
    },
    defaultDescription: {
      en: 'There is no data to display at this time',
      ru: 'В данный момент нет данных для отображения',
      tj: 'Дар вақти ҷорӣ маълумоте барои намоиш вуҷуд надорад',
    },
  },
};

export default function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const locale = useLocale();
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  const displayTitle = title || config.defaultTitle[locale] || config.defaultTitle.en;
  const displayDescription = description || config.defaultDescription[locale] || config.defaultDescription.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-24 h-24 rounded-full bg-brand-gold/10 flex items-center justify-center mb-6">
        <Icon className="w-12 h-12 text-brand-gold" />
      </div>
      <h3 className="text-xl font-heading font-bold text-brand-navy mb-2">{displayTitle}</h3>
      <p className="text-gray-600 max-w-md mb-6">{displayDescription}</p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-brand-gold text-brand-navy rounded-lg font-semibold hover:bg-yellow-500 transition-colors shadow-lg hover:shadow-xl"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}

