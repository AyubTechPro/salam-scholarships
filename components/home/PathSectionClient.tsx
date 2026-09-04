'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

type PathContent = {
  pathTitle?: string | null;
  pathTitleRu?: string | null;
  pathTitleTj?: string | null;
  pathText1?: string | null;
  pathText1Ru?: string | null;
  pathText1Tj?: string | null;
  pathText2?: string | null;
  pathText2Ru?: string | null;
  pathText2Tj?: string | null;
  pathImage?: string | null;
};

interface PathSectionClientProps {
  content: PathContent | null;
  locale: string;
  translations: {
    title: string;
    text1: string;
    text2: string;
  };
}

export default function PathSectionClient({ content, locale, translations }: PathSectionClientProps) {
  const getLocalizedContent = () => {
    if (!content) {
      return {
        title: translations.title,
        text1: translations.text1,
        text2: translations.text2,
        image: '/images/placeholder-path.jpg',
      };
    }

    if (locale === 'ru') {
      return {
        title: content.pathTitleRu || content.pathTitle || translations.title,
        text1: content.pathText1Ru || content.pathText1 || translations.text1,
        text2: content.pathText2Ru || content.pathText2 || translations.text2,
        image: content.pathImage || '/images/placeholder-path.jpg',
      };
    }
    if (locale === 'tj') {
      return {
        title: content.pathTitleTj || content.pathTitle || translations.title,
        text1: content.pathText1Tj || content.pathText1 || translations.text1,
        text2: content.pathText2Tj || content.pathText2 || translations.text2,
        image: content.pathImage || '/images/placeholder-path.jpg',
      };
    }
    return {
      title: content.pathTitle || translations.title,
      text1: content.pathText1 || translations.text1,
      text2: content.pathText2 || translations.text2,
      image: content.pathImage || '/images/placeholder-path.jpg',
    };
  };

  const localized = getLocalizedContent();

  return (
    <section className="py-20 bg-gradient-to-br from-navy to-navy-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-8">
            {localized.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <p className="text-lg leading-relaxed text-gray-200">
              {localized.text1}
            </p>
            <p className="text-lg leading-relaxed text-gray-200">
              {localized.text2}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-96 rounded-xl overflow-hidden shadow-xl"
          >
            {(localized.image && !localized.image.startsWith('/images/placeholder')) ? (
              <Image
                src={localized.image}
                alt={locale === 'tj' ? 'Роҳи мо' : locale === 'ru' ? 'Наш путь' : 'Our Path'}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <Image
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2000&auto=format&fit=crop"
                alt="Salam Scholarships Our Path"
                fill
                className="object-cover"
              />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

