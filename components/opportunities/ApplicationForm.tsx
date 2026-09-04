'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { Upload, File, X, CheckCircle2, Loader2, Send, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ApplicationFormProps {
  programId: string;
  programTitle: string;
  onSuccess: (data: { applicationId: string; telegramUrl: string }) => void;
  onCancel: () => void;
  onDraftSaved?: () => void;
}

interface FileUpload {
  file: File | null;
  url: string | null;
  uploading: boolean;
  error: string | null;
}

export default function ApplicationForm({
  programId,
  programTitle,
  onSuccess,
  onCancel,
  onDraftSaved,
}: ApplicationFormProps) {
  const { data: session } = useSession();
  const t = useTranslations('common');
  const locale = useLocale();
  const [motivationLetter, setMotivationLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<{
    cv: FileUpload;
    transcript: FileUpload;
    passport: FileUpload;
    receipt: FileUpload;
  }>({
    cv: { file: null, url: null, uploading: false, error: null },
    transcript: { file: null, url: null, uploading: false, error: null },
    passport: { file: null, url: null, uploading: false, error: null },
    receipt: { file: null, url: null, uploading: false, error: null },
  });

  const cvInputRef = useRef<HTMLInputElement>(null);
  const transcriptInputRef = useRef<HTMLInputElement>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill from Document Vault
  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(result => {
          if (result.success && result.data) {
            setFiles(prev => ({
              ...prev,
              cv: result.data.cvUrl ? { ...prev.cv, url: result.data.cvUrl } : prev.cv,
              transcript: result.data.transcriptUrl ? { ...prev.transcript, url: result.data.transcriptUrl } : prev.transcript,
              passport: result.data.passportUrl ? { ...prev.passport, url: result.data.passportUrl } : prev.passport,
            }));
          }
        })
        .catch(console.error);
    }
  }, [session]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

  const handleFileSelect = async (type: 'cv' | 'transcript' | 'passport' | 'receipt', file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFiles((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          error: 'Invalid file type. Only PDF, JPG, and PNG are allowed.',
        },
      }));
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFiles((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
        },
      }));
      return;
    }

    setFiles((prev) => ({
      ...prev,
      [type]: { ...prev[type], file, uploading: true, error: null },
    }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', type);
      formData.append('applicationId', programId); // Optional, for drafts

      const response = await fetch('/api/applications/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to upload file');
      }

      setFiles((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          url: result.data.url,
          uploading: false,
          error: null,
        },
      }));
    } catch (err) {
      setFiles((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          uploading: false,
          error: err instanceof Error ? err.message : 'Upload failed',
        },
      }));
    }
  };

  const removeFile = (type: 'cv' | 'transcript' | 'passport' | 'receipt') => {
    setFiles((prev) => ({
      ...prev,
      [type]: { file: null, url: null, uploading: false, error: null },
    }));
  };

  const handleSubmit = async (status: 'DRAFT' | 'SUBMITTED') => {
    setError('');

    if (status === 'SUBMITTED' && !motivationLetter.trim()) {
      setError('Motivation letter is required for submission');
      return;
    }

    if (status === 'SUBMITTED' && motivationLetter.trim().length < 50) {
      setError('Motivation letter must be at least 50 characters');
      return;
    }

    if (status === 'SUBMITTED' && !files.receipt.url) {
      setError(locale === 'tj' ? 'Бор кардани квитансияи пардохт ҳатмист' : locale === 'ru' ? 'Квитанция об оплате обязательна' : 'Payment receipt upload is mandatory for submission');
      return;
    }

    if (status === 'DRAFT') {
      setSavingDraft(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programId,
          motivationLetter: motivationLetter.trim() || undefined,
          cvUrl: files.cv.url || undefined,
          transcriptUrl: files.transcript.url || undefined,
          passportUrl: files.passport.url || undefined,
          receiptUrl: files.receipt.url || undefined,
          status,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit application');
      }

      if (status === 'DRAFT') {
        onDraftSaved?.();
        setSavingDraft(false);
      } else {
        onSuccess({
          applicationId: result.data.id,
          telegramUrl: result.data.telegramContactUrl,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
      setSavingDraft(false);
    }
  };

  const translations = {
    title: locale === 'tj' ? 'Барои дархост' : locale === 'ru' ? 'Подать заявку' : 'Apply Now',
    motivationLetter: locale === 'tj' ? 'Номаи мотиватсионӣ' : locale === 'ru' ? 'Мотивационное письмо' : 'Motivation Letter',
    motivationPlaceholder: locale === 'tj' 
      ? 'Чиро шумо барои ин барнома тавсиф мекунед? Ба тафсилот муфассал кунед...' 
      : locale === 'ru'
      ? 'Почему вы подходите для этой программы? Опишите подробно...'
      : 'Why are you a good fit for this program? Please describe in detail...',
    submit: locale === 'tj' ? 'Дархостро пешниҳод кунед' : locale === 'ru' ? 'Подать заявку' : 'Submit Application',
    saveDraft: locale === 'tj' ? 'Нусхаро захира кунед' : locale === 'ru' ? 'Сохранить черновик' : 'Save as Draft',
    cancel: locale === 'tj' ? 'Бекор кардан' : locale === 'ru' ? 'Отмена' : 'Cancel',
    required: locale === 'tj' ? 'Вориҷ' : locale === 'ru' ? 'Обязательно' : 'Required',
    optional: locale === 'tj' ? 'Ихтиёрӣ' : locale === 'ru' ? 'Необязательно' : 'Optional',
  };

  const FileUploadSlot = ({
    type,
    label,
    description,
    inputRef,
  }: {
    type: 'cv' | 'transcript' | 'passport' | 'receipt';
    label: string;
    description: string;
    inputRef: React.RefObject<HTMLInputElement>;
  }) => {
    const fileData = files[type];

    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          <span className="text-gray-500 text-xs font-normal ml-2">({description})</span>
        </label>
        
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileSelect(type, e.target.files?.[0] || null)}
          className="hidden"
        />

        {!fileData.url && !fileData.uploading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-brand-gold dark:hover:border-brand-gold transition-colors flex flex-col items-center justify-center space-y-2 bg-gray-50 dark:bg-gray-800/50"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-gray-500">PDF, JPG, PNG (max 5MB)</span>
          </button>
        )}

        {fileData.uploading && (
          <div className="w-full border-2 border-brand-gold border-dashed rounded-lg p-6 flex items-center justify-center space-x-3 bg-brand-gold/5">
            <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Uploading...</span>
          </div>
        )}

        {fileData.url && (
          <div className="w-full border-2 border-green-500 rounded-lg p-4 bg-green-50 dark:bg-green-900/20 flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {fileData.file?.name || 'Uploaded file'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {fileData.file ? `${(fileData.file.size / 1024 / 1024).toFixed(2)} MB` : 'Uploaded'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile(type)}
              className="ml-3 p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {fileData.error && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{fileData.error}</span>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Document Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {locale === 'tj' ? 'Илова кардани ҳуҷҷатҳо' : locale === 'ru' ? 'Загрузка документов' : 'Document Upload'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {locale === 'tj' 
            ? 'Илова кардани ҳуҷҷатҳо ихтиёрӣ аст, аммо тавсия дода мешавад' 
            : locale === 'ru'
            ? 'Загрузка документов необязательна, но рекомендуется'
            : 'Document uploads are optional but recommended'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileUploadSlot
            type="cv"
            label={locale === 'tj' ? 'Резюме' : locale === 'ru' ? 'Резюме' : 'CV / Resume'}
            description={translations.optional}
            inputRef={cvInputRef}
          />
          <FileUploadSlot
            type="transcript"
            label={locale === 'tj' ? 'Транскрипт' : locale === 'ru' ? 'Транскрипт' : 'Academic Transcript'}
            description={translations.optional}
            inputRef={transcriptInputRef}
          />
          <FileUploadSlot
            type="passport"
            label={locale === 'tj' ? 'Нусхаи паспорт' : locale === 'ru' ? 'Копия паспорта' : 'Passport Copy'}
            description={translations.optional}
            inputRef={passportInputRef}
          />
          <FileUploadSlot
            type="receipt"
            label={locale === 'tj' ? 'Квитансияи пардохт (Хизматрасонӣ)' : locale === 'ru' ? 'Квитанция об оплате услуг' : 'Service Fee Receipt'}
            description={translations.required}
            inputRef={receiptInputRef}
          />
        </div>
      </div>

      {/* Motivation Letter */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {translations.motivationLetter} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={motivationLetter}
          onChange={(e) => setMotivationLetter(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all resize-none"
          placeholder={translations.motivationPlaceholder}
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {motivationLetter.length} / 50 {locale === 'tj' ? 'навишта шудааст' : locale === 'ru' ? 'символов' : 'characters'} 
          {motivationLetter.length < 50 && ` (${50 - motivationLetter.length} ${locale === 'tj' ? 'бештар' : locale === 'ru' ? 'больше' : 'more'} ${locale === 'tj' ? 'зарур' : locale === 'ru' ? 'требуется' : 'required'})`}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="button"
          onClick={() => handleSubmit('SUBMITTED')}
          disabled={loading || savingDraft || !motivationLetter.trim() || motivationLetter.trim().length < 50}
          className="flex-1 bg-brand-gold text-brand-navy px-6 py-3 rounded-lg font-bold hover:bg-brand-gold/90 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{locale === 'tj' ? 'Дар ҳоли ирсол...' : locale === 'ru' ? 'Отправка...' : 'Submitting...'}</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>{translations.submit}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleSubmit('DRAFT')}
          disabled={loading || savingDraft}
          className="flex-1 border-2 border-brand-navy dark:border-white text-brand-navy dark:text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-navy hover:text-white dark:hover:bg-white dark:hover:text-brand-navy transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {savingDraft ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{locale === 'tj' ? 'Дар ҳоли нигоҳдорӣ...' : locale === 'ru' ? 'Сохранение...' : 'Saving...'}</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>{translations.saveDraft}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading || savingDraft}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {translations.cancel}
        </button>
      </div>
    </div>
  );
}

