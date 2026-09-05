'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface LiveViewersProps {
  programId: string;
}

export function LiveViewers({ programId }: LiveViewersProps) {
  const [viewers, setViewers] = useState(0);
  const t = useTranslations('Opportunities'); // Or create a new translation namespace

  useEffect(() => {
    // Generate a deterministic but random-looking base number from programId
    const baseNumber = programId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 25 + 5;
    setViewers(baseNumber);

    // Randomly fluctuate the number every few seconds to create "live" effect
    const interval = setInterval(() => {
      setViewers((prev) => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
        const newTotal = prev + change;
        return newTotal < 3 ? prev : newTotal; // Keep it above 3 to look active
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [programId]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-500 w-fit backdrop-blur-sm"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, -5, 5, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        <Flame className="w-3.5 h-3.5 fill-red-500" />
      </motion.div>
      <motion.span
        key={viewers} // Animate when the number changes
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="tabular-nums"
      >
        {viewers} {t('liveViewers') || "viewing right now"}
      </motion.span>
    </motion.div>
  );
}
