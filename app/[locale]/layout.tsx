import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { locales } from '@/i18n/request';
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import SessionProvider from '@/components/providers/SessionProvider';
import { GlobalContentProvider } from '@/components/providers/GlobalContentProvider';
import { Toaster } from 'sonner';
import '@/app/globals.css';
import { Inter } from 'next/font/google';
import LiveTracker from '@/components/common/LiveTracker';

const inter = Inter({ subsets: ['latin', 'cyrillic'], display: 'swap' });

const DEFAULT_BASE_URL = 'https://salamconsulting.com';

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_BASE_URL;
  return raw.replace(/\/+$/, '');
}

function getLocalizedMeta(locale: string) {
  switch (locale) {
    case 'ru':
      return {
        title: 'Salam Scholarships - Глобальные возможности для обучения и стипендий',
        description:
          'Найдите стипендии, программы и образовательные возможности по всему миру с официальной поддержкой партнёрских университетов.',
      };
    case 'tj':
      return {
        title: 'Salam Scholarships - Имкониятҳои ҷаҳонӣ барои таҳсил ва стипендия',
        description:
          'Стипендияҳо, барномаҳо ва имкониятҳои таҳсилро дар саросари ҷаҳон бо дастгирии расмии шарикони донишгоҳӣ пайдо кунед.',
      };
    default:
      return {
        title: 'Salam Scholarships - Global Scholarships and Study Opportunities',
        description:
          'Discover scholarships, forums, and study opportunities worldwide with official university partner support.',
      };
  }
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = locales.includes(params.locale as any) ? params.locale : 'en';
  const baseUrl = getBaseUrl();
  const localized = getLocalizedMeta(locale);

  return {
    metadataBase: new URL(baseUrl),
    title: localized.title,
    description: localized.description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        ru: '/ru',
        'tj-TJ': '/tj',
        'x-default': '/en',
      },
    },
    openGraph: {
      title: localized.title,
      description: localized.description,
      url: `${baseUrl}/${locale}`,
      siteName: 'Salam Scholarships',
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: localized.title,
      description: localized.description,
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = await getLocale();
  
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Load branding settings and inject CSS variables
  let brandingCSS = '';
  let googleAnalyticsId = '';
  try {
    const { prisma } = await import('@/lib/prisma');
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'global' },
      select: {
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        fontFamily: true,
        headingFontFamily: true,
        googleAnalyticsId: true,
      },
    });

    if (settings) {
      brandingCSS = `
        :root {
          --color-primary: ${settings.primaryColor || '#0a192f'};
          --color-secondary: ${settings.secondaryColor || '#1e3a5f'};
          --color-accent: ${settings.accentColor || '#eab308'};
          --font-primary: ${settings.fontFamily || 'Inter, sans-serif'};
          ${settings.headingFontFamily ? `--font-heading: ${settings.headingFontFamily};` : ''}
        }
      `;
      googleAnalyticsId = settings.googleAnalyticsId || '';
    }
  } catch (error) {
    console.error('Error loading branding settings:', error);
  }

  const messages = await getMessages();
  const baseUrl = getBaseUrl();
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Salam Scholarships',
    url: baseUrl,
    sameAs: [
      'https://t.me/ayub_it_tj',
    ],
  };
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Salam Scholarships',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/${locale}/opportunities?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang={locale} suppressHydrationWarning className={inter.className}>
      <head>
        {brandingCSS && <style dangerouslySetInnerHTML={{ __html: brandingCSS }} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* Google Analytics 4 (GA4) */}
        {googleAnalyticsId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${googleAnalyticsId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <SessionProvider>
              <GlobalContentProvider>
                <LiveTracker />
                <ConditionalLayout locale={locale}>{children}</ConditionalLayout>
                <Toaster position="top-right" richColors />
              </GlobalContentProvider>
            </SessionProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
