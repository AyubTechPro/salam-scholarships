'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocale } from 'next-intl';

// Types
type SiteSettings = {
  id: string;
  siteName: string;
  siteNameRu?: string | null;
  siteNameTj?: string | null;
  supportEmail?: string | null;
  supportPhone?: string | null;
  contactEmail?: string | null;
  footerPhone?: string | null;
  footerEmail?: string | null;
  officeAddress?: string | null;
  officeAddressRu?: string | null;
  officeAddressTj?: string | null;
  footerText?: string | null;
  footerTextRu?: string | null;
  footerTextTj?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  telegramChannelUrl?: string | null;
  telegramSupportUsername?: string | null;
  whatsappUrl?: string | null;
  logoUrl?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  fontFamily?: string | null;
  headingFontFamily?: string | null;
  maintenanceMode?: boolean;
  maintenanceMessage?: string | null;
  maintenanceMessageRu?: string | null;
  maintenanceMessageTj?: string | null;
  heroTickerMode?: string | null;
  heroTickerText?: string | null;
  heroTickerTextRu?: string | null;
  heroTickerTextTj?: string | null;
  heroTickerLink?: string | null;
  heroHeadlineWords?: unknown;
  trustBarItems?: unknown;
};

type NavigationItem = {
  id: string;
  label: string;
  labelRu?: string | null;
  labelTj?: string | null;
  href: string;
  icon?: string | null;
  order: number;
  location: string;
  section?: string | null;
  isExternal: boolean;
  children?: NavigationItem[];
};

type NavigationTree = {
  navbar: NavigationItem[];
  footer: NavigationItem[];
};

type DictionaryEntry = {
  en: string;
  ru?: string | null;
  tj?: string | null;
};

type GlobalContentContextType = {
  siteSettings: SiteSettings | null;
  navigation: NavigationTree;
  dictionary: Record<string, DictionaryEntry>;
  loading: boolean;
  error: string | null;
  // Helper methods
  getDictionaryText: (key: string, fallback?: string) => string;
  getNavigation: (location: 'navbar' | 'footer') => NavigationItem[];
  getSiteSetting: <K extends keyof SiteSettings>(key: K) => SiteSettings[K];
  refresh: () => Promise<void>;
};

const GlobalContentContext = createContext<GlobalContentContextType | undefined>(undefined);

export function GlobalContentProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [navigation, setNavigation] = useState<NavigationTree>({ navbar: [], footer: [] });
  const [dictionary, setDictionary] = useState<Record<string, DictionaryEntry>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGlobalSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/global-settings');
      const result = await response.json();

      if (result.success && result.data) {
        setSiteSettings(result.data.siteSettings);
        setNavigation(result.data.navigation || { navbar: [], footer: [] });
        setDictionary(result.data.dictionary || {});
      } else {
        // Silently handle errors - don't show toast for non-critical failures
        // Site will work with default/empty settings
        setError(null);
      }
    } catch (err) {
      // Silently handle errors - don't show toast for non-critical failures
      // Site will work with default/empty settings
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalSettings();
  }, []);

  // Helper: Get localized dictionary text
  const getDictionaryText = (key: string, fallback?: string): string => {
    const entry = dictionary[key];
    if (!entry) return fallback || key;

    if (locale === 'ru' && entry.ru) return entry.ru;
    if (locale === 'tj' && entry.tj) return entry.tj;
    return entry.en || fallback || key;
  };

  // Helper: Get navigation for specific location
  const getNavigation = (location: 'navbar' | 'footer'): NavigationItem[] => {
    return navigation[location] || [];
  };

  // Helper: Get site setting value
  const getSiteSetting = <K extends keyof SiteSettings>(key: K): SiteSettings[K] => {
    if (!siteSettings) return undefined as SiteSettings[K];
    return siteSettings[key];
  };

  // Refresh global settings
  const refresh = async () => {
    await fetchGlobalSettings();
  };

  const value: GlobalContentContextType = {
    siteSettings,
    navigation,
    dictionary,
    loading,
    error,
    getDictionaryText,
    getNavigation,
    getSiteSetting,
    refresh,
  };

  return (
    <GlobalContentContext.Provider value={value}>
      {children}
    </GlobalContentContext.Provider>
  );
}

// Hook to use global content
export function useGlobalContent() {
  const context = useContext(GlobalContentContext);
  if (context === undefined) {
    throw new Error('useGlobalContent must be used within a GlobalContentProvider');
  }
  return context;
}
