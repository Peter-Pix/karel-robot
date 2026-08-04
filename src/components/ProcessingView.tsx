import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { RobotIcon } from './icons/RobotIcon';

interface ProcessingViewProps {
  onComplete: () => void;
}

const STAGES = [
  {
    eyebrow: "Zpráva dorazila",
    title: "Karel přebírá e-mail",
    description: "Bez čekání ve frontě. Bez ručního přeposílání."
  },
  {
    eyebrow: "Čtení a porozumění",
    title: "Karel si zprávu prohlíží",
    description: "Rozpoznává zákazníka, záměr, tón a důležité údaje."
  },
  {
    eyebrow: "Vyhodnocení",
    title: "Posuzuje prioritu a riziko",
    description: "Kontroluje pravidla a rozhoduje, co lze bezpečně zařídit."
  },
  {
    eyebrow: "Akce",
    title: "Karel připravuje řešení",
    description: "Tvoří odpověď, draft nebo přesnou eskalaci specialistovi."
  }
];

// Per user preference: slow, cinematic feel. Min 5s per stage.
const STAGE_DURATION = 5000;
// The reduced-motion fallback stays quick so accessibility isn't punished.
const REDUCED_STAGE_DURATION = 800;

// Cinematic blur helper — shared blur/scale in and out.
const blurTransition = {
  duration: 0.9,
  ease: [0.16, 1, 0.3, 1] as const, // cinematic easeOutExpo-ish
};

export function ProcessingView({ onComplete }: ProcessingViewProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const stageDuration = shouldReduceMotion ? REDUCED_STAGE_DURATION : STAGE_DURATION;
    const totalStages = STAGES.length;

    let timer: number;

    const advanceStage = () => {
      setCurrentStage((prev) => {
        if (prev < totalStages - 1) {
          timer = window.setTimeout(advanceStage, stageDuration);
          return prev + 1;
        } else {
          timer = window.setTimeout(onComplete, stageDuration);
          return prev;
        }
      });
    };

    timer = window.setTimeout(advanceStage, stageDuration);

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [onComplete, shouldReduceMotion]);

  const stage = STAGES[currentStage];

  // Cinematic blur in/out variants for stage content
  const stageVariants = {
    enter: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, filter: 'blur(12px)', scale: 0.98 },
    center: { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 },
    exit: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -24, filter: 'blur(12px)', scale: 0.98 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(16px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(16px)' }}
      transition={blurTransition}
      className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-4 md:px-6"
      aria-live="polite"
    >
      {/* Animation Canvas */}
      <div className="relative w-full h-32 md:h-48 flex items-center justify-center mb-16">

        {/* Track */}
        <div className="absolute w-[60%] md:w-[70%] h-[2px] bg-gray-100 dark:bg-gray-800 rounded-full left-1/2 -translate-x-1/2" />

        {/* Envelope */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0, x: '-50%' } : { x: '-200%', opacity: 0, filter: 'blur(6px)' }}
          animate={shouldReduceMotion ? { opacity: 1, x: '-50%' } : { x: '50%', opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: shouldReduceMotion ? 0.5 : 3.5, ease: "easeInOut" }}
          className="absolute left-1/2 bg-white dark:bg-[#111] p-3 rounded-full shadow-md border border-black/5 dark:border-white/5 z-10"
        >
          <EnvelopeIcon className="w-6 h-6 text-gray-900 dark:text-gray-100" />
        </motion.div>

        {/* Robot */}
        <motion.div
          animate={
            shouldReduceMotion ? {} : {
              scale: currentStage > 0 ? [1, 1.08, 1] : 1,
              filter: currentStage > 0 ? ['blur(0px)', 'blur(2px)', 'blur(0px)'] : 'blur(0px)',
            }
          }
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[75%] md:left-[85%] bg-black dark:bg-brand text-white dark:text-black p-4 rounded-2xl shadow-xl z-20"
        >
          <RobotIcon className="w-8 h-8" />
        </motion.div>

        {/* Success Indicator */}
        {currentStage === STAGES.length - 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute left-[75%] md:left-[85%] -top-2 -right-2 bg-gray-900 dark:bg-black text-white dark:text-brand p-1 rounded-full border-2 border-white dark:border-brand z-30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </motion.div>
        )}

      </div>

      {/* Stage Content — cinematic blur in/out */}
      <div className="text-center w-full h-40">
        <motion.div
          key={currentStage}
          variants={stageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={blurTransition}
        >
          <span className="text-sm font-semibold tracking-wide text-gray-900 dark:text-gray-100 uppercase mb-3 block">
            {stage.eyebrow}
          </span>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
            {stage.title}
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            {stage.description}
          </p>
        </motion.div>
      </div>

      {/* Progress Dots */}
      <div className="flex gap-2 mt-8">
        {STAGES.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === currentStage ? 1.35 : 1,
              filter: i === currentStage ? 'blur(0px)' : 'blur(0.5px)',
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`w-2 h-2 rounded-full transition-colors duration-500 ${i <= currentStage ? 'bg-gray-900 dark:bg-brand' : 'bg-gray-200 dark:bg-gray-800'}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
