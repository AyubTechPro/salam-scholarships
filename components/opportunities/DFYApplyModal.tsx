'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DFYApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  programTitle: string;
}

export function DFYApplyModal({ isOpen, onClose, programId, programTitle }: DFYApplyModalProps) {
  const t = useTranslations('Opportunities');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/consulting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || 'no-email@dfy.com', // Optional email fallback
          phone: formData.phone,
          message: `PREMIUM DFY SERVICE REQUEST for program: ${programTitle} (ID: ${programId}). Customer requested "Apply For Me".`,
          targetProgramId: programId,
          preferredLanguage: 'en'
        }),
      });

      if (res.ok) {
        setStep(2); // Success step
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("DFY Submit Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#050505]/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] z-[101] overflow-hidden border border-white/10"
          >
            {/* Subtle Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 via-transparent to-transparent pointer-events-none" />
            
            {/* Header */}
            <div className="relative p-8 pb-6 border-b border-white/5">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-14 h-14 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-lg">
                <Sparkles className="w-7 h-7 text-brand-gold drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
              </div>
              
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                Managed Application <span className="text-brand-gold font-light">Infrastructure</span>
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">
                Initiate a structured application process for <strong className="text-white">{programTitle}</strong>. Our team guarantees compliance and processing standards.
              </p>
            </div>

            {/* Content */}
            <div className="p-8 relative">
              {step === 1 ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold tracking-wider uppercase text-gray-500 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all text-white placeholder-gray-600"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold tracking-wider uppercase text-gray-500 mb-2">
                      WhatsApp / Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-all text-white placeholder-gray-600"
                      placeholder="+992 9X XXX XXXX"
                    />
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-b from-[#eab308] to-[#a16207] p-[1px] hover:shadow-[0_0_40px_rgba(234,179,8,0.4)] transition-all duration-500 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:transform-none disabled:hover:shadow-none"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                      <div className="relative flex items-center justify-center space-x-2 bg-gradient-to-b from-[#facc15] to-[#eab308] px-6 py-4 rounded-[11px] text-[#020617] font-black text-lg shadow-inner">
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin text-[#020617]" />
                        ) : (
                          <>
                            <span>Initiate Process</span>
                            <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </div>
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-5 flex items-center justify-center font-medium">
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-brand-gold opacity-70" /> Step 1 of 3: Identity verification & capability mapping.
                    </p>
                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="w-12 h-12 text-emerald-400" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Request Received</h3>
                  <p className="text-gray-400 mb-10 max-w-sm text-base leading-relaxed">
                    Our expert team will contact you on WhatsApp shortly to initiate your application process.
                  </p>
                  <button
                    onClick={onClose}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-lg"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
