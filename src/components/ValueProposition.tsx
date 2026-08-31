import React from 'react';
import { motion } from 'motion/react';
import { Clock, Wallet, ShoppingBag, Wifi, Briefcase, ArrowRight } from 'lucide-react';

/**
 * Landing value proposition — the "what AI saves, for whom" section.
 *
 * Numbers are derived from the same honest math as the ROI dashboard
 * (savingsCalculator defaults: 80 e-mailů/den, 70 % automatizace,
 * 420 Kč/h operátor, 1,5 min review). Keeping them in sync with the
 * dashboard means the landing copy never overpromises.
 */
const SAVINGS = {
  perEmailMinutes: 4.5,
  perMonthHours: 127,
  perMonthCzk: '53 500 Kč',
  perYearHours: 1529,
  perYearCzk: '642 000 Kč',
};

const AUDIENCES = [
  {
    icon: ShoppingBag,
    title: 'E-shopy',
    text: 'Reklamace, dotazy k objednávkám, vrácení zboží — Karel je roztřídí a připraví odpověď dřív, než zákazník stihne napsat druhou zprávu.',
  },
  {
    icon: Wifi,
    title: 'Telco & ISP',
    text: 'Výpadky, fakturace, změny tarifu. Karel pozná, co je běžný dotaz a co už je eskalace na technika nebo právní tým.',
  },
  {
    icon: Briefcase,
    title: 'B2B služby',
    text: 'Poptávky, smlouvy, požadavky klíčových klientů. Karel drží prioritu a nenechá důležitého zákazníka čekat ve frontě.',
  },
];

export function ValueProposition() {
  return (
    <section className="mt-24 md:mt-32 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Eyebrow + headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col items-center text-center mb-16"
      >
        <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase block mb-4">
          Co Karel ušetří
        </span>
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.1] text-gray-900 dark:text-gray-100">
          Hodiny práce.<br />
          <span className="text-gray-400 font-light">A reálné peníze.</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl mt-6">
          Každý e-mail, který Karel odbaví sám, je minuta, kterou váš operátor
          nemusí trávit nad rutinou. Při běžném provozu to dělá:
        </p>
      </motion.div>

      {/* Savings stats — honest, calculator-derived */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-20">
        {[
          { label: 'Za e-mail', value: `${SAVINGS.perEmailMinutes} min`, sub: 'ušetřených na každé zprávě' },
          { label: 'Za měsíc', value: `${SAVINGS.perMonthHours} h`, sub: `≈ ${SAVINGS.perMonthCzk} při 420 Kč/h` },
          { label: 'Za rok', value: `${SAVINGS.perYearHours} h`, sub: `≈ ${SAVINGS.perYearCzk} na jednoho operátora` },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + idx * 0.1, ease: 'easeOut' }}
            className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-zinc-900/60 p-8 text-center"
          >
            <div className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
              {stat.value}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</div>
            <div className="text-xs text-gray-400 dark:text-gray-600 font-light">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* For whom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col items-center text-center mb-12"
      >
        <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase block mb-4">
          Pro koho je Karel
        </span>
        <h3 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Týmy, které denně třídí desítky e-mailů
        </h3>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AUDIENCES.map((aud, idx) => {
          const Icon = aud.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + idx * 0.1, ease: 'easeOut' }}
              className="group rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-zinc-900/60 p-8 flex flex-col"
            >
              <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-6 text-gray-700 dark:text-gray-200 group-hover:text-brand transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{aud.title}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed flex-1">
                {aud.text}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* CTA back to the demo */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, ease: 'easeOut' }}
        className="flex justify-center mt-16"
      >
        <a
          href="#demo"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          Vyzkoušejte demo výše
          <ArrowRight className="w-4 h-4" />
        </a>
      </motion.div>
    </section>
  );
}
