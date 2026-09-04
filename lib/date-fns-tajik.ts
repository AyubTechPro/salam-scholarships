/**
 * Custom Tajik locale for date-fns
 * Since date-fns doesn't have a built-in Tajik locale, we create a custom one
 */

export const tajikLocale = {
  code: 'tg',
  formatDistance: (token: string, count: number) => {
    const translations: Record<string, string> = {
      lessThanXSeconds: 'камтар аз {{count}} сония',
      xSeconds: '{{count}} сония',
      halfAMinute: 'ним дақиқа',
      lessThanXMinutes: 'камтар аз {{count}} дақиқа',
      xMinutes: '{{count}} дақиқа',
      aboutXHours: 'тақрибан {{count}} соат',
      xHours: '{{count}} соат',
      xDays: '{{count}} рӯз',
      aboutXWeeks: 'тақрибан {{count}} ҳафта',
      xWeeks: '{{count}} ҳафта',
      aboutXMonths: 'тақрибан {{count}} моҳ',
      xMonths: '{{count}} моҳ',
      aboutXYears: 'тақрибан {{count}} сол',
      xYears: '{{count}} сол',
      overXYears: 'бештар аз {{count}} сол',
      almostXYears: 'қариб {{count}} сол',
    };

    const translation = translations[token] || token;
    return translation.replace('{{count}}', count.toString());
  },
  formatDistanceStrict: (token: string, count: number) => {
    const translations: Record<string, string> = {
      xSeconds: '{{count}} сония',
      xMinutes: '{{count}} дақиқа',
      xHours: '{{count}} соат',
      xDays: '{{count}} рӯз',
      xWeeks: '{{count}} ҳафта',
      xMonths: '{{count}} моҳ',
      xYears: '{{count}} сол',
    };

    const translation = translations[token] || token;
    return translation.replace('{{count}}', count.toString());
  },
  formatRelative: (token: string) => {
    const translations: Record<string, string> = {
      lastWeek: "'ҳафтаи гузашта' eeee 'дар' p",
      yesterday: "'дирӯз' 'дар' p",
      today: "'имрӯз' 'дар' p",
      tomorrow: "'фардо' 'дар' p",
      nextWeek: "'ҳафтаи оянда' eeee 'дар' p",
      other: 'P',
    };
    return translations[token] || token;
  },
  localize: {
    ordinalNumber: (n: number) => n.toString(),
    era: () => ({}),
    quarter: () => ({}),
    month: () => ({}),
    day: () => ({}),
    dayPeriod: () => ({}),
  },
  formatLong: {
    date: () => 'dd/MM/yyyy',
    time: () => 'HH:mm',
    dateTime: () => 'dd/MM/yyyy HH:mm',
  },
  match: {},
  options: {
    weekStartsOn: 1,
    firstWeekContainsDate: 1,
  },
};

// Custom formatter for Tajik dates
export function formatDistanceToNowTajik(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSeconds = Math.floor(Math.abs(diffMs) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const isPast = diffMs < 0;
  
  // If past, show "Мӯҳлат гузашт"
  if (isPast) {
    return 'Мӯҳлат гузашт';
  }

  // If future, show "X рӯз боқӣ монд" format
  if (diffYears > 0) {
    return `${diffYears} ${diffYears === 1 ? 'сол' : 'сол'} боқӣ монд`;
  }
  if (diffMonths > 0) {
    return `${diffMonths} ${diffMonths === 1 ? 'моҳ' : 'моҳ'} боқӣ монд`;
  }
  if (diffDays > 0) {
    return `${diffDays} ${diffDays === 1 ? 'рӯз' : 'рӯз'} боқӣ монд`;
  }
  if (diffHours > 0) {
    return `${diffHours} ${diffHours === 1 ? 'соат' : 'соат'} боқӣ монд`;
  }
  if (diffMinutes > 0) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'дақиқа' : 'дақиқа'} боқӣ монд`;
  }
  return `${diffSeconds} ${diffSeconds === 1 ? 'сония' : 'сония'} боқӣ монд`;
}

// Tajik month names
const tajikMonths: Record<number, string> = {
  0: 'Январ',
  1: 'Феврал',
  2: 'Март',
  3: 'Апрел',
  4: 'Май',
  5: 'Июн',
  6: 'Июл',
  7: 'Август',
  8: 'Сентябр',
  9: 'Октябр',
  10: 'Ноябр',
  11: 'Декабр',
};

// Custom Tajik date formatter
export function formatDateTajik(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();
  
  // Format: "15-уми сентябри 2024"
  // Tajik ordinal suffixes
  const daySuffix = day === 1 ? 'уми' : day === 2 ? 'юми' : day === 3 ? 'юми' : day <= 20 ? 'уми' : 'уми';
  const monthName = tajikMonths[month];
  const monthGenitive = monthName.toLowerCase() + 'и'; // Genitive case (сентябри)
  
  return `${day}-${daySuffix} ${monthGenitive} ${year}`;
}

// Alternative format: "15 Сентябр, 2024"
export function formatDateTajikShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();
  
  return `${day} ${tajikMonths[month]}, ${year}`;
}

/**
 * Smart countdown formatter with urgency indicators
 * Returns formatted string based on days left
 */
// Uses shared business-rules-client cache (single fetch across app)
let cachedThreshold: number | null = null;

async function getCachedThreshold(): Promise<number> {
  if (cachedThreshold !== null) return cachedThreshold;
  try {
    const { getBusinessRulesClient } = await import('./business-rules-client');
    const rules = await getBusinessRulesClient();
    cachedThreshold = rules.urgentBadgeThresholdDays;
    return cachedThreshold;
  } catch {
    cachedThreshold = 7;
    return 7;
  }
}

// Synchronous version for client components (uses shared cache)
export function formatSmartCountdown(date: Date | string, locale: string = 'tj', urgentThreshold?: number): { text: string; isUrgent: boolean; isExpired: boolean; daysLeft: number } {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  const threshold = urgentThreshold ?? cachedThreshold ?? 7;
  const isExpired = diffMs < 0;
  const isUrgent = diffDays <= threshold && diffDays >= 0;
  
  // Prefetch threshold in background (uses shared business-rules-client cache)
  if (cachedThreshold === null && typeof window !== 'undefined') {
    getCachedThreshold().catch(() => {});
  }
  
  if (locale === 'tj') {
    if (isExpired) {
      return { text: 'Мӯҳлат гузашт', isUrgent: false, isExpired: true, daysLeft: diffDays };
    }
    if (diffDays === 0) {
      return { text: 'Танҳо имрӯз боқӣ монд!', isUrgent: true, isExpired: false, daysLeft: 0 };
    }
    if (diffDays > 0 && diffDays <= 7) {
      return { text: `Таъҷилӣ: ${diffDays} ${diffDays === 1 ? 'рӯз' : 'рӯз'} боқӣ монд`, isUrgent: true, isExpired: false, daysLeft: diffDays };
    }
    if (diffDays > 7) {
      return { text: `Мӯҳлат то ${formatDateTajik(dateObj)}`, isUrgent: false, isExpired: false, daysLeft: diffDays };
    }
  }
  
  // Fallback for other locales
  if (isExpired) {
    return { text: locale === 'ru' ? 'Срок истёк' : 'Expired', isUrgent: false, isExpired: true, daysLeft: diffDays };
  }
  if (diffDays === 0) {
    return { text: locale === 'ru' ? 'Только сегодня осталось!' : 'Only today left!', isUrgent: true, isExpired: false, daysLeft: 0 };
  }
  if (diffDays > 0 && diffDays <= 7) {
    return { text: locale === 'ru' ? `Срочно: ${diffDays} ${diffDays === 1 ? 'день' : 'дней'} осталось` : `Urgent: ${diffDays} ${diffDays === 1 ? 'day' : 'days'} left`, isUrgent: true, isExpired: false, daysLeft: diffDays };
  }
  
  return { text: dateObj.toLocaleDateString(locale), isUrgent: false, isExpired: false, daysLeft: diffDays };
}

