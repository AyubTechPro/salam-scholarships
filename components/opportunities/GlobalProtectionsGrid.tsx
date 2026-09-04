'use client';

import { ShieldCheck, Banknote, Map, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';

export default function GlobalProtectionsGrid() {
  const locale = useLocale();

  const protections = [
    {
      id: 'housing',
      icon: ShieldCheck,
      color: 'from-green-500 to-emerald-700',
      title: {
        en: 'Verified Housing',
        ru: 'Проверенное жилье',
        tj: 'Хобгоҳи кафолатшуда',
      },
      desc: {
        en: 'Safe dorms guaranteed upon arrival',
        ru: 'Безопасное общежитие по прибытии',
        tj: 'Манзили бехатар ҳангоми расидан',
      }
    },
    {
      id: 'finance',
      icon: Banknote,
      color: 'from-yellow-400 to-amber-600',
      title: {
        en: 'Salam Scholarships Finance',
        ru: 'Финансы Salam Scholarships',
        tj: 'Дастгирии молиявӣ',
      },
      desc: {
        en: 'Blocked account & education loans',
        ru: 'Блокированный счет и кредиты на обучение',
        tj: 'Blocked Account ва қарзҳои таълимӣ',
      }
    },
    {
      id: 'visa',
      icon: Map,
      color: 'from-blue-500 to-indigo-600',
      title: {
        en: 'Visa Assurance',
        ru: 'Визовая поддержка',
        tj: 'Омодагӣ ба раводид',
      },
      desc: {
        en: 'Mock interviews & document prep',
        ru: 'Пробные собеседования и подготовка',
        tj: 'Мусоҳибаҳои озмоишӣ ва тайёрӣ',
      }
    },
    {
      id: 'language',
      icon: FileCheck,
      color: 'from-purple-500 to-pink-600',
      title: {
        en: 'Zero-IELTS Entry',
        ru: 'Поступление без IELTS',
        tj: 'Бе IELTS (Санҷиши алтернативӣ)',
      },
      desc: {
        en: 'Internal DET & Language assessments',
        ru: 'Внутренние тесты и оценка языка',
        tj: 'Санҷишҳои дохилӣ аз тарафи Salam Scholarships',
      }
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-navy flex items-center">
            <ShieldCheck className="w-6 h-6 mr-3 text-gold" />
            {locale === 'tj' ? 'Кафолатҳои Salam Scholarships' : locale === 'ru' ? 'Гарантии Salam Scholarships' : 'Salam Scholarships Global Protections'}
          </h2>
          <p className="text-gray-500 mt-2 max-w-2xl text-sm leading-relaxed">
            {locale === 'tj' 
              ? 'Тавассути системаи ягонаи мо ариза супоред ва аз ин 4 қабати муҳофизатии байналмилалӣ бархурдор шавед.' 
              : locale === 'ru' 
              ? 'Подайте заявку через нашу единую систему и получите 4 уровня международной защиты.' 
              : 'Apply through our unified vault methodology and unlock 4 layers of international applicant protection.'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {protections.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative p-5 rounded-xl overflow-hidden group border border-gray-200 bg-gray-50 hover:bg-white hover:border-gold/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-5 rounded-bl-[100px] group-hover:scale-125 group-hover:opacity-10 transition-all duration-500`} />
              
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} text-white justify-center items-center flex mb-4 shadow-sm group-hover:shadow-md transition-all`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <h3 className="font-bold text-navy mb-1.5 text-sm">{(item.title as any)[locale] || item.title.en}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{(item.desc as any)[locale] || item.desc.en}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
