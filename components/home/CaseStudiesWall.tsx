'use client';

import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Award, Quote, X, GraduationCap } from 'lucide-react';

const SUCCESS_STORIES = [
  {
    id: 'aisha',
    image: '/images/about/IMG_20260405_133802_183.png',
    name: {
      tj: 'Оиша Садриддиновна',
      ru: 'Оиша Садриддиновна',
      en: 'Aisha Sadriddinovna'
    },
    status: {
      tj: 'Донишҷӯи курси 2, ДДТТ',
      ru: 'Студентка 2 курса, ТГМУ',
      en: '2nd Year Student, TSMU'
    },
    location: { tj: 'Истанбул, Туркия', ru: 'Стамбул, Турция', en: 'Istanbul, Turkey' },
    achievement: {
      tj: 'Youth Leadership & Business Forum Turkiye',
      ru: 'Youth Leadership & Business Forum Turkiye',
      en: 'Youth Leadership & Business Forum Turkiye'
    },
    quote: {
      tj: 'Шиносоӣ ва шабакасозӣ бо иштирокчиён... Маҳз ба шарофати чунин платформаҳо... дастрасӣ пайдо кунанд.',
      ru: 'Знакомство и нетворкинг с участниками... Именно благодаря таким платформам мы получаем доступ.',
      en: 'Meeting and networking with participants... Thanks to such platforms, we gain access.'
    },
    fullStory: {
      tj: 'Ман Оиша Садриддиновна ҳастам, донишҷӯи курси 2-юми резидентураи ДДТТ ба номи Абӯалӣ ибни Сино. Наздикан имконияти олӣ пайдо кардам, ки дар форуми 4-рӯзаи The Youth Leadership and Business Forum Turkiye дар шаҳри Истанбул иштирок намоям. Ман дар бораи ин имконият тавассути Salam Scholarships фаҳмидам ва барои роҳнамоӣ бениҳоят миннатдорам.',
      ru: 'Я Оиша Садриддиновна, студентка 2-го курса ординатуры ТГМУ им. Абуали ибни Сино. Недавно у меня появилась отличная возможность принять участие в 4-дневном форуме The Youth Leadership and Business Forum Turkiye в Стамбуле. Я узнала об этой возможности через Salam Scholarships и очень благодарна за руководство.',
      en: 'I am Aisha Sadriddinovna, a 2nd-year residency student at TSMU. Recently, I had the great opportunity to participate in the 4-day Youth Leadership and Business Forum Turkiye in Istanbul. I learned about this opportunity through Salam Scholarships and am incredibly grateful for their guidance.'
    }
  },
  {
    id: 'emomali',
    image: '/images/about/IMG_6050.JPG',
    name: {
      tj: 'Хоҷазода Эмомалӣ',
      ru: 'Ходжазода Эмомали',
      en: 'Khozazada Emomali'
    },
    status: {
      tj: 'Turkiye Burslari 2024',
      ru: 'Turkiye Burslari 2024',
      en: 'Turkiye Burslari 2024'
    },
    location: { tj: 'Невшехир, Туркия', ru: 'Невшехир, Турция', en: 'Nevsehir, Turkey' },
    achievement: {
      tj: 'Haci Bektas Veli (Стипендияи Пурра)',
      ru: 'Haci Bektas Veli (Полная стипендия)',
      en: 'Haci Bektas Veli (Full Scholarship)'
    },
    quote: {
      tj: 'Аз машварат сар карда то ҳуҷҷат супоридан, дар тамоми даврҳо кӯмак карданд. Хеле миннатдорам!',
      ru: 'Помогли во всем, от консультаций до подачи документов. Очень благодарен!',
      en: 'They helped in everything, from consulting to submitting documents. Very grateful!'
    },
    fullStory: {
      tj: 'Ман Хоҷазода Эмомалӣ, хатмкардаи гимназияи №1-и н. Балҷувон. Соли 2024 тавассути барномаи Turkiye Burslari ба донишгоҳи Haci Bektas Veli дар ихтисоси Идораи Давлатӣ дохил шудам. Аз машварат сар карда то интервю ва ба Туркия омаданам кӯмак карданд.',
      ru: 'Я Ходжазода Эмомали, выпускник гимназии №1 Балджуана. В 2024 году, благодаря программе Turkiye Burslari, я поступил в университет Haci Bektas Veli University на специальность "Государственное управление". От консультации до интервью и переезда в Турцию — они мне очень помогли.',
      en: 'I am Khozazada Emomali, a graduate of Gymnasium No. 1 in Baljuvon. In 2024, through the Turkiye Burslari program, I was admitted to Haci Bektas Veli University majoring in Public Administration. From consulting to interviews and my arrival in Turkey, they helped tremendously.'
    }
  },
  {
    id: 'guliston',
    image: '/images/about/IMG_20260405_133801_846.png',
    name: {
      tj: 'Гулистон Файзова',
      ru: 'Гулистон Файзова',
      en: 'Guliston Fayzova'
    },
    status: {
      tj: 'Зани Соҳибкор',
      ru: 'Женщина-предприниматель',
      en: 'Female Entrepreneur'
    },
    location: { tj: 'Истанбул, Туркия', ru: 'Стамбул, Турция', en: 'Istanbul, Turkey' },
    achievement: {
      tj: 'Global Business Symposium',
      ru: 'Global Business Symposium',
      en: 'Global Business Symposium'
    },
    quote: {
      tj: 'Шиносоӣ бо мутахассисон ва ҷавонони фаъол барои ман як таҷрибаи аҷиб буд. Сипосгузорам.',
      ru: 'Знакомство со специалистами стало для меня потрясающим опытом. Спасибо.',
      en: 'Meeting professionals was an amazing experience for me. Thank you.'
    },
    fullStory: {
      tj: 'Номи ман Гулистон Файзова аст ва ман як зани соҳибкор дар шаҳри Душанбе ҳастам. Ман хеле шодам, ки дар форуми 4-рӯзаи The Youth Leadership and Business Forum Turkiye иштирок намудам. Ман бисёр чизҳоро омӯхтам ва ба туфайли Salam Scholarships ин имкониятро пайдо кардам.',
      ru: 'Меня зовут Гулистон Файзова, я предприниматель из Душанбе. Рада, что смогла принять участие в 4-дневном форуме The Youth Leadership and Business Forum Turkiye. Огромное спасибо Salam Scholarships за помощь!',
      en: 'My name is Guliston Fayzova, and I am a female entrepreneur in Dushanbe. I am very glad I participated in the 4-day Youth Leadership and Business Forum Turkiye. I learned about this opportunity through Salam Scholarships and am very grateful.'
    }
  }
];

export default function CaseStudiesWall({ initialStories = [] }: { initialStories?: any[] }) {
  const locale = useLocale() as 'tj' | 'ru' | 'en';
  const [selectedCase, setSelectedCase] = useState<typeof SUCCESS_STORIES[0] | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const title = locale === 'tj' ? 'Дастовардҳои Донишҷӯён' : locale === 'ru' ? 'Достижения студентов' : 'Student Achievements';
  const subtitle = locale === 'tj' 
    ? 'Донишҷӯён бомуваффақият дар донишгоҳҳои байналмилалӣ стипендия ба даст оварда, дар форумҳои ҷаҳонӣ ва конфронсҳо иштирок мекунанд.'
    : locale === 'ru'
    ? 'Студенты успешно получают стипендии в международных университетах и участвуют в глобальных форумах и конференциях.'
    : 'Students successfully receive scholarships in international universities and participate in global forums and conferences.';

  const dbStories = initialStories.length > 0 ? initialStories.map(story => ({
    id: story.id,
    image: story.photoUrl || '/images/placeholder-user.jpg',
    name: {
      tj: story.nameTj || story.name,
      ru: story.nameRu || story.name,
      en: story.name
    },
    status: {
      tj: story.programTj || story.program,
      ru: story.programRu || story.program,
      en: story.program
    },
    location: { 
      tj: story.country, 
      ru: story.country, 
      en: story.country 
    },
    achievement: {
      tj: story.achievementTj || story.achievement,
      ru: story.achievementRu || story.achievement,
      en: story.achievement
    },
    quote: {
      tj: story.quoteTj || story.quote,
      ru: story.quoteRu || story.quote,
      en: story.quote
    },
    fullStory: {
      tj: story.fullStoryTj || story.fullStory,
      ru: story.fullStoryRu || story.fullStory,
      en: story.fullStory
    }
  })) : [];

  // Mix with fallback stories to ensure we have enough unique cards for a good marquee
  const mixedStories = [...dbStories];
  if (mixedStories.length < 3) {
    for (const fallback of SUCCESS_STORIES) {
      if (mixedStories.length >= 3) break;
      if (!mixedStories.some(s => s.name.en === fallback.name.en)) {
        mixedStories.push(fallback);
      }
    }
  }
  const mappedStories = mixedStories.length > 0 ? mixedStories : SUCCESS_STORIES;

  // Create an array with duplicated items for seamless infinite scroll
  const marqueeItems = [...mappedStories, ...mappedStories, ...mappedStories, ...mappedStories];

  // The actual modal UI extracted as a variable
  const modalContent = (
    <AnimatePresence>
      {selectedCase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedCase(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto lg:overflow-hidden bg-navy dark:bg-[#0a1120] rounded-[2rem] border border-white/10 shadow-2xl scrollbar-hide flex flex-col lg:flex-row"
          >
            <button 
              onClick={() => setSelectedCase(null)}
              className="absolute top-4 right-4 lg:top-6 lg:right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-brand-gold hover:text-navy transition-colors backdrop-blur-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Image Area */}
            <div className="relative w-full lg:w-2/5 h-[350px] lg:h-auto min-h-[400px] shrink-0 bg-[#0a1120]">
              <Image
                src={selectedCase.image}
                alt={selectedCase.name[locale]}
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              {/* Mobile bottom fade / Desktop right fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy dark:from-[#0a1120] to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-navy lg:dark:to-[#0a1120]" />
            </div>

            {/* Right Column: Text Information */}
            <div className="w-full lg:w-3/5 p-6 md:p-8 lg:p-12 -mt-16 lg:mt-0 relative z-10 flex flex-col justify-center bg-transparent">
              <div className="bg-[#121c2e] lg:bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 lg:mb-8 shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-brand-gold/20 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6 lg:w-8 lg:h-8 text-brand-gold" />
                </div>
                <div>
                  <h3 className="text-2xl lg:text-4xl font-bold text-white font-heading">{selectedCase.name[locale]}</h3>
                  <p className="text-brand-gold font-medium mt-1 uppercase tracking-wider text-xs lg:text-sm">{selectedCase.status[locale]}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-10">
                <div className="bg-white/5 rounded-xl p-4 lg:p-6 border border-white/5">
                  <p className="text-gray-400 text-[10px] lg:text-xs uppercase tracking-widest mb-1 lg:mb-2 font-bold">Location</p>
                  <p className="text-white text-sm lg:text-base font-medium">{selectedCase.location[locale]}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 lg:p-6 border border-white/5">
                  <p className="text-gray-400 text-[10px] lg:text-xs uppercase tracking-widest mb-1 lg:mb-2 font-bold">Achievement</p>
                  <p className="text-white text-sm lg:text-base font-medium">{selectedCase.achievement[locale]}</p>
                </div>
              </div>

              <div className="relative">
                <Quote className="absolute -top-3 -left-3 lg:-top-6 lg:-left-6 w-8 h-8 lg:w-12 lg:h-12 text-white/5" />
                <p className="text-gray-300 text-base lg:text-xl leading-relaxed font-serif italic relative z-10 pl-2 lg:pl-4">
                  &quot;{selectedCase.fullStory[locale]}&quot;
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <section className="py-32 bg-navy dark:bg-[#04080e] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <motion.div
           initial={{ opacity: 0, y: -10 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold mb-8"
        >
          <Award className="w-5 h-5" />
          <span className="text-sm font-bold tracking-widest uppercase">Global Success</span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-heading font-extrabold text-white mb-6"
        >
          {title}
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-400 font-sans max-w-3xl mx-auto"
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Modern Card Marquee */}
      <div className="relative w-full flex py-8 overflow-hidden group">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-navy dark:from-[#04080e] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-navy dark:from-[#04080e] to-transparent z-10 pointer-events-none" />
        
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 50
          }}
          className="flex whitespace-nowrap gap-8"
        >
          {marqueeItems.map((story, i) => (
            <div 
              key={i} 
              onClick={() => setSelectedCase(story)}
              className="relative w-[340px] md:w-[420px] h-[520px] shrink-0 rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 group-hover:opacity-60 hover:!opacity-100 transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-[0_0_40px_rgba(255,215,0,0.15)] hover:-translate-y-2"
            >
              {/* Image */}
              <div className="absolute inset-0 w-full h-[65%]">
                <Image
                  src={story.image}
                  alt={story.name[locale]}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 340px, 420px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1120] via-transparent to-transparent" />
              </div>

              {/* Card Content - Glass Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-[#0a1120]/90 backdrop-blur-xl border-t border-white/10 p-6 flex flex-col justify-between whitespace-normal">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-brand-gold" />
                    <p className="text-brand-gold text-xs font-bold uppercase tracking-wider">{story.location[locale]}</p>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1 font-heading">{story.name[locale]}</h3>
                  <p className="text-gray-400 text-sm line-clamp-1">{story.achievement[locale]}</p>
                </div>

                <div className="flex items-start gap-3 mt-4 pt-4 border-t border-white/5">
                  <Quote className="w-6 h-6 text-brand-gold/40 shrink-0" />
                  <p className="text-sm text-gray-300 italic line-clamp-2 leading-relaxed font-medium">
                    &quot;{story.quote[locale]}&quot;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Render Modal into React Portal if mounted */}
      {mounted && typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent}

    </section>
  );
}
