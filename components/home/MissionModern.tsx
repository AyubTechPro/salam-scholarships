'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Globe, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function MissionModern() {
  const locale = useLocale();

  const title = locale === 'tj' ? 'Рисолати Мо' : locale === 'ru' ? 'Наша миссия' : 'Our Mission';
  const tag = locale === 'tj' ? 'Арзишҳои Асосӣ' : locale === 'ru' ? 'Главные Ценности' : 'Core Values';
  
  const mission1 = locale === 'tj'
    ? 'Рисолати мо — тавсеаи имкониятҳои донишҷӯён тавассути пешниҳоди дониш, дастгирӣ ва роҳнамоии зарурӣ барои дастрасӣ ба таҳсилоти босифат дар саросари ҷаҳон мебошад.'
    : locale === 'ru'
    ? 'Наша миссия — расширять возможности студентов, предоставляя им знания, поддержку и сопровождение, необходимые для доступа к качественному образованию по всему миру.'
    : 'Our mission is to empower students by providing them with the knowledge, guidance, and support needed to access high-quality education worldwide.';

  const mission2Title = locale === 'tj' ? 'Саҳнаи Ҷаҳонӣ' : locale === 'ru' ? 'Глобальная Арена' : 'The Global Stage';
  const mission2 = locale === 'tj'
    ? 'Мо боварӣ дорем, ки ҳар як донишҷӯ ҳаққи рушд, омӯзиш ва муваффақиятро дар сатҳи байналмилалӣ дорад — новобаста аз шароити зиндагии худ.'
    : locale === 'ru'
    ? 'Мы верим, что каждый студент заслуживает возможности развиваться, учиться и добиваться успеха на международном уровне — независимо от своего происхождения.'
    : 'We believe that every student deserves the opportunity to grow, learn, and succeed on a global stage — regardless of their background.';

  const dedicatorText = locale === 'tj' 
    ? <>Бахшидашавӣ ба <br/> Муваффақияти Шумо</> 
    : locale === 'ru'
    ? <>Преданность <br/> Вашему Успеху</>
    : <>Dedication to <br/> Student Excellence</>;

  return (
    <section className="py-24 bg-gray-50 dark:bg-[url('/noise.png')] dark:bg-[#0a1120] relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-gold/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div
             initial={{ opacity: 0, y: -10 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold mb-6 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold tracking-widest uppercase">{tag}</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-heading font-extrabold text-brand-navy dark:text-white mb-8 leading-tight"
          >
            {title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl max-w-3xl mx-auto text-gray-700 dark:text-gray-300 leading-relaxed font-sans"
          >
            {mission1}
          </motion.p>
        </div>

        {/* PHOTOGRAPHY-DRIVEN BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Card 1: Split Layout Imagery (Takes 3 columns) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="col-span-1 lg:col-span-3 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden group min-h-[450px]"
          >
            {/* The Image covering the entire background but fading off */}
            <div className="absolute inset-0 hidden md:block">
              <Image 
                src="/images/about/IMG_6624.JPG" 
                alt="Global Mission" 
                fill 
                className="object-cover object-center group-hover:scale-105 transition-transform duration-1000"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              {/* Heavy gradient fade from Left (Navy) to Right (Transparent Image) */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d1424] via-[#0d1424]/90 to-transparent" />
            </div>

            {/* Mobile Fallback Image Layer */}
            <div className="absolute inset-0 block md:hidden">
              <Image src="/images/about/IMG_6624.JPG" alt="Global Mission" fill className="object-cover opacity-30" />
              <div className="absolute inset-0 bg-[#0d1424]/80" />
            </div>
            
            {/* Foreground Content */}
            <div className="relative z-10 p-10 lg:p-14 h-full flex flex-col justify-center max-w-lg">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-10 border border-white/20">
                <Globe className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-4xl font-heading font-bold text-white mb-6 leading-tight">{mission2Title}</h3>
              <p className="text-lg text-gray-300 leading-relaxed font-sans">
                {mission2}
              </p>
            </div>
          </motion.div>

          {/* Card 2: Image Background with 100% overlay (Takes 2 columns) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="col-span-1 lg:col-span-2 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden group min-h-[450px] flex flex-col justify-end"
          >
            {/* Full Image Background */}
            <Image 
               src="/images/about/IMG_6340.JPG" 
               alt="Student Dedication" 
               fill 
               className="object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60"
               sizes="(max-width: 1024px) 100vw, 40vw"
            />
            {/* Cinematic Overlay - Gold/Navy gradient from bottom to top */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1120] via-[#0a1120]/80 to-transparent" />
            <div className="absolute inset-0 bg-brand-gold/10 mix-blend-overlay" />

            <div className="relative z-10 p-10 lg:p-12">
              <div className="flex items-baseline gap-1 mb-4">
                <h3 className="text-7xl lg:text-8xl font-heading font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] tracking-tighter">
                  100
                </h3>
                <span className="text-5xl font-bold text-brand-gold drop-shadow-md">%</span>
              </div>
              
              <p className="text-gray-200 font-bold font-sans text-xl leading-snug tracking-wide uppercase drop-shadow-lg">
                {dedicatorText}
              </p>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
