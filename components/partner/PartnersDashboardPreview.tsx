'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Search, Bell, LayoutDashboard, Users, FileCheck, CheckCircle2, XCircle, ChevronRight, BarChart } from 'lucide-react';

const MOCK_CANDIDATES = [
  { name: 'Amir K.', countryTJ: 'Тоҷикистон', countryRU: 'Таджикистан', countryEN: 'Tajikistan', gpa: '3.9', ielts: '7.5' },
  { name: 'Sabina M.', countryTJ: 'Ӯзбекистон', countryRU: 'Узбекистан', countryEN: 'Uzbekistan', gpa: '4.0', ielts: '8.0' },
  { name: 'Rustam A.', countryTJ: 'Қазоқистон', countryRU: 'Казахстан', countryEN: 'Kazakhstan', gpa: '3.8', ielts: '7.0' },
];

export default function PartnersDashboardPreview() {
  const locale = useLocale() as 'tj' | 'ru' | 'en';

  const text = {
    tj: {
      tag: 'Платформаи Salam Scholarships OS',
      title: 'Интихоби Донишҷӯён бо Як Тугма',
      subtitle: 'Системаи ягонаи мо ба донишгоҳи шумо имкон медиҳад, ки профилҳои тафтишшудаи донишҷӯёнро онлайн бинед ва қарор қабул кунед.',
      uiId: 'Портали Шарикон',
      uiDept: 'Шӯъбаи Қабул',
      uiMenu1: 'Номзадҳо',
      uiMenu2: 'Ҳуҷҷатҳо',
      uiMenu3: 'Таҳлилот',
      uiHeader: 'Баррасии Номзадҳо',
      uiSubheader: '3 донишҷӯи тафтишшуда мувофиқи меъёрҳои шумо.',
      uiVerified: 'Тафтишшуда',
      uiLang: 'Забон',
      uiAiMatch: 'ТАВСИЯИ ЗЕҲНИ СУНЪӢ',
      uiAiText: 'Amir K. 98% мувофиқ аст',
    },
    ru: {
      tag: 'Платформа Salam Scholarships OS',
      title: 'Отбор студентов в один клик',
      subtitle: 'Наша единая облачная система позволяет вашему университету напрямую просматривать проверенные профили и принимать решения.',
      uiId: 'Портал Партнера',
      uiDept: 'Приемная Комиссия',
      uiMenu1: 'Кандидаты',
      uiMenu2: 'Документы',
      uiMenu3: 'Аналитика',
      uiHeader: 'Просмотр Кандидатов',
      uiSubheader: '3 проверенных студента, соответствующих вашим критериям.',
      uiVerified: 'Проверен',
      uiLang: 'Язык',
      uiAiMatch: 'СОВПАДЕНИЕ ИИ',
      uiAiText: 'Amir K. подходит на 98%',
    },
    en: {
      tag: 'Salam Scholarships OS Platform',
      title: 'One-Click Candidate Selection',
      subtitle: 'Our unified cloud system allows your admissions team to instantly review pre-vetted student portfolios and make rapid decisions.',
      uiId: 'Partner Portal',
      uiDept: 'Admissions Dept',
      uiMenu1: 'Candidates',
      uiMenu2: 'Documents',
      uiMenu3: 'Analytics',
      uiHeader: 'Review Candidates',
      uiSubheader: '3 pre-vetted students matching your criteria.',
      uiVerified: 'Verified',
      uiLang: 'Language',
      uiAiMatch: 'AI MATCH',
      uiAiText: 'Amir K. is a 98% fit',
    }
  }[locale];

  return (
    <section className="py-24 bg-gray-50 dark:bg-navy relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
             initial={{ opacity: 0, y: -10 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mb-6"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm font-bold tracking-widest uppercase">{text.tag}</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-heading font-extrabold text-brand-navy dark:text-white mb-6 leading-tight"
          >
            {text.title}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-400 font-sans leading-relaxed"
          >
            {text.subtitle}
          </motion.p>
        </div>

        {/* 3D Glassmorphism Dashboard Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 50, rotateX: 10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, type: "spring" }}
          style={{ perspective: "1000px" }}
        >
          <div className="relative mx-auto max-w-5xl rounded-[2rem] border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0a1120]/80 backdrop-blur-2xl shadow-2xl overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent before:dark:from-white/5 before:pointer-events-none">
            
            {/* Window Header */}
            <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="mx-auto bg-white/50 dark:bg-white/5 px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Search className="w-3 h-3" />
                university.salam.com
              </div>
            </div>

            {/* Application Layout */}
            <div className="flex h-[400px] md:h-[500px]">
              
              {/* Sidebar */}
              <div className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 p-6 space-y-4 bg-gray-50/30 dark:bg-black/10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-brand-navy flex items-center justify-center">
                    <span className="text-brand-gold font-bold text-xs">UN</span>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-brand-navy dark:text-white">{text.uiId}</div>
                    <div className="text-xs text-gray-500">{text.uiDept}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-brand-gold bg-brand-gold/10 px-4 py-2.5 rounded-xl text-sm font-semibold">
                    <Users className="w-4 h-4" /> {text.uiMenu1}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer">
                    <FileCheck className="w-4 h-4" /> {text.uiMenu2}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer">
                    <BarChart className="w-4 h-4" /> {text.uiMenu3}
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-6 md:p-10 relative overflow-hidden">
                <div className="flex justify-between items-end mb-8 relative z-10">
                  <div>
                    <h3 className="text-2xl font-bold font-heading text-brand-navy dark:text-white mb-2">{text.uiHeader}</h3>
                    <p className="text-sm text-gray-500">{text.uiSubheader}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Candidates List */}
                <div className="space-y-4 relative z-10">
                  {MOCK_CANDIDATES.map((cand, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      className="flex items-center justify-between p-4 bg-white dark:bg-[#111c30] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 border border-blue-200 dark:border-blue-700/50 flex items-center justify-center font-bold text-blue-700 dark:text-blue-400">
                          {cand.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-brand-navy dark:text-white text-sm">{cand.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            {locale === 'tj' ? cand.countryTJ : locale === 'ru' ? cand.countryRU : cand.countryEN} <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" /> {text.uiVerified}
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-6 text-sm">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400">GPA</span>
                          <span className="font-semibold text-brand-navy dark:text-white">{cand.gpa}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400">{text.uiLang}</span>
                          <span className="font-semibold text-brand-navy dark:text-white">{cand.ielts}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 md:opacity-100 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-100 transition-colors" title="Accept">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors ml-2">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Floating "AI Recommendation" Element */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 1, type: "spring" }}
                  className="absolute bottom-10 right-10 bg-brand-navy dark:bg-brand-gold text-white dark:text-brand-navy px-6 py-4 rounded-2xl shadow-2xl border border-white/10 dark:border-brand-gold/50 flex items-center gap-3 z-20"
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-brand-gold dark:bg-white rounded-full opacity-50 blur animate-pulse" />
                    <SparklesIcon className="w-5 h-5 relative z-10" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold opacity-80 uppercase tracking-wide">{text.uiAiMatch}</div>
                    <div className="text-sm font-bold">{text.uiAiText}</div>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}
