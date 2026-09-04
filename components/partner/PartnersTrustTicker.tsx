import { getLocale } from 'next-intl/server';
import Image from 'next/image';
import { prisma } from '@/lib/prisma'; // Prisma is at this path!

export default async function PartnersTrustTicker() {
  const locale = await getLocale() as 'tj' | 'ru' | 'en';
  
  // Dynamically fetch registered B2B Partners who have uploaded their logos.
  const partners = await prisma.partner.findMany({
    where: {
      isActive: true,
      logo: { not: null }, // Only fetch partners that actually uploaded a logo!
    },
    select: {
      id: true,
      name: true,
      logo: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20, // Max limit to keep the ribbon fast and performant.
  });

  // If no partners are registered yet, hide the section entirely to keep the design clean.
  if (!partners || partners.length === 0) {
    return null; 
  }

  const text = {
    tj: 'Шарикони боэътимоди мо дар саросари ҷаҳон',
    ru: 'Нам доверяют ведущие организации по всему миру',
    en: 'Trusted by leading institutions worldwide'
  };

  return (
    <div className="w-full bg-[#03060a] border-y border-white/5 py-12 overflow-hidden relative">
      <div className="text-center mb-8">
         <p className="text-gray-400 font-medium tracking-wider text-sm uppercase">{text[locale]}</p>
      </div>

      {/* Mask for fading edges */}
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#03060a] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#03060a] to-transparent z-10 pointer-events-none" />

      {/* Ticker Track */}
      <div className="flex w-[200%] animate-ticker hover:[animation-play-state:paused]">
        
        {/* Set 1 */}
        <div className="flex w-1/2 justify-around items-center px-8">
          {partners.map((partner) => (
             <div key={`set1-${partner.id}`} className="relative h-16 w-40 flex items-center justify-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer" title={partner.name}>
               <Image 
                 src={partner.logo!} 
                 alt={partner.name} 
                 fill 
                 className="object-contain" 
               />
             </div>
          ))}
        </div>

        {/* Set 2 (Duplicate for infinite loop) */}
         <div className="flex w-1/2 justify-around items-center px-8">
          {partners.map((partner) => (
             <div key={`set2-${partner.id}`} className="relative h-16 w-40 flex items-center justify-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer" title={partner.name}>
               <Image 
                 src={partner.logo!} 
                 alt={partner.name} 
                 fill 
                 className="object-contain" 
               />
             </div>
          ))}
        </div>

      </div>
    </div>
  );
}
