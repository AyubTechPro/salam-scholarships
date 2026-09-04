'use client';

import { CheckCircle2 } from 'lucide-react';
import { useScopedTranslation } from '@/lib/scoped-translation-client';

export default function VerifiedBadge() {
  const verifiedText = useScopedTranslation('verified', 'dashboard');
  
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-brand-gold/20 backdrop-blur-sm rounded-full border border-brand-gold/30">
      <CheckCircle2 className="w-5 h-5 text-brand-gold" />
      <span className="text-sm font-semibold text-white">
        {verifiedText || 'Verified Student'}
      </span>
    </div>
  );
}

