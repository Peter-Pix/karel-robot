import { AnalysisResult } from '../types';

/**
 * Escape a value for CSV: wrap in quotes and double any embedded quotes.
 * Handles commas, quotes, and newlines safely.
 */
function escapeCsv(value: string | number): string {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Build a CSV string from a single classification result.
 * One row per classification — the header describes each column.
 */
export function classificationToCsv(result: AnalysisResult): string {
  const header = [
    'akce',
    'akce_popisek',
    'kategorie',
    'status_zakaznika',
    'prijemce',
    'titulek_vystupu',
    'vystup',
    'duvody',
    'lidske_minuty',
    'ai_sekundy',
    'hodinova_sazba_kc',
    'jistota',
  ];

  const row = [
    result.action,
    result.actionLabel,
    result.category,
    result.customerStatus,
    result.recipient,
    result.outputTitle,
    result.output,
    result.reasons.join(' | '),
    result.humanMinutes,
    result.aiSeconds,
    result.hourlyCost,
    result.confidence,
  ];

  return [header, row].map((line) => line.map(escapeCsv).join(',')).join('\n');
}

/**
 * Trigger a browser download of the given CSV content.
 */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
