import React from 'react';
import { motion } from 'motion/react';
import { AnalysisResult } from '../types';
import { SavingsMetrics } from './SavingsMetrics';
import { CompanySavingsDashboard } from './CompanySavingsDashboard';

interface ResultViewProps {
  result: AnalysisResult;
  onRestart: () => void;
}

export function ResultView({ result, onRestart }: ResultViewProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-5xl mx-auto px-4 md:px-6 pb-24"
    >
      <motion.div variants={itemVariants} className="mb-12 mt-8 text-center md:text-left">
        <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-3 block">
          Zpracování dokončeno
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-4 leading-tight">
          Karel rozhodl a připravil další krok.
        </h2>
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-500 font-medium">
          <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            {result.category}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50 px-3.5 py-1.5 rounded-full border border-gray-100 dark:border-gray-700">
            <svg className="w-3.5 h-3.5 text-gray-900 dark:text-brand animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Jistota modelu: {result.confidence} %
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16 border-t border-b border-gray-100 dark:border-gray-800 py-10">
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Zákazník</div>
          <div className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{result.customerStatus}</div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Rozhodnutí</div>
          <div className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{result.actionLabel}</div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Další krok</div>
          <div className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-brand tracking-tight">{result.recipient}</div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-24 mt-8">
        <div className="lg:col-span-8">
          <div className="flex flex-col h-full">
            <div className="pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3 text-lg">
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                {result.outputTitle}
              </h3>
              {result.action === 'DRAFT' && (
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-full">Připraveno k úpravě</span>
              )}
            </div>
            <div className="pt-8 grow text-lg md:text-xl text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-light">
              {result.output}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="h-full flex flex-col">
            <div className="mb-8">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Odůvodnění</span>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-xl tracking-tight">Proč právě takto</h3>
            </div>
            
            <ol className="space-y-6 grow">
              {result.reasons.map((reason, idx) => (
                <li key={idx} className="flex gap-4 text-base text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                  <span className="flex-shrink-0 text-gray-300 dark:text-gray-600 font-semibold text-sm mt-1">
                    0{idx + 1}
                  </span>
                  <span>{reason}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <SavingsMetrics 
          humanMinutes={result.humanMinutes} 
          aiSeconds={result.aiSeconds} 
          hourlyCost={result.hourlyCost} 
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <CompanySavingsDashboard />
      </motion.div>

      <motion.div variants={itemVariants} className="mt-20 flex justify-center">
        <button 
          onClick={onRestart}
          className="px-10 py-4 bg-gray-900 dark:bg-brand hover:bg-black dark:hover:bg-brand-hover text-white dark:text-black font-semibold rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-sm shadow-black/10 focus:ring-4 focus:ring-black/20 dark:focus:ring-brand/20 outline-none cursor-pointer text-sm uppercase tracking-wider"
        >
          Vyzkoušet další e-mail
        </button>
      </motion.div>
    </motion.div>
  );
}
