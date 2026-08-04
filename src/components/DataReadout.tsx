import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface DataReadoutProps {
  stageIndex: number;
}

const READOUTS: string[][] = [
  [
    "> příjem zprávy… ok",
    "> odesílatel rozpoznán",
    "> zařazeno do fronty",
  ],
  [
    "> čtení obsahu…",
    "> detekce záměru: reklamace",
    "> extrakce čísla objednávky",
    "> analýza tónu: frustrace",
  ],
  [
    "> kontrola pravidel…",
    "> posouzení rizika: nízké",
    "> priorita: standardní",
  ],
  [
    "> sestavuji odpověď…",
    "> kontrola vykání: ok",
    "> formátování e-mailu…",
    "> hotovo ✓",
  ],
];

export function DataReadout({ stageIndex }: DataReadoutProps) {
  const lines = READOUTS[Math.min(stageIndex, READOUTS.length - 1)] ?? [];
  const [visible, setVisible] = useState(0);

  // Reveal lines one by one during the stage (fast so all show within ~2s)
  useEffect(() => {
    setVisible(0);
    const timers: number[] = [];
    lines.forEach((_, i) => {
      timers.push(window.setTimeout(() => setVisible(i + 1), 350 + i * 500));
    });
    return () => timers.forEach(clearTimeout);
  }, [stageIndex, lines.length]);

  return (
    <div className="w-full max-w-md mx-auto mt-6 text-left font-mono text-[11px] leading-relaxed text-gray-500 dark:text-zinc-500 min-h-[72px] select-none" aria-hidden>
      <AnimatePresence mode="wait">
        <motion.div
          key={stageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {lines.slice(0, visible).map((line, i) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="whitespace-nowrap overflow-hidden text-ellipsis"
            >
              <span className="text-brand">{line.includes('✓') ? '✓' : '›'}</span> {line.replace(/^[>✓]\s*/, '')}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
