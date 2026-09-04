'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Sparkles, Loader2, Calendar, Target, CheckCircle2, Circle } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface RoadmapStep {
  week: number;
  title: string;
  description: string;
  isCompleted: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface ApplicationRoadmap {
  programId: string;
  estimatedWeeks: number;
  strategySummary: string;
  steps: RoadmapStep[];
}

export default function InteractiveRoadmap({ programId, programTitle }: { programId: string, programTitle: string }) {
  const locale = useLocale();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<ApplicationRoadmap | null>(null);
  const [error, setError] = useState('');

  const generateRoadmap = async () => {
    if (!session?.user) {
      window.location.href = `/${locale}/login`;
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/user/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId, locale }),
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        setRoadmap(result.data);
      } else {
        setError(result.error || 'Failed to generate roadmap');
      }
    } catch (err) {
      setError('An error occurred while communicating with the AI.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (index: number) => {
    if (!roadmap) return;
    const updatedSteps = [...roadmap.steps];
    updatedSteps[index].isCompleted = !updatedSteps[index].isCompleted;
    setRoadmap({ ...roadmap, steps: updatedSteps });
  };

  if (!roadmap && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-gradient-to-br from-[#0a192f] to-[#112240] rounded-2xl p-8 shadow-2xl border border-white/10 relative overflow-hidden group mb-8 pt-10"
      >
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-gold/20 blur-3xl rounded-full group-hover:bg-brand-gold/30 transition-all duration-700" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Sparkles className="w-8 h-8 text-brand-gold" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 font-heading">
            {locale === 'tj' ? 'Генератори Стратегияи AI' : locale === 'ru' ? 'AI Генератор Стратегии' : 'AI Strategy Generator'}
          </h3>
          <p className="text-white/70 mb-6 text-sm max-w-sm mx-auto">
            {locale === 'tj' 
              ? `Нақшаи кории худкор ва ҳафтаинаро барои ${programTitle} тавлид кунед.`
              : locale === 'ru'
              ? `Создайте автоматизированный еженедельный план для ${programTitle}.`
              : `Generate a personalized weekly action plan for your application to ${programTitle}.`}
          </p>
          <button
            onClick={generateRoadmap}
            className="flex items-center space-x-2 bg-gradient-to-r from-brand-gold to-yellow-400 text-brand-navy px-8 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all transform hover:scale-105"
          >
            <Target className="w-5 h-5" />
            <span>
              {locale === 'tj' ? 'Тавлиди Нақша' : locale === 'ru' ? 'Создать План' : 'Generate Roadmap'}
            </span>
          </button>
          {error && <p className="text-red-400 mt-4 text-sm font-semibold">{error}</p>}
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-br from-[#0a192f] to-[#112240] rounded-2xl p-12 shadow-2xl border border-white/10 flex flex-col items-center justify-center text-center mb-8 h-64">
        <Loader2 className="w-10 h-10 text-brand-gold animate-spin mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">
          {locale === 'tj' ? 'Таҳлили Барнома...' : locale === 'ru' ? 'Анализ программы...' : 'Analyzing Program Requirements...'}
        </h3>
        <p className="text-white/60 text-sm">
          {locale === 'tj' ? 'AI нақшаи шуморо месозад' : locale === 'ru' ? 'AI создает ваш план' : 'AI is building your personalized roadmap'}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-8 max-h-[800px] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
        <div>
          <h3 className="text-2xl font-bold text-brand-navy flex items-center space-x-2 font-heading">
            <Sparkles className="w-6 h-6 text-brand-gold" />
            <span>{locale === 'tj' ? 'Нақшаи Кории Шумо' : locale === 'ru' ? 'Ваш План Действий' : 'Your Action Plan'}</span>
          </h3>
          <p className="text-gray-500 mt-2 text-sm">{roadmap?.strategySummary}</p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-3xl font-bold text-brand-gold">{roadmap?.estimatedWeeks}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Weeks</div>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {roadmap?.steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start gap-4"
            >
              <div className="flex flex-col items-center">
                <button
                  onClick={() => toggleStep(index)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    step.isCompleted 
                      ? 'bg-green-100 text-green-600 shadow-inner' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {step.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>
                {index !== roadmap.steps.length - 1 && (
                  <div className={`w-0.5 h-full min-h-[3rem] mt-2 rounded-full ${step.isCompleted ? 'bg-green-200' : 'bg-gray-200'}`} />
                )}
              </div>
              
              <div className={`flex-1 pt-1 pb-4 transition-all ${step.isCompleted ? 'opacity-60' : 'opacity-100'}`}>
                <div className="flex items-center space-x-3 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-navy/5 text-brand-navy">
                    Week {step.week}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    step.priority === 'HIGH' ? 'bg-red-100 text-red-600' :
                    step.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {step.priority}
                  </span>
                </div>
                <h4 className={`text-lg font-bold mb-1 ${step.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                  {step.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
