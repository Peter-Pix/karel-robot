import React from 'react';
import { motion } from 'motion/react';

interface ScanBeamProps {
  active: boolean;
}

/**
 * A soft light sweep that travels across the track while Karel "reads"
 * the e-mail. Gives the processing a tangible, alive sense of motion.
 */
export function ScanBeam({ active }: ScanBeamProps) {
  if (!active) return null;

  return (
    <motion.div
      aria-hidden
      className="absolute top-0 bottom-0 w-24 -ml-12 pointer-events-none z-[5]"
      initial={{ left: '0%', opacity: 0 }}
      animate={{
        left: ['0%', '100%'],
        opacity: [0, 0.7, 0.7, 0],
      }}
      transition={{
        duration: 2.8,
        repeat: Infinity,
        ease: 'easeInOut',
        times: [0, 0.4, 0.6, 1],
      }}
      style={{
        background:
          'linear-gradient(90deg, transparent, rgba(217,160,67,0.35), transparent)',
        filter: 'blur(6px)',
      }}
    />
  );
}
