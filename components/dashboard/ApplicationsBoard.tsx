'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { FileText, Clock, CheckCircle, XCircle, ChevronRight, MapPin, Calendar, Loader2, CreditCard, Sparkles, Send } from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  motivationScore?: number;
  program: {
    id: string;
    title: string;
    titleRu?: string;
    titleTj?: string;
    country: string;
    deadline?: string;
  };
}

const COLUMNS = [
  { id: 'DRAFT', title: 'Drafts', titleRu: 'Черновики', titleTj: 'Лоиҳаҳо', icon: FileText, color: 'text-gray-500', bg: 'bg-gray-100/50' },
  { id: 'SUBMITTED', title: 'Submitted', titleRu: 'Отправленные', titleTj: 'Фиристода шуд', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100/50' },
  { id: 'UNDER_REVIEW', title: 'Under Review', titleRu: 'На рассмотрении', titleTj: 'Дар баррасӣ', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100/50' },
  { id: 'DECISION', title: 'Decision', titleRu: 'Решение', titleTj: 'Қарор', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100/50' }
];

export default function ApplicationsBoard() {
  const locale = useLocale();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      const result = await response.json();
      if (result.success && result.data) {
        setApplications(result.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgramTitle = (item: Application) => {
    if (locale === 'ru' && item.program.titleRu) return item.program.titleRu;
    if (locale === 'tj' && item.program.titleTj) return item.program.titleTj;
    return item.program.title;
  };

  const grouped = {
    DRAFT: applications.filter(a => a.status === 'DRAFT'),
    SUBMITTED: applications.filter(a => a.status === 'SUBMITTED'),
    UNDER_REVIEW: applications.filter(a => a.status === 'UNDER_REVIEW'),
    DECISION: applications.filter(a => a.status === 'ACCEPTED' || a.status === 'REJECTED')
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold text-brand-navy">
            {locale === 'tj' ? 'Назорати Аризаҳо' : locale === 'ru' ? 'Отслеживание заявок' : 'Application Tracking'}
          </h2>
          <p className="text-gray-500 mt-2">
            {locale === 'tj' ? 'Ҳолати аризаҳои худро ба таври визуалӣ назорат кунед.' : locale === 'ru' ? 'Визуально отслеживайте статус ваших заявок.' : 'Visually track the status of your applications.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 overflow-x-auto pb-8 md:grid-cols-2 xl:grid-cols-4 gap-6 min-h-[600px] items-start">
        {COLUMNS.map((column, colIdx) => {
          const columnApps = grouped[column.id as keyof typeof grouped] || [];
          const Icon = column.icon;

          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: colIdx * 0.1 }}
              className={`rounded-2xl p-4 flex flex-col max-h-[800px] border border-gray-100 shadow-sm ${column.bg}`}
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center space-x-2">
                  <Icon className={`w-5 h-5 ${column.color}`} />
                  <h3 className="font-bold text-gray-800">
                    {locale === 'tj' ? column.titleTj : locale === 'ru' ? column.titleRu : column.title}
                  </h3>
                </div>
                <span className="bg-white/60 text-gray-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  {columnApps.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 snap-y custom-scrollbar">
                <AnimatePresence>
                  {columnApps.map((app, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      key={app.id}
                      className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-xl transition-all group snap-center"
                    >
                      <Link href={`/${locale}/opportunities/${app.program.id}`}>
                        <div className="flex items-start justify-between mb-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                            app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                            app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {app.status}
                          </span>
                          {app.motivationScore && (
                            <span className="text-[10px] font-bold text-brand-gold bg-brand-gold/10 px-2 py-1 rounded-md">
                              {Math.round(app.motivationScore)}% AI Score
                            </span>
                          )}
                        </div>
                        
                        <h4 className="font-bold text-brand-navy leading-snug mb-3 line-clamp-2 min-h-[2.5rem] group-hover:text-brand-gold transition-colors">
                          {getProgramTitle(app)}
                        </h4>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{app.program.country}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                            <span>{new Date(app.updatedAt).toLocaleDateString(locale)}</span>
                          </div>
                        </div>

                        {app.status === 'ACCEPTED' ? (
                          <div className="pt-3 mt-1 border-t border-gray-100 flex flex-col gap-2">
                            <h5 className="text-xs font-bold text-green-700 flex items-center mb-1">
                              <Sparkles className="w-3 h-3 mr-1" /> Next Steps Required
                            </h5>
                            <button className="w-full text-left flex items-center text-xs p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors font-semibold">
                              <FileText className="w-4 h-4 mr-2" /> Download Offer Letter
                            </button>
                            <button className="w-full text-left flex items-center text-xs p-2 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 rounded-lg transition-colors font-semibold">
                              <CreditCard className="w-4 h-4 mr-2" /> Pay Placement Fee
                            </button>
                          </div>
                        ) : (
                          <div className="pt-3 border-t border-gray-100 flex items-center text-brand-gold font-semibold text-xs group-hover:underline">
                            <span>{locale === 'tj' ? 'Тафсилот' : locale === 'ru' ? 'Подробнее' : 'View Program'}</span>
                            <ChevronRight className="w-4 h-4 ml-auto transition-transform group-hover:translate-x-1" />
                          </div>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                  
                  {columnApps.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm font-semibold">
                      {locale === 'tj' ? 'Холӣ' : locale === 'ru' ? 'Пусто' : 'Empty'}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
