import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: locales,
  defaultLocale: 'en',
  localePrefix: 'always',
});

// Known app routes - no redirect check needed (major perf win)
const KNOWN_ROUTES = new Set([
  '', '/', '/opportunities', '/about', '/contact', '/dashboard', '/events',
  '/seminars', '/login', '/signup', '/partners', '/consulting', '/maintenance',
  '/faq', '/privacy', '/terms', '/achievements', '/recognition', '/ai-assistant',
]);

function getPathWithoutLocale(pathname: string): string {
  const without = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
  return without === '/' ? '/' : (without.replace(/\/$/, '') || '/');
}

function getFirstSegment(path: string): string {
  const seg = path.replace(/^\//, '').split('/')[0] || '';
  return seg ? `/${seg}` : '/';
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return intlMiddleware(request);
  }

  const baseUrl = request.nextUrl.origin;
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  const firstSegment = getFirstSegment(pathWithoutLocale);
  const isKnownRoute = KNOWN_ROUTES.has(pathWithoutLocale) || KNOWN_ROUTES.has(firstSegment);

  // Run redirect (only for unknown paths) and maintenance in parallel
  const [redirectResult, maintenanceResult] = await Promise.all([
    isKnownRoute ? Promise.resolve(null) : fetch(
      `${baseUrl}/api/redirects/check?path=${encodeURIComponent(pathWithoutLocale)}`,
      { cache: 'no-store' }
    ).then((r) => r.ok ? r.json() : null).catch(() => null),
    pathname.includes('/maintenance') ? Promise.resolve(null) : fetch(
      `${baseUrl}/api/maintenance-check`,
      { next: { revalidate: 30 } }
    ).then((r) => r.ok ? r.json() : null).catch(() => null),
  ]);

  if (redirectResult?.success && redirectResult.data) {
    const redirect = redirectResult.data;
    const locale = pathname.split('/')[1] || 'en';
    if (redirect.isExternal) {
      return NextResponse.redirect(new URL(redirect.toPath), redirect.statusCode as 301 | 302);
    }
    const redirectPath = redirect.toPath.startsWith('/')
      ? `/${locale}${redirect.toPath}`
      : `/${locale}/${redirect.toPath}`;
    return NextResponse.redirect(new URL(redirectPath, request.url), redirect.statusCode as 301 | 302);
  }

  if (maintenanceResult?.maintenanceMode && !pathname.includes('/admin')) {
    const locale = pathname.split('/')[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}/maintenance`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
