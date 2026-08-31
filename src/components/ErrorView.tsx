import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RotateCcw, PenLine } from 'lucide-react';

interface ErrorViewProps {
  message: string;
  /** True when a retry might succeed (transient outage / timeout). */
  retryable: boolean;
  onRetry: () => void;
  onEdit: () => void;
}

export function ErrorView({ message, retryable, onRetry, onEdit }: ErrorViewProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-2xl mx-auto px-6 pb-24"
    >
      <motion.div
        variants={itemVariants}
        className="mt-16 md:mt-24 text-center"
      >
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10 ring-1 ring-red-100 dark:ring-red-500/20">
          <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400" />
        </div>

        <span className="text-xs font-bold tracking-[0.2em] text-red-500 dark:text-red-400 uppercase mb-3 block">
          Analýza se nezdařila
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-4 leading-tight">
          Karel se k e-mailu nedostal.
        </h2>

        <p className="mx-auto max-w-xl text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-light">
          {message}
        </p>

        <p className="mx-auto mt-4 max-w-xl text-sm text-gray-500 dark:text-gray-500 leading-relaxed">
          {retryable
            ? 'Toto je dočasný výpadek služby — váš e-mail nebyl zpracován a žádná klasifikace nevznikla. Můžete to zkusit znovu, nebo upravit vstup.'
            : 'Váš e-mail nebyl zpracován a žádná klasifikace nevznikla. Zkontrolujte nastavení modelu a API klíče, nebo upravte vstup.'}
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        {retryable && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-brand hover:bg-black dark:hover:bg-brand-hover text-white dark:text-black font-semibold rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-sm shadow-black/10 focus:ring-4 focus:ring-black/20 dark:focus:ring-brand/20 outline-none cursor-pointer text-sm uppercase tracking-wider"
          >
            <RotateCcw className="h-4 w-4" />
            Zkusit znovu
          </button>
        )}
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none cursor-pointer text-sm uppercase tracking-wider"
        >
          <PenLine className="h-4 w-4" />
          Upravit e-mail
        </button>
      </motion.div>
    </motion.div>
  );
}
