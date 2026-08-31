import { describe, it, expect } from 'vitest';
import { classificationToCsv } from '../csvExport';
import { AnalysisResult } from '../../types';

const sample: AnalysisResult = {
  action: 'ESCALATE',
  actionLabel: 'Předat právnímu týmu',
  category: 'Výpověď smlouvy',
  customerStatus: 'Platící zákazník',
  recipient: 'legal@firma.cz',
  outputTitle: 'Eskalace',
  output: 'Zákazník vypovídá smlouvu, obsahuje hrozbu.',
  reasons: ['Výpověď', 'Hrozba právním krokem'],
  humanMinutes: 12,
  aiSeconds: 3,
  hourlyCost: 600,
  confidence: 0.95,
};

describe('classificationToCsv', () => {
  it('vytvoří hlavičku a jeden řádek s daty klasifikace', () => {
    const csv = classificationToCsv(sample);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(2);

    const header = lines[0].split(',');
    expect(header).toContain('akce');
    expect(header).toContain('jistota');

    const row = lines[1];
    expect(row.startsWith('ESCALATE')).toBe(true);
    expect(row.endsWith('0.95')).toBe(true);
  });

  it('escapuje čárky a uvozovky v textových polích', () => {
    const withComma: AnalysisResult = {
      ...sample,
      output: 'Obsahuje, čárku a "uvozovky"',
    };
    const csv = classificationToCsv(withComma);
    expect(csv).toContain('"Obsahuje, čárku a ""uvozovky"""');
  });

  it('spojí důvody do jednoho sloupce odděleného |', () => {
    const csv = classificationToCsv(sample);
    const row = csv.split('\n')[1];
    expect(row).toContain('Výpověď | Hrozba právním krokem');
  });
});
