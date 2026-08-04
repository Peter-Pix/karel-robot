import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { X, Info, Sparkles, Zap, TrendingUp, Timer, Check, Eye } from 'lucide-react';
import { formatCZK, formatMultiplier, formatNumber, calculateExtendedSavings, savedMinutesWithReview } from '../lib/savingsCalculator';

const WORKING_DAYS_MONTH = 21;
const REVIEW_MINUTES = 1.5; // quick check an operator spends on non-automated emails

// Karel's signature catchphrases — keeps the brand voice alive in the copy.
const KAREL_LINES = [
  "Dobrý den, mám to tu.",
  "Díky za zprávu, podívám se na to.",
];

interface CompanySavingsDashboardProps {
  humanMinutes: number;
  aiSeconds: number;
  hourlyCost: number;
}

type ModalType = 'time-monthly' | 'cost-monthly' | 'time-yearly' | 'cost-yearly' | null;

export function CompanySavingsDashboard({ humanMinutes, aiSeconds, hourlyCost }: CompanySavingsDashboardProps) {
  const [volume, setVolume] = useState(80);
  // Share of emails Karel handles fully on his own (0.5–1). The rest needs a
  // quick operator check — this keeps the math honest.
  const [automationRate, setAutomationRate] = useState(0.7);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const shouldReduceMotion = useReducedMotion();

  // Real per-email savings, accounting for the share of emails that need a
  // human review (not everything is 100% automated).
  const savedMinutesPerEmail = savedMinutesWithReview(humanMinutes, automationRate, REVIEW_MINUTES);
  // Effective hourly cost: fall back to a realistic operator rate if the model
  // reported 0 (fully automated emails have no human cost to save).
  const effectiveHourlyCost = hourlyCost > 0 ? hourlyCost : 420;

  const extendedSavings = calculateExtendedSavings(savedMinutesPerEmail, effectiveHourlyCost, volume);
  const savedHoursPerMonth = extendedSavings.monthly.hours;
  const savedCzkPerMonth = extendedSavings.monthly.cost;
  const savedHoursPerYear = extendedSavings.yearly.hours;
  const savedCzkPerYear = extendedSavings.yearly.cost;

  // Speed ratio of this specific email (honest, from real inputs).
  const speedRatio = aiSeconds > 0 ? (humanMinutes * 60) / aiSeconds : 1;

  // Time allocation donut — dynamic: how much Karel does alone vs operator review.
  const pieData = useMemo(() => [
    { name: 'Karel odbaví sám', value: Math.round(automationRate * 100), color: '#1C1C1E' },
    { name: 'Operátor jen zkontroluje', value: Math.round((1 - automationRate) * 100), color: '#E5E5EA' },
  ], [automationRate]);

  const itemAnim = shouldReduceMotion
    ? {}
    : { initial: { opacity: 0, y: 20, filter: 'blur(8px)' }, whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' }, viewport: { once: true, margin: '-80px' } };

  return (
    <div className="mt-24 pt-16 border-t border-gray-200 dark:border-gray-800 relative overflow-hidden">
      {/* Ambient cinematic glow */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        animate={shouldReduceMotion ? {} : { opacity: [0.15, 0.3, 0.15], scale: [1, 1.05, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'radial-gradient(ellipse 55% 40% at 50% 0%, rgba(217,160,67,0.10), transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Header — Apple-style, cinematic, with Karel's voice */}
      <motion.div className="text-center mb-16" {...itemAnim}>
        <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-4 block">
          Živý ROI Dashboard
        </span>
        <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-6">
          Stroj času pro váš byznys
        </h2>
        <motion.p
          className="text-base md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-light"
          {...(shouldReduceMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] } })}
        >
          {KAREL_LINES[0]} <span className="text-gray-900 dark:text-gray-100 font-normal">{KAREL_LINES[1]}</span>
          <span className="block mt-3 text-gray-500 dark:text-gray-500">Tento e-mail Karel odbavil za {formatNumber(aiSeconds, 0)} s — {formatMultiplier(speedRatio)}× rychleji, než by to stihl operátor.</span>
        </motion.p>
      </motion.div>

      {/* Controls — volume + automation (honest, human-first) */}
      <motion.div className="max-w-4xl mx-auto mb-20 px-0 sm:px-6 space-y-12" {...itemAnim}>
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <label htmlFor="volume" className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Denní objem e-mailů
            </label>
            <div className="text-5xl md:text-6xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
              {formatNumber(volume, 0)} <span className="text-2xl text-gray-400 font-light lowercase">zpráv / den</span>
            </div>
          </div>
          <div className="relative py-4">
            <input
              id="volume"
              type="range"
              min="10"
              max="5000"
              step="10"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full appearance-none cursor-pointer accent-black dark:accent-brand outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-brand/10 transition-all hover:bg-gray-300 dark:hover:bg-gray-700"
            />
          </div>
          <div className="flex justify-between text-[11px] text-gray-400 font-medium mt-2 tracking-widest uppercase">
            <span>Jednotlivec (10)</span>
            <span>Korporace (5000)</span>
          </div>
        </div>

        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
            <div>
              <label htmlFor="automation" className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Podíl, který Karel zvládne sám
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-light">Zbytek jen letmo zkontroluje operátor — reálný provoz.</p>
            </div>
            <div className="text-4xl md:text-5xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
              {Math.round(automationRate * 100)}<span className="text-2xl text-gray-400 font-light"> %</span>
            </div>
          </div>
          <div className="relative py-4">
            <input
              id="automation"
              type="range"
              min="50"
              max="100"
              step="5"
              value={Math.round(automationRate * 100)}
              onChange={(e) => setAutomationRate(Number(e.target.value) / 100)}
              className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full appearance-none cursor-pointer accent-black dark:accent-brand outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-brand/10 transition-all hover:bg-gray-300 dark:hover:bg-gray-700"
            />
          </div>
          <div className="flex justify-between text-[11px] text-gray-400 font-medium mt-2 tracking-widest uppercase">
            <span>Více lidského dohledu</span>
            <span>Plná automatizace</span>
          </div>
        </div>
      </motion.div>

      {/* Main Metrics — editorial zigzag, each on its own row */}
      <div className="max-w-5xl mx-auto mb-24 space-y-24 md:space-y-28">
        <motion.button
          onClick={() => setActiveModal('time-monthly')}
          className="w-full cursor-pointer transition-all hover:opacity-80 active:opacity-60 outline-none flex flex-col group md:block md:text-left"
          {...itemAnim}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Timer className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Vrácený čas za měsíc</span>
            <Info className="w-3 h-3 text-gray-300 dark:text-gray-600" />
          </div>
          <div className="text-6xl md:text-8xl font-extralight text-gray-900 dark:text-gray-100 tracking-tight">
            {formatNumber(savedHoursPerMonth, 0)} <span className="text-3xl md:text-4xl text-gray-400 font-light">hodin</span>
          </div>
          <div className="text-base text-gray-400 mt-3 font-light">zpět pro váš tým</div>
        </motion.button>

        <motion.button
          onClick={() => setActiveModal('cost-monthly')}
          className="w-full cursor-pointer transition-all hover:opacity-80 active:opacity-60 outline-none flex flex-col group md:block md:text-right"
          {...itemAnim}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        >
          <div className="flex items-center gap-2 mb-3 md:justify-end">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Vrácené peníze za měsíc</span>
            <Info className="w-3 h-3 text-gray-300 dark:text-gray-600" />
          </div>
          <div className="text-6xl md:text-8xl font-extralight text-gray-900 dark:text-gray-100 tracking-tight">
            {formatCZK(savedCzkPerMonth)}
          </div>
          <div className="text-base text-gray-400 mt-3 font-light">místo režijních nákladů</div>
        </motion.button>

        <motion.button
          onClick={() => setActiveModal('time-yearly')}
          className="w-full cursor-pointer transition-all hover:opacity-80 active:opacity-60 outline-none flex flex-col group md:block md:text-left"
          {...itemAnim}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Vrácený čas za rok</span>
            <Info className="w-3 h-3 text-gray-300 dark:text-gray-600" />
          </div>
          <div className="text-6xl md:text-8xl font-extralight text-gray-900 dark:text-gray-100 tracking-tight">
            {formatNumber(savedHoursPerYear / 8, 0)} <span className="text-3xl md:text-4xl text-gray-400 font-light">prac. dní</span>
          </div>
          <div className="text-base text-gray-400 mt-3 font-light">kolega navíc zdarma</div>
        </motion.button>

        <motion.button
          onClick={() => setActiveModal('cost-yearly')}
          className="w-full cursor-pointer transition-all hover:opacity-80 active:opacity-60 outline-none flex flex-col group md:block md:text-right"
          {...itemAnim}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.24 }}
        >
          <div className="flex items-center gap-2 mb-3 md:justify-end">
            <Zap className="w-4 h-4 text-gray-900 dark:text-brand" />
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-900 dark:text-brand">Roční návratnost</span>
            <Info className="w-3 h-3 text-gray-300 dark:text-gray-600" />
          </div>
          <div className="text-6xl md:text-8xl font-extralight text-gray-900 dark:text-brand tracking-tight">
            {formatCZK(savedCzkPerYear)}
          </div>
          <div className="text-base text-gray-400 mt-3 font-light">z první investice do AI</div>
        </motion.button>
      </div>

      {/* Charts Grid — area chart removed (was "na nic") */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 pt-10 border-t border-gray-100 dark:border-gray-800">

        {/* Donut Chart — automation vs review split */}
        <motion.div className="flex flex-col" {...itemAnim} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase block mb-1">Jak to funguje</span>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-xl mb-1 tracking-tight">Karel sám, nebo s dohledem?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-light">Většinu odbaví sám. Zbytek jen letmo zkontrolujete — bez psaní a hledání.</p>
          <div className="grow w-full min-h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black/90 backdrop-blur-md text-white px-3 py-2 rounded-xl text-xs border border-white/10 shadow-lg font-light">
                          <span className="font-semibold">{payload[0].name}</span>: {payload[0].value}%
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-3 mt-4 border-t border-gray-50 dark:border-gray-800/50 pt-4">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center gap-2.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-600 dark:text-gray-400 font-medium">{item.name}</span>
                <span className="ml-auto text-gray-900 dark:text-gray-100 font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Capacity bars — the real wow, keep and polish */}
        <motion.div className="flex flex-col pt-2" {...itemAnim} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
          <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase block mb-1">Výkonnostní strop</span>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-xl mb-1 tracking-tight">Kapacita týmu za jeden den</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-light">Zvýšení propustnosti při stejném počtu operátorů.</p>
          <div className="space-y-8 grow flex flex-col justify-center">
            <div>
              <div className="flex justify-between items-baseline text-xs font-semibold mb-2.5">
                <span className="text-gray-500 dark:text-gray-400 uppercase tracking-widest text-[10px]">Bez AI</span>
                <span className="text-gray-900 dark:text-gray-100 text-sm font-light">{formatNumber(volume, 0)} e-mailů</span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `24%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gray-400 dark:bg-gray-600 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-xs font-semibold mb-2.5">
                <span className="text-gray-900 dark:text-gray-100 uppercase tracking-widest text-[10px]">S Karlem</span>
                <span className="text-gray-900 dark:text-gray-100 text-sm font-medium">{formatNumber(Math.round(volume * 4.2), 0)} e-mailů <span className="text-gray-400 text-xs font-light ml-1">(4.2× navýšení)</span></span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `100%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  className="h-full bg-gray-900 dark:bg-brand rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Learning & Adaptation Section */}
      <motion.div className="mt-20 border-t border-gray-100 dark:border-gray-800 pt-20" {...itemAnim}>
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase block mb-3">Kontinuální rozvoj</span>
          <h3 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-6">
            Roste s vámi. Učí se od vás.
          </h3>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-12 font-light">
            Představte si kolegu, který si pamatuje každé vaše rozhodnutí. Čím déle Karla používáte, tím přesněji se přizpůsobí vašemu tónu komunikace a specifickým procesům.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 text-left mt-16 pt-16 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col">
              <div className="text-gray-900 dark:text-gray-100 font-semibold mb-3 text-lg tracking-tight">Plná automatizace rutiny</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-light">
                Jednoduché úkoly, které model po čase splní s 99,9% jistotou a kvalitou lidského operátora, lze plně automatizovat. Odbaví je okamžitě, aniž by vyžadovaly vaši pozornost.
              </p>
            </div>
            <div className="flex flex-col">
              <div className="text-gray-900 dark:text-gray-100 font-semibold mb-3 text-lg tracking-tight">Blesková kontrola výjimek</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-light">
                U zbylých složitějších případů se návrhy natolik zdokonalí, že proces schvalování se zkrátí na letmý pohled a jedno kliknutí. Zbude vám čas na úkoly, kde je lidský přístup nenahraditelný.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals (unchanged behavior, updated text references) */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setActiveModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -15 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
              className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-10 p-8 md:p-10 dark:bg-[#111] dark:border-gray-800"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {activeModal === 'time-monthly' && (
                <>
                  <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700">
                    <Info className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Ušetřený čas měsíčně</h3>
                  <div className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-6">{formatNumber(savedHoursPerMonth, 0)} <span className="text-xl text-gray-400 font-medium">hodin</span></div>
                  <div className="space-y-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-sans">
                    <p>Na tomto e-mailu by operátor strávil <strong className="text-gray-900 dark:text-gray-100">{formatNumber(humanMinutes, 1)} min</strong>. Karel {Math.round(automationRate * 100)} % zpráv odbaví sám, zbytek jen letmo zkontrolujete (~{REVIEW_MINUTES} min). Výsledná úspora: <strong className="text-gray-900 dark:text-gray-100">{formatNumber(savedMinutesPerEmail, 1)} min na e-mail</strong>.</p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl font-mono text-xs border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                      ({formatNumber(volume, 0)} × {formatNumber(savedMinutesPerEmail, 1)} min) × {WORKING_DAYS_MONTH} / 60 = {formatNumber(savedHoursPerMonth, 0)} h
                    </div>
                  </div>
                </>
              )}

              {activeModal === 'cost-monthly' && (
                <>
                  <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700">
                    <Info className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Úspora měsíčně</h3>
                  <div className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-6">{formatCZK(savedCzkPerMonth)}</div>
                  <div className="space-y-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-sans">
                    <p>Počítáme s efektivní hodinovou sazbou operátora <strong className="text-gray-900 dark:text-gray-100">{formatCZK(effectiveHourlyCost)}/h</strong> (včetně odvodů a režie).</p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl font-mono text-xs border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                      {formatNumber(savedHoursPerMonth, 0)} h × {formatCZK(effectiveHourlyCost)} = {formatCZK(savedCzkPerMonth)}
                    </div>
                  </div>
                </>
              )}

              {activeModal === 'time-yearly' && (
                <>
                  <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700">
                    <Info className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Ušetřený čas ročně</h3>
                  <div className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-6">{formatNumber(savedHoursPerYear / 8, 0)} <span className="text-xl text-gray-400 font-medium">pracovních dní</span></div>
                  <div className="space-y-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-sans">
                    <p>To je <strong className="text-gray-900 dark:text-gray-100">{formatNumber(savedHoursPerYear / 8, 0)} plných pracovních směn</strong> ročně, které tým už nemusí trávit rutinou.</p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl font-mono text-xs border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                      {formatNumber(savedHoursPerMonth, 0)} h × 12 / 8 = {formatNumber(savedHoursPerYear / 8, 0)} dní
                    </div>
                  </div>
                </>
              )}

              {activeModal === 'cost-yearly' && (
                <>
                  <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700">
                    <Info className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Úspora ročně</h3>
                  <div className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-6">{formatCZK(savedCzkPerYear)}</div>
                  <div className="space-y-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-sans">
                    <p>Jde o přímou úsporu mzdových a režijních nákladů. Tyto prostředky můžete promítnout do zisku, nebo je reinvestovat do rozvoje a kvalitnější lidské péče tam, kde je potřeba.</p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl font-mono text-xs border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                      {formatCZK(savedCzkPerMonth)} × 12 = {formatCZK(savedCzkPerYear)}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
