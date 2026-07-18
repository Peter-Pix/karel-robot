import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ShieldCheck, Clock, CalendarX2, Briefcase, Zap } from 'lucide-react';

export function AiEmployeeFeature() {
  const features = [
    { icon: ShieldCheck, title: 'Neodmlouvá' },
    { icon: CalendarX2, title: 'Nemarodí' },
    { icon: Briefcase, title: 'Nejezdí na dovolenou' },
    { icon: Zap, title: 'Neulejvá se' },
  ];

  return (
    <div className="mt-24 md:mt-40 mb-32 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 flex flex-col items-center"
        >
          <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase block mb-4">
            Pracovní síla nové generace
          </span>
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tight mb-8 leading-[1.1] text-gray-900 dark:text-gray-100">
            Perfektní<br />
            <span className="text-gray-400 font-light">zaměstnanec.</span>
          </h2>
          <div className="inline-flex items-center gap-3 border border-gray-100 dark:border-gray-800 px-5 py-2.5 rounded-full text-gray-500 dark:text-gray-400 font-light text-[11px] uppercase tracking-widest mt-4">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>Pracuje 24 / 7</span>
          </div>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-500 dark:text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl mb-24"
        >
          Představte si kolegu, který se nikdy neunaví, nevyhoří a je vždy připraven řešit požadavky zákazníků.
        </motion.p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 w-full">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + idx * 0.1, ease: "easeOut" }}
                className="flex flex-col items-center text-center group"
              >
                <div className="text-gray-300 dark:text-gray-700 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-500 mb-6">
                  <Icon className="w-8 h-8" />
                </div>
                <div className="font-light text-sm tracking-wide text-gray-900 dark:text-gray-100">
                  {feature.title}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
