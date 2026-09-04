'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import Image from '@/components/common/ImageWithFallback';

export default function AboutModern() {
  const locale = useLocale();

  const title = locale === 'tj' ? 'Дар бораи Salam Scholarships' : locale === 'ru' ? 'О Salam Scholarships' : 'About Salam Scholarships';
  
  const text1 = locale === 'tj' 
    ? 'Salam Scholarships — як платформаи машваратии таълимӣ мебошад, ки ба донишҷӯён дар боз кардани имкониятҳои ҷаҳонӣ тавассути стипендияҳо, барномаҳои табодулӣ, форумҳо, конфронсҳо, саммитҳо, таҷрибаомӯзӣ ва барномаҳои байналмилалии таълимӣ кумак мекунад.' 
    : locale === 'ru' 
    ? 'Salam Scholarships — это образовательная консалтинговая платформа, которая помогает студентам открывать глобальные возможности через стипендии, программы обмена, форумы, конференции, саммиты, стажировки и международные образовательные программы.' 
    : 'Salam Scholarships — is an educational consulting platform dedicated to helping students unlock global opportunities through scholarships, exchange programs, forums and conferences, summits, internships and international education pathways.';

  const text2 = locale === 'tj'
    ? 'Ширкати мо моҳи феврали соли 2024 таъсис ёфта, бо як рисолати возеҳ рӯи кор омадааст: дастрас, фаҳмо ва дастрастар кардани имкониятҳои байналмилалӣ барои ҷавонон дар Тоҷикистон ва берун аз он.'
    : locale === 'ru'
    ? 'Основанная в феврале 2024 году, компания Salam Scholarships была создана с чёткой миссией: сделать международные возможности более доступными, понятными и достижимыми для молодёжи Таджикистана и за его пределами.'
    : 'Founded in February 2024, Salam Scholarships was created with a clear mission: to make international opportunities more accessible, understandable, and achievable for youth in Tajikistan and beyond.';

  const text3 = locale === 'tj'
    ? 'Мо донишҷӯёнро дар ҳар марҳилаи роҳашон ҳамроҳӣ мекунем — аз пайдо кардани имкониятҳои мувофиқ то омода кардани дархостҳои қавӣ ва бомуваффақият ворид шудан ба барномаҳои байналмилалӣ.'
    : locale === 'ru'
    ? 'Мы сопровождаем студентов на каждом этапе их пути — от поиска подходящих возможностей до подготовки сильных заявок и успешного получения участия в международных программах.'
    : 'We guide students through every step of their journey — from discovering the right opportunities to preparing strong applications and successfully securing placements in international programs.';

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 bg-navy dark:bg-navy-dark overflow-hidden">
      {/* Absolute Glow Effects for 2026 Aesthetic */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-6 space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
              <span className="text-brand-gold text-sm font-semibold tracking-wider uppercase">Est. 2024</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-white leading-[1.1]">
              About <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">
                Salam Scholarships
              </span>
            </h2>

            <div className="space-y-6 text-lg text-gray-300 font-sans leading-relaxed">
              <p>{text1}</p>
              <p>{text2}</p>
              <p className="font-medium text-white/90 border-l-2 border-brand-gold pl-4">{text3}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative h-[500px] lg:h-[700px] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
              <Image
                src="/images/about/IMG_6624.JPG"
                alt="About Salam Scholarships"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-navy/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

