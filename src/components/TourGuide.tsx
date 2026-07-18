import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Play, CheckCircle2, TrendingUp, X, type LucideIcon } from 'lucide-react';

interface TourGuideProps {
  onClose: () => void;
}

const TOUR_STEPS: Array<{ id: string; title: string; text: string; icon: React.ReactElement<React.SVGProps<SVGSVGElement>> }> = [
  {
    id: 'intro',
    title: 'Budoucnost péče o zákazníky.',
    text: 'Představujeme Karla. Vašeho nového AI asistenta, který převezme rutinní e-maily a nechá vám prostor pro to nejdůležitější – budování vztahů se zákazníky.',
    icon: <Sparkles className="w-8 h-8 text-gray-900 dark:text-gray-100" />,
  },
  {
    id: 'scenarios',
    title: 'Vyberte si svůj svět.',
    text: 'E-shop, telekomunikace nebo B2B služby? Vyzkoušejte si reálné české e-maily – od dotazů přes reklamace až po rozzlobené zákazníky.',
    icon: <Play className="w-8 h-8 text-gray-900 dark:text-gray-100" />,
  },
  {
    id: 'analysis',
    title: 'Okamžité pochopení.',
    text: 'Karel e-mail nejen přečte, ale pochopí. Rozpozná emoce, vytáhne čísla objednávek a přesně identifikuje, co zákazník žádá.',
    icon: <CheckCircle2 className="w-8 h-8 text-gray-900 dark:text-gray-100" />,
  },
  {
    id: 'roi',
    title: 'Čas jsou peníze.',
    text: 'Podívejte se na interaktivní grafy a zjistěte, kolik hodin a financí ušetří jeden operátor nebo celá firma za jediný měsíc.',
    icon: <TrendingUp className="w-8 h-8 text-gray-900 dark:text-gray-100" />,
  }
];

export function TourGuide({ onClose }: TourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-white dark:bg-[#111] w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-10"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 outline-none"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-10 pb-6">
            <div className="text-gray-900 dark:text-brand mb-8">
              {React.cloneElement(TOUR_STEPS[currentStep].icon, { className: "w-8 h-8" })}
            </div>
            
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight mb-4">
              {TOUR_STEPS[currentStep].title}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-light">
              {TOUR_STEPS[currentStep].text}
            </p>
          </div>

          <div className="px-10 pb-10 pt-4 flex items-center justify-between">
            <div className="flex gap-2">
              {TOUR_STEPS.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    idx === currentStep ? 'w-8 bg-gray-900 dark:bg-brand' : 'w-2 bg-gray-100 dark:bg-gray-800'
                  }`}
                />
              ))}
            </div>
            
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-brand hover:bg-black dark:hover:bg-brand-hover text-white dark:text-black text-sm font-medium rounded-full transition-all focus:ring-4 focus:ring-gray-900/10 dark:focus:ring-brand/20 outline-none"
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Začít' : 'Pokračovat'}
              {currentStep < TOUR_STEPS.length - 1 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
