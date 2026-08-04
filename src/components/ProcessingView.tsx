import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { RobotIcon } from './icons/RobotIcon';
import { ScanBeam } from './ScanBeam';
import { DataParticles } from './DataParticles';
import { DataReadout } from './DataReadout';

interface ProcessingViewProps {
  onComplete: () => void;
}

const STAGES = [
  {
    eyebrow: "Zpráva dorazila",
    title: "Karel přebírá e-mail",
    description: "Bez čekání ve frontě. Bez ručního přeposílání.",
  },
  {
    eyebrow: "Čtení a porozumění",
    title: "Karel si zprávu prohlíží",
    description: "Rozpoznává zákazníka, záměr, tón a důležité údaje.",
  },
  {
    eyebrow: "Vyhodnocení",
    title: "Posuzuje prioritu a riziko",
    description: "Kontroluje pravidla a rozhoduje, co lze bezpečně zařídit.",
  },
  {
    eyebrow: "Akce",
    title: "Karel připravuje řešení",
    description: "Tvoří odpověď, draft nebo přesnou eskalaci specialistovi.",
  },
];

// Slow, cinematic pacing per user preference.
const STAGE_DURATION = 5000;
const REDUCED_STAGE_DURATION = 800;

const cinematicEase = [0.16, 1, 0.3, 1] as const;

const stageVariants = {
  enter: { opacity: 0, y: 28, filter: 'blur(14px)', scale: 0.97 },
  center: { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 },
  exit: { opacity: 0, y: -28, filter: 'blur(14px)', scale: 0.97 },
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
  const isFinal = currentStage === STAGES.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(18px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(18px)' }}
      transition={{ duration: shouldReduceMotion ? 0.3 : 0.9, ease: cinematicEase }}
      className="relative flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-4 md:px-6 overflow-hidden"
      aria-live="polite"
    >
      {/* Ambient glow that gently breathes behind the scene */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        animate={shouldReduceMotion ? {} : {
          opacity: [0.25, 0.5, 0.25],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(217,160,67,0.12), transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Floating data particles */}
      <DataParticles active={!shouldReduceMotion} count={12} />

      {/* Animation Canvas */}
      <div className="relative w-full h-36 md:h-52 flex items-center justify-center mb-10">
        {/* Track */}
        <div className="absolute w-[62%] md:w-[72%] h-[2px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-full left-1/2 -translate-x-1/2" />

        {/* Scan beam sweeping the track while Karel reads */}
        <ScanBeam active={!shouldReduceMotion && currentStage > 0 && !isFinal} />

        {/* Delivery flash when envelope reaches the robot */}
        <AnimatePresence>
          {isFinal && (
            <motion.div
              aria-hidden
              className="absolute left-[75%] md:left-[85%] top-1/2 -translate-y-1/2 w-20 h-20 pointer-events-none"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 0], scale: [0.4, 1.6, 1.8] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              style={{
                background: 'radial-gradient(circle, rgba(217,160,67,0.55), transparent 70%)',
                filter: 'blur(4px)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Envelope */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0, x: '-50%' } : { x: '-210%', opacity: 0, filter: 'blur(8px)' }}
          animate={shouldReduceMotion ? { opacity: 1, x: '-50%' } : { x: '50%', opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: shouldReduceMotion ? 0.5 : 3.5, ease: 'easeInOut' }}
          className="absolute left-1/2 bg-white dark:bg-[#111] p-3 rounded-full shadow-md border border-black/5 dark:border-white/5 z-10"
        >
          <EnvelopeIcon className="w-6 h-6 text-gray-900 dark:text-gray-100" />
        </motion.div>

        {/* Robot + energy ring */}
        <div className="absolute left-[75%] md:left-[85%] z-20">
          {/* Pulsing ring that fills as stages progress */}
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-2xl border-2 border-brand/60"
            animate={shouldReduceMotion ? {} : {
              scale: [1, 1.25, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Active progress arc around robot */}
          <motion.div
            aria-hidden
            className="absolute -inset-1.5 rounded-2xl"
            style={{
              background: `conic-gradient(from 0deg, rgba(217,160,67,${isFinal ? 0.9 : 0.4}), transparent ${currentStage * 30}%)`,
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))',
            }}
            animate={shouldReduceMotion ? {} : { rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Robot body */}
          <motion.div
            animate={
              shouldReduceMotion ? {} : {
                scale: currentStage > 0 ? [1, 1.08, 1] : 1,
                filter: currentStage > 0 ? ['blur(0px)', 'blur(2px)', 'blur(0px)'] : 'blur(0px)',
              }
            }
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative bg-black dark:bg-brand text-white dark:text-black p-4 rounded-2xl shadow-xl"
          >
            <RobotIcon className="w-8 h-8" />
          </motion.div>

          {/* Success badge */}
          <AnimatePresence>
            {isFinal && (
              <motion.div
                initial={{ opacity: 0, scale: 0, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute -top-2 -right-2 bg-gray-900 dark:bg-black text-white dark:text-brand p-1 rounded-full border-2 border-white dark:border-brand z-30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stage Content — cinematic blur in/out */}
      <div className="text-center w-full h-36">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage}
            variants={shouldReduceMotion ? undefined : stageVariants}
            initial={shouldReduceMotion ? { opacity: 0 } : 'enter'}
            animate={shouldReduceMotion ? { opacity: 1 } : 'center'}
            exit={shouldReduceMotion ? { opacity: 0 } : 'exit'}
            transition={{ duration: shouldReduceMotion ? 0.3 : 0.9, ease: cinematicEase }}
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
        </AnimatePresence>
      </div>

      {/* Live terminal readout */}
      <DataReadout stageIndex={currentStage} />

      {/* Progress Dots */}
      <div className="flex gap-2 mt-4">
        {STAGES.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === currentStage ? 1.4 : 1,
              filter: i === currentStage ? 'blur(0px)' : 'blur(0.5px)',
              opacity: i <= currentStage ? 1 : 0.5,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`w-2 h-2 rounded-full transition-colors duration-500 ${i <= currentStage ? 'bg-gray-900 dark:bg-brand' : 'bg-gray-200 dark:bg-gray-800'}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
