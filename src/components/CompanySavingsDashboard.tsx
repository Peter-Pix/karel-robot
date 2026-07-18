import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, 
  BarChart, Bar, CartesianGrid 
} from 'recharts';
import { X, Info } from 'lucide-react';
import { formatCZK, formatNumber, calculateExtendedSavings } from '../lib/savingsCalculator';

const WORKING_DAYS_MONTH = 21;
const SAVED_MINUTES_PER_EMAIL = 5.9; // 5.9 min as per single email demo
const HOURLY_COST = 400; // 400 CZK as per our updated cost (superhrubá mzda operátora)

type ModalType = 'time-monthly' | 'cost-monthly' | 'time-yearly' | 'cost-yearly' | null;

export function CompanySavingsDashboard() {
  const [volume, setVolume] = useState(80);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Calculate metrics
  const extendedSavings = calculateExtendedSavings(SAVED_MINUTES_PER_EMAIL, HOURLY_COST, volume);
  
  const savedHoursPerMonth = extendedSavings.monthly.hours;
  const savedCzkPerMonth = extendedSavings.monthly.cost;
  const savedHoursPerYear = extendedSavings.yearly.hours;
  const savedCzkPerYear = extendedSavings.yearly.cost;

  // Chart 1: Cumulative Area
  const areaData = useMemo(() => {
    const months = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čvn', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];
    let cumulative = 0;
    return months.map(month => {
      cumulative += savedCzkPerMonth;
      return { month, value: cumulative };
    });
  }, [savedCzkPerMonth]);

  // Chart 2: Time Allocation
  const pieData = useMemo(() => [
    { name: 'Kontrola návrhů AI', value: 15, color: '#E5E5EA' }, // Light Gray
    { name: 'Péče a řešení eskalací', value: 85, color: '#1C1C1E' } // Black
  ], []);

  // Chart 3: Productivity Bar
  const capacityData = useMemo(() => [
    { name: 'Bez AI', kapacita: volume, color: '#8E8E93' },
    { name: 'S Karlem', kapacita: Math.round(volume * 4.2), color: '#1C1C1E' }
  ], [volume]);

  const CustomTooltipArea = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-md text-white p-3 rounded-xl shadow-lg border border-white/10 text-sm">
          <div className="font-semibold mb-1">{label}</div>
          <div>Úspora: {formatCZK(payload[0].value)}</div>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipBar = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-md text-white p-3 rounded-xl shadow-lg border border-white/10 text-sm">
          <div className="font-semibold mb-1">{label}</div>
          <div>Kapacita: {formatNumber(payload[0].value, 0)} e-mailů/den</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-24 pt-16 border-t border-gray-100 dark:border-gray-800 relative">
      <div className="text-center mb-16">
        <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-3 block">
          Živý ROI Dashboard
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-4">
          Stroj času pro váš byznys
        </h2>
        <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
          Zkuste si posunout objem komunikace a sledujte v reálném čase, jak se vám investice do automatizace vrací zpět.
        </p>
      </div>

      {/* Volume Slider */}
      <div className="max-w-4xl mx-auto mb-20 px-0 sm:px-6">
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

      {/* Main Metrics (Premium Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-20 max-w-5xl mx-auto">
        <button 
          onClick={() => setActiveModal('time-monthly')}
          className="text-left cursor-pointer transition-all hover:opacity-70 active:opacity-50 outline-none flex flex-col group"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Ušetřený čas měsíčně</span>
            <Info className="w-3 h-3 text-gray-300 dark:text-gray-600 transition-colors" />
          </div>
          <motion.div className="text-3xl md:text-4xl font-medium text-gray-900 dark:text-gray-100 tracking-tight mt-1">
            {formatNumber(savedHoursPerMonth, 0)} h
          </motion.div>
        </button>

        <button 
          onClick={() => setActiveModal('cost-monthly')}
          className="text-left cursor-pointer transition-all hover:opacity-70 active:opacity-50 outline-none flex flex-col group"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Úspora nákladů měsíčně</span>
            <Info className="w-3 h-3 text-gray-300 dark:text-gray-600 transition-colors" />
          </div>
          <motion.div className="text-3xl md:text-4xl font-medium text-gray-900 dark:text-gray-100 tracking-tight mt-1">
            {formatCZK(savedCzkPerMonth)}
          </motion.div>
        </button>

        <button 
          onClick={() => setActiveModal('time-yearly')}
          className="text-left cursor-pointer transition-all hover:opacity-70 active:opacity-50 outline-none flex flex-col group"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Ušetřený čas ročně</span>
            <Info className="w-3 h-3 text-gray-300 dark:text-gray-600 transition-colors" />
          </div>
          <motion.div className="text-3xl md:text-4xl font-medium text-gray-900 dark:text-gray-100 tracking-tight mt-1">
            {formatNumber(savedHoursPerYear, 0)} h
          </motion.div>
        </button>

        <button 
          onClick={() => setActiveModal('cost-yearly')}
          className="text-left cursor-pointer transition-all hover:opacity-70 active:opacity-50 outline-none flex flex-col group"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-900 dark:text-brand">Roční úspora nákladů</span>
            <Info className="w-3 h-3 text-gray-300 dark:text-gray-600 transition-colors" />
          </div>
          <motion.div className="text-3xl md:text-4xl font-medium text-gray-900 dark:text-brand tracking-tight mt-1">
            {formatCZK(savedCzkPerYear)}
          </motion.div>
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 pt-10 border-t border-gray-100 dark:border-gray-800">
        
        {/* Cumulative Area Chart */}
        <div className="lg:col-span-2 flex flex-col">
          <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase block mb-1">Předpověď návratnosti</span>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-xl mb-1 tracking-tight">Kumulovaná finanční úspora</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-light">Návratnost investice do AI během prvního roku.</p>
          <div className="h-72 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUspora" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1C1C1E" stopOpacity={0.06}/>
                    <stop offset="95%" stopColor="#1C1C1E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F7" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#8E8E93', fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#8E8E93', fontWeight: 500 }}
                  tickFormatter={(value) => value >= 1000000 ? `${(value/1000000).toFixed(1)}M` : `${value/1000}k`}
                  width={40}
                />
                <Tooltip content={<CustomTooltipArea />} cursor={{ stroke: '#E5E5EA', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#1C1C1E" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorUspora)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase block mb-1">Organizace práce</span>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-xl mb-1 tracking-tight">Rozložení času s AI</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-light">Operátoři se věnují lidem, ne rutině.</p>
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
        </div>

        {/* Capacity Bar Chart */}
        <div className="flex flex-col lg:col-span-3 pt-12 mt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase block mb-1">Výkonnostní strop</span>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-xl mb-1 tracking-tight">Kapacita týmu za jeden den</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Zvýšení propustnosti při stejném počtu operátorů.</p>
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-baseline text-xs font-semibold mb-2.5">
                <span className="text-gray-500 dark:text-gray-400 uppercase tracking-widest text-[10px]">Bez AI</span>
                <span className="text-gray-900 dark:text-gray-100 text-sm font-light">{formatNumber(volume, 0)} e-mailů</span>
              </div>
              <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex rounded-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `24%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gray-400 dark:bg-gray-600 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-xs font-semibold mb-2.5">
                <span className="text-gray-900 dark:text-gray-100 uppercase tracking-widest text-[10px]">S Karlem</span>
                <span className="text-gray-900 dark:text-gray-100 text-sm font-medium">{formatNumber(Math.round(volume * 4.2), 0)} e-mailů <span className="text-gray-400 text-xs font-light ml-1">(4.2x navýšení)</span></span>
              </div>
              <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex rounded-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `100%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="h-full bg-gray-900 dark:bg-brand rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Learning & Adaptation Section */}
      <div className="mt-20 border-t border-gray-100 dark:border-gray-800 pt-20">
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
      </div>

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
              className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-10 p-8 md:p-10"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-50 outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              {activeModal === 'time-monthly' && (
                <>
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-900 border border-gray-100">
                    <Info className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Ušetřený čas měsíčně</h3>
                  <div className="text-4xl font-extrabold text-gray-900 tracking-tight mb-6">{formatNumber(savedHoursPerMonth, 0)} <span className="text-xl text-gray-400 font-medium">hodin</span></div>
                  
                  <div className="space-y-4 text-sm text-gray-500 leading-relaxed font-sans">
                    <p>
                      <strong>Jak jsme to spočítali:</strong> Každý den obdržíte průměrně <strong>{formatNumber(volume, 0)} e-mailů</strong>.
                    </p>
                    <p>
                      Víme z ukázky, že nasazení Karla ušetří přibližně <strong>{SAVED_MINUTES_PER_EMAIL} minuty</strong> času operátora na jednom zpracovaném e-mailu, protože místo zdlouhavého hledání odpovědí a psaní textu se operátor pouze rozhoduje a schvaluje.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-xl font-mono text-xs border border-gray-100 text-gray-700">
                      Výpočet: ({volume} e-mailů × {SAVED_MINUTES_PER_EMAIL} min) × {WORKING_DAYS_MONTH} prac. dní / 60 = {formatNumber(savedHoursPerMonth, 0)} hod
                    </div>
                  </div>
                </>
              )}

              {activeModal === 'cost-monthly' && (
                <>
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-900 border border-gray-100">
                    <Info className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Úspora měsíčně</h3>
                  <div className="text-4xl font-extrabold text-gray-900 tracking-tight mb-6">{formatCZK(savedCzkPerMonth)}</div>
                  
                  <div className="space-y-4 text-sm text-gray-500 leading-relaxed font-sans">
                    <p>
                      <strong>Jak jsme to spočítali:</strong> Vycházíme z průměrné superhrubé mzdy operátora, která činí odhadem <strong>{HOURLY_COST} Kč/hod</strong> (včetně odvodů, nástrojů a režijních nákladů na zaměstnance).
                    </p>
                    <p>
                      Znásobíme měsíčně ušetřený čas ({formatNumber(savedHoursPerMonth, 0)} hodin) touto hodinovou nákladovou sazbou.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-xl font-mono text-xs text-gray-700 border border-gray-100">
                      Výpočet: {formatNumber(savedHoursPerMonth, 0)} ušetřených hodin × {HOURLY_COST} Kč = {formatCZK(savedCzkPerMonth)}
                    </div>
                  </div>
                </>
              )}

              {activeModal === 'time-yearly' && (
                <>
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-900 border border-gray-100">
                    <Info className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Ušetřený čas ročně</h3>
                  <div className="text-4xl font-extrabold text-gray-900 tracking-tight mb-6">{formatNumber(savedHoursPerYear / 8, 0)} <span className="text-xl text-gray-400 font-medium">pracovních dní</span></div>
                  
                  <div className="space-y-4 text-sm text-gray-500 leading-relaxed font-sans">
                    <p>
                      <strong>Co to reálně znamená:</strong> Tento údaj představuje, o kolik pracovních dní (počítáno jako standardní 8hodinová směna) se sníží celková roční administrativní zátěž.
                    </p>
                    <p>
                      Díky tomu se nebudete muset obávat náhlých špiček (např. předvánoční sezóny) a tým nebude přetížen rutinou.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-xl font-mono text-xs border border-gray-100 text-gray-700">
                      Výpočet: {formatNumber(savedHoursPerMonth, 0)} hodin měsíčně × 12 měsíců / 8 hodin = {formatNumber(savedHoursPerYear / 8, 0)} dní
                    </div>
                  </div>
                </>
              )}

              {activeModal === 'cost-yearly' && (
                <>
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-900 border border-gray-100">
                    <Info className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Úspora ročně</h3>
                  <div className="text-4xl font-extrabold text-gray-900 tracking-tight mb-6">{formatCZK(savedCzkPerYear)}</div>
                  
                  <div className="space-y-4 text-sm text-gray-500 leading-relaxed font-sans">
                    <p>
                      <strong>Celkový dopad na roční P&L:</strong> Jde o přímou úsporu mzdových a režijních nákladů díky redukci času stráveného rutinním odbavováním zpráv.
                    </p>
                    <p>
                      Tyto ušetřené prostředky můžete buď promítnout přímo do zisku vaší společnosti, nebo je využít jako rozpočet pro další inovace a rozvoj vašeho podnikání, případně jako prostor pro kvalitnější a osobnější lidskou péči tam, kde je opravdu potřeba.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-xl font-mono text-xs text-gray-700 border border-gray-100">
                      Výpočet: {formatCZK(savedCzkPerMonth)} měsíčně × 12 měsíců = {formatCZK(savedCzkPerYear)}
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
