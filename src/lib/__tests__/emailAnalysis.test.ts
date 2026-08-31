import { describe, it, expect } from 'vitest';
import { LocalDemoEmailAnalyzer } from '../emailAnalysis';
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
