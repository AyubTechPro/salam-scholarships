'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useGlobalContent } from '@/components/providers/GlobalContentProvider';

type FooterLinksProps = {
  locale: string;
};

// Default footer links if DB is empty
const defaultLinks: Record<string, Array<{ id: string; label: string; labelRu?: string; labelTj?: string; href: string; section: string; isExternal: boolean }>> = {
  quickLinks: [
    { id: '1', label: 'Opportunities', labelRu: 'Возможности', labelTj: 'Имкониятҳо', href: '/opportunities', section: 'quickLinks', isExternal: false },
    { id: '2', label: 'Top Talents', labelRu: 'Таланты', labelTj: 'Истеъдодҳо', href: '/talents', section: 'quickLinks', isExternal: false },
    { id: '3', label: 'For Partners', labelRu: 'Партнерам', labelTj: 'Барои шарикон', href: '/partners', section: 'quickLinks', isExternal: false },
  ],
  support: [
    { id: '4', label: 'About Us', labelRu: 'О нас', labelTj: 'Дар бораи мо', href: '/about', section: 'support', isExternal: false },
    { id: '6', label: 'FAQ', labelRu: 'Вопросы и ответы', labelTj: 'Саволҳои зуд-зуд', href: '/#faq', section: 'support', isExternal: false },
  ],
  legal: [
    { id: '7', label: 'Privacy Policy', labelRu: 'Политика конфиденциальности', labelTj: 'Сиёсати махфият', href: '/privacy', section: 'legal', isExternal: false },
    { id: '8', label: 'Terms of Service', labelRu: 'Условия использования', labelTj: 'Шартҳои истифода', href: '/terms', section: 'legal', isExternal: false },
  ],
};

export default function FooterLinks({ locale }: FooterLinksProps) {
  const t = useTranslations('common');
  const { getNavigation, loading: globalContentLoading } = useGlobalContent();
  
  // Get footer navigation from GlobalContentProvider
  const footerNavigation = getNavigation('footer') || [];
  
  // Transform navigation items to FooterLink format
  const links = footerNavigation.map((item) => ({
    id: item.id,
    label: item.label,
    labelRu: item.labelRu || null,
    labelTj: item.labelTj || null,
    href: item.href === '/faq' ? '/#faq' : item.href === '/consultation' ? '/consulting' : item.href,
    section: item.section || 'quickLinks',
    isExternal: item.isExternal,
  }));

  const getLocalizedLabel = (link: { label: string; labelRu?: string | null; labelTj?: string | null }) => {
    if (locale === 'ru' && link.labelRu) return link.labelRu;
    if (locale === 'tj' && link.labelTj) return link.labelTj;
    return link.label;
  };

  const getSectionTitle = (section: string) => {
    const titles: Record<string, Record<string, string>> = {
      quickLinks: { en: 'Platform', ru: 'Платформа', tj: 'Платформа' },
      support: { en: 'Company', ru: 'О Компании', tj: 'Ширкат' },
      legal: { en: 'Legal', ru: 'Правовая информация', tj: 'Қонунӣ' },
    };
    return titles[section]?.[locale] || titles[section]?.en || section;
  };

  const sections = ['quickLinks', 'support'];
  const linksBySection = sections.map(section => ({
    section,
    links: links.filter(link => link.section === section),
  }));

  if (globalContentLoading) {
    return (
      <>
        <div><h3 className="font-semibold text-white mb-6 uppercase tracking-wider text-sm">{getSectionTitle('quickLinks')}</h3><ul className="space-y-4"><li className="text-white/50">Loading...</li></ul></div>
        <div><h3 className="font-semibold text-white mb-6 uppercase tracking-wider text-sm">{getSectionTitle('support')}</h3><ul className="space-y-4"><li className="text-white/50">Loading...</li></ul></div>
      </>
    );
  }

  return (
    <>
      {linksBySection.map(({ section, links: sectionLinks }) => {
        // If no links in section, use defaults
        const displayLinks = sectionLinks.length > 0 
          ? sectionLinks 
          : defaultLinks[section] || [];

        return (
          <div key={section} className="col-span-1">
            <h3 className="font-semibold text-white mb-6 uppercase tracking-wider text-sm">{getSectionTitle(section)}</h3>
            <ul className="space-y-4">
              {displayLinks.length > 0 ? (
                displayLinks.map((link) => (
                  <li key={link.id}>
                    {link.isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/60 hover:text-white transition-colors duration-200"
                      >
                        {getLocalizedLabel(link)}
                      </a>
                    ) : (
                      <Link
                        href={link.href.startsWith('http') ? link.href : `/${locale}${link.href.startsWith('/') ? link.href : '/' + link.href}`}
                        className="text-white/60 hover:text-white transition-colors duration-200"
                      >
                        {getLocalizedLabel(link)}
                      </Link>
                    )}
                  </li>
                ))
              ) : (
                <li className="text-white/30 text-sm">{t('noLinksConfigured') || 'No links configured'}</li>
              )}
            </ul>
          </div>
        );
      })}
    </>
  );
}

export function FooterLegalLinks({ locale }: FooterLinksProps) {
  const { getNavigation, loading: globalContentLoading } = useGlobalContent();
  
  if (globalContentLoading) {
    return <div className="flex gap-4 text-white/50 text-sm"><span>Loading...</span></div>;
  }

  const footerNavigation = getNavigation('footer') || [];
  const legalLinks = footerNavigation.filter(item => item.section === 'legal');

  const linksToRender = legalLinks.length > 0 ? legalLinks : defaultLinks['legal'];

  const getLocalizedLabel = (link: { label: string; labelRu?: string | null; labelTj?: string | null }) => {
    if (locale === 'ru' && link.labelRu) return link.labelRu;
    if (locale === 'tj' && link.labelTj) return link.labelTj;
    return link.label;
  };

  return (
    <div className="flex flex-wrap gap-4 md:gap-8 items-center justify-center md:justify-end text-sm mt-4 md:mt-0">
      {linksToRender.map((link) => (
        <React.Fragment key={link.id}>
          {link.isExternal ? (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors duration-200"
            >
              {getLocalizedLabel(link)}
            </a>
          ) : (
            <Link
              href={link.href.startsWith('http') ? link.href : `/${locale}${link.href.startsWith('/') ? link.href : '/' + link.href}`}
              className="text-white/50 hover:text-white transition-colors duration-200"
            >
              {getLocalizedLabel(link)}
            </Link>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

