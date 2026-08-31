import { describe, it, expect, vi, afterEach } from 'vitest';
import { LocalDemoEmailAnalyzer, ApiEmailAnalyzer, AnalysisError } from '../emailAnalysis';
import type { EmailInput } from '../../types';

const analyzer = new LocalDemoEmailAnalyzer();

function input(overrides: Partial<EmailInput>): EmailInput {
  return {
    sender: 'zakaznik@novycloud.cz',
    subject: '',
    body: '',
    ...overrides,
  };
}

describe('LocalDemoEmailAnalyzer', () => {
  it('klasifikuje výpověď jako ESCALATE', async () => {
    const res = await analyzer.analyze(input({
      subject: 'Výpověď smlouvy',
      body: 'Tímto podávám výpověď smlouvy s okamžitou platností.',
    }));
    expect(res.action).toBe('ESCALATE');
  });

  it('klasifikuje výpadek s kompenzací jako ACKNOWLEDGE', async () => {
    const res = await analyzer.analyze(input({
      subject: 'Výpadek připojení',
      body: 'Máme opakovaný výpadek a žádáme o kompenzaci.',
    }));
    expect(res.action).toBe('ACKNOWLEDGE');
  });

  it('klasifikuje neznámého odesílatele jako DRAFT', async () => {
    const res = await analyzer.analyze(input({
      sender: 'nekdo@seznam.cz',
      subject: 'Dotaz',
      body: 'Dobrý den, mám dotaz k vašim službám.',
    }));
    expect(res.action).toBe('DRAFT');
  });

  it('klasifikuje běžný administrativní požadavek jako DRAFT', async () => {
    const res = await analyzer.analyze(input({
      subject: 'Změna fakturační adresy',
      body: 'Prosím o změnu fakturační adresy.',
    }));
    expect(res.action).toBe('DRAFT');
  });
});

describe('ApiEmailAnalyzer — fallback UX (chyba místo špatné klasifikace)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('předá serverovou chybovou zprávu jako AnalysisError (503)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: 'Služba je dočasně nedostupná. Zkuste to prosím později.' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const api = new ApiEmailAnalyzer('deepseek-v4-flash');
    await expect(api.analyze(input({ subject: 'Výpověď', body: 'Výpověď smlouvy.' })))
      .rejects.toBeInstanceOf(AnalysisError);

    try {
      await api.analyze(input({ subject: 'Výpověď', body: 'Výpověď smlouvy.' }));
    } catch (err) {
      const e = err as AnalysisError;
      expect(e.message).toBe('Služba je dočasně nedostupná. Zkuste to prosím později.');
      expect(e.retryable).toBe(true);
      expect(e.status).toBe(503);
    }
  });

  it('označí 4xx chybu jako ne-retryable (konfigurace / klíč)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Neplatný API klíč.' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const api = new ApiEmailAnalyzer('deepseek-v4-flash');
    try {
      await api.analyze(input({ subject: 'Dotaz', body: 'Dobrý den.' }));
    } catch (err) {
      const e = err as AnalysisError;
      expect(e.message).toBe('Neplatný API klíč.');
      expect(e.retryable).toBe(false);
      expect(e.status).toBe(401);
    }
  });

  it('použije generickou zprávu, když server nevrátí JSON error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    });
    vi.stubGlobal('fetch', fetchMock);

    const api = new ApiEmailAnalyzer('deepseek-v4-flash');
    try {
      await api.analyze(input({ subject: 'Dotaz', body: 'Dobrý den.' }));
    } catch (err) {
      const e = err as AnalysisError;
      expect(e.message).toContain('Analýza se nezdařila');
      expect(e.retryable).toBe(true);
      expect(e.status).toBe(500);
    }
  });
});
