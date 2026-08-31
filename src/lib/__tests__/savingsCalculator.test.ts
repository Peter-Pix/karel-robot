import { describe, it, expect } from 'vitest';
import {
  calculateSavings,
  savedMinutesWithReview,
  calculateExtendedSavings,
  formatCZK,
  formatMultiplier,
} from '../savingsCalculator';

describe('calculateSavings', () => {
  it('spočítá úsporu minut a korun', () => {
    const s = calculateSavings(60, 60, 600); // 1h lidsky vs 1min AI
    expect(s.savedMinutes).toBe(59);
    expect(s.savedCost).toBeCloseTo(590, 5);
    expect(s.savedPercent).toBeCloseTo(98.33, 1);
  });

  it('nevrátí zápornou úsporu', () => {
    const s = calculateSavings(1, 120, 600); // AI pomalejší než člověk
    expect(s.savedMinutes).toBe(0);
    expect(s.savedCost).toBe(0);
    expect(s.savedPercent).toBe(0);
  });
});

describe('savedMinutesWithReview', () => {
  it('plná automatizace = ušetří celý lidský čas', () => {
    expect(savedMinutesWithReview(10, 1)).toBe(10);
  });

  it('nulová automatizace = ušetří jen rozdíl oproti revizi', () => {
    expect(savedMinutesWithReview(10, 0, 1.5)).toBe(8.5);
  });
});

describe('calculateExtendedSavings', () => {
  it('spočítá denní/týdenní/měsíční/roční úsporu', () => {
    const e = calculateExtendedSavings(10, 600, 20, 21);
    expect(e.daily.hours).toBeCloseTo(3.333, 2);
    expect(e.monthly.hours).toBeCloseTo(70, 2);
    expect(e.yearly.hours).toBeCloseTo(840, 2);
  });
});

describe('formatCZK / formatMultiplier', () => {
  it('formátuje koruny', () => {
    expect(formatCZK(1234)).toContain('Kč');
    expect(formatCZK(1234)).toContain('234');
  });

  it('adaptivní přesnost multiplikátoru', () => {
    expect(formatMultiplier(89.33)).toBe('89,33');
    expect(formatMultiplier(342.2)).toBe('342,2');
    expect(formatMultiplier(1233)).toBe('1\u00A0233');
  });
});
