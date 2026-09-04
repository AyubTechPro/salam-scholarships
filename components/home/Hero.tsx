'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Search, Sparkles, Rocket, ArrowRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GlobeWatermark from '@/components/common/GlobeWatermark';
import LiveActivityTicker from './LiveActivityTicker';
import TypewriterHeadline from './TypewriterHeadline';
import GlobeBackground from './GlobeBackground';

export default function Hero({ initialSlide }: { initialSlide?: any }) {
  const t = useTranslations('hero');
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [magicSearching, setMagicSearching] = useState(false);
  // Removed stats fetching - stats are now shown in TrustBar below

  return (
    <section className="relative text-white overflow-hidden bg-[#050B14]">
      {/* Premium Ambient Aurora Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-brand-gold/10 blur-[130px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[40%] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Premium 3D Interactive Globe Background */}
      <GlobeBackground />
      
      {/* Static Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>
      
      {/* Globe Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <GlobeWatermark size={500} opacity={0.02} color="#ffffff" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 pb-32 md:pb-40">
        <div className="text-center">
          {/* Live Activity Ticker - First Element (Subtle) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <LiveActivityTicker />
          </motion.div>

          {/* Animated Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="relative flex items-center justify-center mb-6">
              {/* Premium Glow Shimmer Orb */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] md:w-[60%] h-[150%] bg-brand-gold/20 blur-[100px] rounded-[100%] pointer-events-none animate-pulse-slow" />
              
              <Sparkles className="relative z-10 w-10 h-10 text-brand-gold mr-4 sm:w-12 sm:h-12" />
              <h1 className="relative z-10 text-5xl md:text-7xl font-sans font-black tracking-tight mb-2 drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                {initialSlide ? (
                  locale === 'tj' && initialSlide.titleTj ? initialSlide.titleTj :
                  locale === 'ru' && initialSlide.titleRu ? initialSlide.titleRu :
                  initialSlide.title
                ) : t('title')}
              </h1>
            </div>
          </motion.div>

          {/* Dynamic Typewriter Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-3xl text-white/70 font-medium mb-12 max-w-4xl mx-auto tracking-wide"
          >
            {initialSlide && (initialSlide.subtitle || initialSlide.subtitleRu || initialSlide.subtitleTj) ? (
              <>
                {locale === 'tj' && initialSlide.subtitleTj ? initialSlide.subtitleTj :
                 locale === 'ru' && initialSlide.subtitleRu ? initialSlide.subtitleRu :
                 initialSlide.subtitle}
              </>
            ) : (
              locale === 'tj' ? (
                <>
                  Имкониятҳоро барои <TypewriterHeadline /> ёбед
                </>
              ) : locale === 'ru' ? (
                <>
                  Найдите возможности для <TypewriterHeadline />
                </>
              ) : (
                <>
                  Find opportunities for <TypewriterHeadline />
                </>
              )
            )}
          </motion.p>

          {/* Quick Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-3xl mx-auto mb-8"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-white/50" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    // Check if it's a natural language query (more than 3 words)
                    const words = searchQuery.trim().split(/\s+/);
                    if (words.length >= 2) {
                      // Use Magic Search
                      setMagicSearching(true);
                      try {
                        const response = await fetch('/api/ai/magic-search', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ query: searchQuery, locale }),
                        });
                        const result = await response.json();
                        if (result.success && result.data?.opportunities?.length > 0) {
                          // Navigate to opportunities with AI-extracted filters
                          const params = new URLSearchParams();
                          if (result.data.searchParams.level) params.append('level', result.data.searchParams.level);
                          if (result.data.searchParams.category) params.append('category', result.data.searchParams.category);
                          if (result.data.searchParams.country) params.append('country', result.data.searchParams.country);
                          if (result.data.searchParams.fundingType) params.append('fundingType', result.data.searchParams.fundingType);
                          const searchParts = [
                            ...(result.data.searchParams.keywords || []),
                            result.data.searchParams.fieldOfStudy,
                          ].filter(Boolean);
                          if (searchParts.length > 0) params.append('search', searchParts.join(' '));
                          router.push(`/${locale}/opportunities?${params.toString()}`);
                        } else {
                          // Fallback to regular search
                          router.push(`/${locale}/opportunities?search=${encodeURIComponent(searchQuery)}`);
                        }
                      } catch (error) {
                        // Silently fallback to regular search - no error toast needed
                        router.push(`/${locale}/opportunities?search=${encodeURIComponent(searchQuery)}`);
                      } finally {
                        setMagicSearching(false);
                      }
                    } else {
                      // Regular search for short queries
                      router.push(`/${locale}/opportunities?search=${encodeURIComponent(searchQuery)}`);
                    }
                  }
                }}
                placeholder={
                  locale === 'tj'
                    ? 'Ҷустуҷӯи магии... (масалан: "Стипендияи IT дар Германия")'
                    : locale === 'ru'
                    ? 'Волшебный поиск... (например: "Стипендия IT в Германии")'
                    : 'Magic Search... (e.g., "Find me a scholarship in Germany")'
                }
                className="w-full pl-16 pr-44 py-6 rounded-2xl text-white text-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-white/5 border border-white/10 backdrop-blur-xl placeholder-white/40 transition-all shadow-2xl hover:bg-white/10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-2">
                {magicSearching ? (
                  <div className="px-6 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-gold" />
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      if (searchQuery.trim()) {
                        const words = searchQuery.trim().split(/\s+/);
                        if (words.length >= 2) {
                          setMagicSearching(true);
                          try {
                            const response = await fetch('/api/ai/magic-search', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ query: searchQuery, locale }),
                            });
                            const result = await response.json();
                            if (result.success && result.data?.opportunities?.length > 0) {
                              const params = new URLSearchParams();
                              if (result.data.searchParams.level) params.append('level', result.data.searchParams.level);
                              if (result.data.searchParams.category) params.append('category', result.data.searchParams.category);
                              if (result.data.searchParams.country) params.append('country', result.data.searchParams.country);
                              if (result.data.searchParams.fundingType) params.append('fundingType', result.data.searchParams.fundingType);
                              const searchParts = [
                                ...(result.data.searchParams.keywords || []),
                                result.data.searchParams.fieldOfStudy,
                              ].filter(Boolean);
                              if (searchParts.length > 0) params.append('search', searchParts.join(' '));
                              router.push(`/${locale}/opportunities?${params.toString()}`);
                            } else {
                              router.push(`/${locale}/opportunities?search=${encodeURIComponent(searchQuery)}`);
                            }
                          } catch (error) {
                            // Silently fallback to regular search - no error toast needed
                            router.push(`/${locale}/opportunities?search=${encodeURIComponent(searchQuery)}`);
                          } finally {
                            setMagicSearching(false);
                          }
                        } else {
                          router.push(`/${locale}/opportunities?search=${encodeURIComponent(searchQuery)}`);
                        }
                      }
                    }}
                    className="absolute right-2 top-2 bottom-2 bg-brand-gold hover:bg-brand-gold/90 text-brand-navy shadow-[0_0_20px_rgba(255,215,0,0.4)] px-8 py-0 rounded-xl font-bold flex items-center gap-2 transform transition-all hover:scale-[1.02]"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="hidden sm:inline">
                      {locale === 'tj' ? 'Ҷустуҷӯ' : locale === 'ru' ? 'Поиск' : 'Search'}
                    </span>
                 </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Search / Trending Chips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-6 mb-16 max-w-3xl mx-auto"
          >
            <span className="text-white/50 text-sm font-medium mr-2">
              {locale === 'tj' ? 'Маъмултарин:' : locale === 'ru' ? 'Популярно:' : 'Trending:'}
            </span>
            {[
              { id: 'it-germany', icon: '💻', textEn: 'IT in Germany', textRu: 'IT в Германии', textTj: 'IT дар Олмон' },
              { id: 'medicine', icon: '🩺', textEn: 'Medical', textRu: 'Медицина', textTj: 'Тиббӣ' },
              { id: 'fully-funded', icon: '🎓', textEn: 'Fully Funded', textRu: 'Полное финансирование', textTj: 'Пурра маблағгузорӣ мешавад' },
              { id: 'turkey', icon: '🇹🇷', textEn: 'Turkey', textRu: 'Турция', textTj: 'Туркия' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => {
                  const query = locale === 'ru' ? chip.textRu : locale === 'tj' ? chip.textTj : chip.textEn;
                  setSearchQuery(query);
                  // Optional: trigger search immediately
                  // router.push(`/${locale}/opportunities?search=${encodeURIComponent(query)}`);
                }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:border-brand-gold/50 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-brand-gold/20 hover:shadow-lg flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>{chip.icon}</span>
                <span>{locale === 'ru' ? chip.textRu : locale === 'tj' ? chip.textTj : chip.textEn}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-16 md:h-24"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>

    </section>
  );
}
