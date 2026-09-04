'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { FileText, Send, CheckCircle2, ShieldCheck, ExternalLink, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DocumentVaultCard({ profile, onUpdate }: { profile: any, onUpdate: () => void }) {
  const locale = useLocale();
  const [uploading, setUploading] = useState<'cvUrl' | 'transcriptUrl' | 'passportUrl' | 'identitySelfieUrl' | null>(null);
  const [error, setError] = useState('');

  const handleSendToTelegram = async (type: 'cvUrl' | 'transcriptUrl' | 'passportUrl' | 'identitySelfieUrl') => {
    // Open Telegram
    window.open('https://t.me/SalamScholarshipsManager', '_blank');

    setUploading(type);
    setError('');

    try {
      // Mark as Sent internally so the Roadmap updates and the UI shows a green check
      const patchRes = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [type]: 'SENT_VIA_TELEGRAM'
        })
      });

      if (patchRes.ok) {
        onUpdate();
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      } else {
        throw new Error('Failed to update status');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save status');
    } finally {
      setUploading(null);
    }
  };

  const removeFile = async (type: 'cvUrl' | 'transcriptUrl' | 'passportUrl' | 'identitySelfieUrl') => {
    try {
      const patchRes = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [type]: null // Technically the schema expects a string or null, or we can send empty string
        })
      });
      if (patchRes.ok) {
        onUpdate();
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      }
    } catch (err) {
      setError('Could not remove file');
    }
  };

  const VaultSlot = ({ type, label, description, isCritical = false }: { type: 'cvUrl' | 'transcriptUrl' | 'passportUrl' | 'identitySelfieUrl', label: string, description: string, isCritical?: boolean }) => {
    const existingUrl = profile?.[type];
    const isSent = existingUrl && existingUrl.length > 0;

    return (
      <div className={`bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isCritical ? 'border-brand-gold bg-yellow-50/30' : 'border-gray-100'}`}>
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-lg bg-brand-navy/5 flex items-center justify-center flex-shrink-0">
            {isSent ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <ShieldCheck className="w-5 h-5 text-brand-navy/60" />}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              {label} 
              {isCritical && <span className="text-[10px] bg-brand-gold text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Required B2B</span>}
            </h4>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          {isSent ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" /> Sent to Manager
            </div>
          ) : (
            <button 
              onClick={() => handleSendToTelegram(type)} 
              className="w-full sm:w-auto px-4 py-2 bg-[#0088cc] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#0077b3] transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Send via Telegram
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-gold" />
            {locale === 'tj' ? 'Ҷувздони Ҳуҷҷатҳо (Document Vault)' : locale === 'ru' ? 'Хранилище Документов' : 'Document Vault'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {locale === 'tj' ? 'Ҷиҳати бехатарӣ, мо файлҳои ҳассоси шуморо нигоҳ намедорем. Ҳуҷҷатҳоро рост ба менеҷери мо интиқол диҳед.' : locale === 'ru' ? 'В целях безопасности мы не храним ваши файлы. Отправьте их напрямую нашему менеджеру.' : 'For highest security, we do not store sensitive files. Prepare the checklist and send them securely via Telegram.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VaultSlot
          type="cvUrl"
          label={locale === 'tj' ? 'Резюме / CV' : locale === 'ru' ? 'Резюме' : 'CV / Resume'}
          description="PDF or IMG (Max 5MB)"
        />
        <VaultSlot
          type="passportUrl"
          label={locale === 'tj' ? 'Шиноснома / Passport' : locale === 'ru' ? 'Загранпаспорт' : 'Passport Copy'}
          description="High Quality Scan"
        />
        <VaultSlot
          type="transcriptUrl"
          label={locale === 'tj' ? 'Транскрипт' : locale === 'ru' ? 'Транскрипт (Оценки)' : 'Academic Transcript'}
          description="University or School Grades"
        />
        <VaultSlot
          type="identitySelfieUrl"
          label={locale === 'tj' ? 'Тасдиқи Шахсият' : locale === 'ru' ? 'Селфи с Паспортом' : 'Identity Selfie Verification'}
          description="A clear selfie holding your passport open"
          isCritical={true}
        />
      </div>
    </motion.div>
  );
}
