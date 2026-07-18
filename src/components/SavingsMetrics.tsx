import React from 'react';
import { calculateSavings, formatCZK, formatNumber } from '../lib/savingsCalculator';
import { Clock, ShieldCheck, TrendingUp, User } from 'lucide-react';

interface SavingsMetricsProps {
  humanMinutes: number;
  aiSeconds: number;
  hourlyCost: number;
}

export function SavingsMetrics({ humanMinutes, aiSeconds, hourlyCost }: SavingsMetricsProps) {
  const { savedMinutes, savedCost, savedPercent } = calculateSavings(humanMinutes, aiSeconds, hourlyCost);

  return (
    <div className="mt-16 pt-16 border-t border-gray-100 dark:border-gray-800 transition-all">
      <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase block mb-2">Analýza efektivity</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Dopad jednoho e-mailu</h3>
        </div>
        <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
          Karel v1.0 • ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
        
        {/* Card 1: Human */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Bez AI</span>
          </div>
          <div className="text-4xl md:text-5xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
            {formatNumber(humanMinutes, 0)} <span className="text-lg font-normal text-gray-400">min</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-light">Ruční zpracování</div>
        </div>

        {/* Card 2: AI */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-gray-900 dark:text-brand" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-900 dark:text-brand">S Karlem</span>
          </div>
          <div className="text-4xl md:text-5xl font-medium text-gray-900 dark:text-gray-100 tracking-tight">
            {formatNumber(aiSeconds, 0)} <span className="text-lg font-normal text-gray-400">s</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-light">Okamžitá analýza</div>
        </div>

        {/* Card 3: Saved Time */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Ušetřený čas</span>
          </div>
          <div className="text-4xl md:text-5xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
            {formatNumber(savedMinutes)} <span className="text-lg font-normal text-gray-400">min</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-light">{formatNumber(savedPercent, 0)} % původního času</div>
        </div>

        {/* Card 4: Cost Saved */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Úspora nákladů</span>
          </div>
          <div className="text-4xl md:text-5xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
            {formatCZK(savedCost)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-light">Při sazbě {formatCZK(hourlyCost)}/h</div>
        </div>

      </div>

      <p className="text-[11px] text-gray-400 mt-16 leading-relaxed max-w-3xl font-light">
        * Modelový odhad pro účely demonstrace. Skutečná úspora se v praxi vypočítává z reálně změřených časů odbavení, mzdové náročnosti a podílu automaticky vyřízených požadavků.
      </p>
    </div>
  );
}
