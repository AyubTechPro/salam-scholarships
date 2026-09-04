'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, ArrowLeft, GraduationCap, XCircle, BrainCircuit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/common/Logo';

export default function EligibilityQuizPage({ params }: { params: { locale: string; id: string } }) {
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    gpa: '',
    englishLevel: '',
    workExperience: '',
    extracurriculars: '',
  });

  const [result, setResult] = useState<'PENDING' | 'PASS' | 'FAIL'>('PENDING');
  const [loading, setLoading] = useState(false);

  const calculateEligibility = () => {
    setLoading(true);
    // Simulate AI decision logic
    setTimeout(() => {
      // Basic logic: if GPA is 2.5 or lower, or English is B1 or lower, they might struggle for premium programs
      const isWeakProfile = 
        answers.gpa === 'under-3' && ['a1', 'b1'].includes(answers.englishLevel);
      
      setResult(isWeakProfile ? 'FAIL' : 'PASS');
      setLoading(false);
    }, 1500);
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else calculateEligibility();
  };

  const handleApply = () => {
    // Redirect back to program to apply
    router.push(`/${locale}/opportunities/${params.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy-light pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-12">
          <Logo size="lg" className="text-white" showTagline={false} />
        </div>

        <motion.div 
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {result === 'PENDING' && !loading && (
            <div className="space-y-6 text-white">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                <h1 className="text-2xl font-bold font-heading flex items-center gap-3">
                  <BrainCircuit className="text-brand-gold w-8 h-8" />
                  {locale === 'tj' ? 'Санҷиши мувофиқат' : locale === 'ru' ? 'Проверка права' : 'Eligibility Check'}
                </h1>
                <span className="bg-brand-gold text-navy font-bold px-3 py-1 rounded-full text-sm">
                  {step} / 4
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {step === 1 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-medium">
                        {locale === 'tj' ? 'Баҳои миёнаи шумо (GPA) чанд аст?' : locale === 'ru' ? 'Какой у вас средний балл (GPA)?' : 'What is your current GPA?'}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: 'under-3', label: '< 3.0 / 4.0' },
                          { id: '3-3.5', label: '3.0 - 3.5' },
                          { id: '3.5-3.8', label: '3.5 - 3.8' },
                          { id: '3.8+', label: '3.8+ (Excellent)' },
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setAnswers({...answers, gpa: opt.id})}
                            className={`p-4 rounded-xl border-2 transition-all ${answers.gpa === opt.id ? 'border-brand-gold bg-brand-gold/20' : 'border-white/20 hover:border-white/50 bg-white/5'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-medium">
                        {locale === 'tj' ? 'Сатҳи забони англисии шумо чист?' : locale === 'ru' ? 'Сатҳи забони англисии шумо чист?' : 'What is your English proficiency level?'}
                      </h2>
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          { id: 'a1', label: 'Beginner (A1-A2)' },
                          { id: 'b1', label: 'Intermediate (B1-B2) or IELTS 5.5' },
                          { id: 'c1', label: 'Advanced (C1-C2) or IELTS 6.5+' },
                          { id: 'native', label: 'Native / Fluent' },
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setAnswers({...answers, englishLevel: opt.id})}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${answers.englishLevel === opt.id ? 'border-brand-gold bg-brand-gold/20' : 'border-white/20 hover:border-white/50 bg-white/5'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-medium">
                        {locale === 'tj' ? 'Шумо таҷрибаи корӣ доред?' : locale === 'ru' ? 'У вас есть опыт работы?' : 'Do you have work or volunteer experience?'}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: 'none', label: 'No experience yet' },
                          { id: 'under-1', label: 'Under 1 year' },
                          { id: '1-3', label: '1 - 3 years' },
                          { id: '3+', label: '3+ years' },
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setAnswers({...answers, workExperience: opt.id})}
                            className={`p-4 rounded-xl border-2 transition-all ${answers.workExperience === opt.id ? 'border-brand-gold bg-brand-gold/20' : 'border-white/20 hover:border-white/50 bg-white/5'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-medium">
                        {locale === 'tj' ? 'Шумо дар фаъолиятҳои беруназсинфӣ иштирок доред?' : locale === 'ru' ? 'Участвуете ли вы во внеучебных мероприятиях?' : 'How active are you in extracurriculars?'}
                      </h2>
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          { id: 'none', label: 'Rarely participate' },
                          { id: 'some', label: 'Occasionally volunteer / participate' },
                          { id: 'active', label: 'Active leadership role / competitions' },
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setAnswers({...answers, extracurriculars: opt.id})}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${answers.extracurriculars === opt.id ? 'border-brand-gold bg-brand-gold/20' : 'border-white/20 hover:border-white/50 bg-white/5'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="pt-8 flex justify-between mt-8 border-t border-white/10">
                <button
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                  className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-white/50 hover:text-white disabled:opacity-0 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !answers.gpa) ||
                    (step === 2 && !answers.englishLevel) ||
                    (step === 3 && !answers.workExperience) ||
                    (step === 4 && !answers.extracurriculars)
                  }
                  className="bg-brand-gold text-navy px-8 py-3 rounded-xl font-bold hover:bg-brand-gold/90 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,215,0,0.3)] disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                >
                  {step === 4 ? 'Analyze Profile' : 'Next'}
                  {step !== 4 && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-white space-y-6">
              <BrainCircuit className="w-16 h-16 text-brand-gold animate-pulse mb-4" />
              <h2 className="text-2xl font-bold font-heading">Analyzing Your Profile...</h2>
              <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-brand-gold animate-[progress_1.5s_ease-in-out_infinite]" />
              </div>
            </div>
          )}

          {result === 'PASS' && !loading && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center text-white py-12"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 mb-8 p-4">
                <CheckCircle2 className="w-full h-full text-green-400" />
              </div>
              <h2 className="text-4xl font-heading font-bold mb-4">You are Eligible!</h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto text-lg">
                Your profile matches the core requirements for this opportunity. You have a high chance of moving forward!
              </p>
              <button
                onClick={handleApply}
                className="w-full sm:w-auto mx-auto bg-gradient-to-r from-brand-gold to-yellow-400 text-navy px-12 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all hover:scale-105 flex items-center justify-center gap-3"
              >
                <GraduationCap className="w-6 h-6" />
                Proceed to Submit Application
              </button>
            </motion.div>
          )}

          {result === 'FAIL' && !loading && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center text-white py-12"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/20 mb-8 p-4">
                <XCircle className="w-full h-full text-red-400" />
              </div>
              <h2 className="text-3xl font-heading font-bold mb-4">Consider Strengthening Your Profile</h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Based on historic outcomes, programs of this tier require higher academic standing or language proficiency. However, you can still apply or seek our consultation!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleApply}
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold border border-white/20 transition-all"
                >
                  Apply Anyway
                </button>
                <button
                  onClick={() => router.push(`/${locale}/consultation?programId=${params.id}`)}
                  className="bg-brand-gold text-navy px-8 py-4 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  Get VIP Consultation
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
