import React from 'react';
import { motion } from 'motion/react';

interface DataParticlesProps {
  count?: number;
  active: boolean;
}

/**
 * Floating "data bits" — small dots + tick marks that drift upward around
 * the animation canvas, giving a living sci-fi HUD feel. Pure decorative.
 */
export function DataParticles({ count = 10, active }: DataParticlesProps) {
  const particles = React.useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: 8 + Math.random() * 84, // %
        size: 2 + Math.random() * 3,
        delay: Math.random() * 4,
        duration: 6 + Math.random() * 5,
        drift: (Math.random() - 0.5) * 40, // px horizontal wander
        opacity: 0.25 + Math.random() * 0.5,
      })),
    [count]
  );

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-brand dark:bg-brand"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          initial={{ bottom: '-5%', x: 0, opacity: 0 }}
          animate={{
            bottom: '105%',
            x: p.drift,
            opacity: [0, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
